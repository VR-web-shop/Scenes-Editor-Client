import { router } from '../router.js';
import { useSceneSDK } from './useScenesSDK.js';
import { usePopups } from './usePopups.js';
import { ref } from 'vue';
import { getVectors } from './util.js';

const notifications = ref([]);
const callbacks = {};
const id = ref(0);
const TYPES = {
    SCENE_PRODUCT_MESH_REQUIRED: 'Scene Product Mesh Required',
}

export const useNotifications = () => {

    const add = (type, msg, solve) => {
        notifications.value.push({type, msg, solve, id: id.value++});
    };

    const sync = async () => {
        notifications.value = [];
        
        const sceneUUID = router.currentRoute.value.params.client_side_uuid;
        const { sdk } = useSceneSDK();
        const { rows } = await sdk.Scene.active();
        const scene = rows[0];
        const sceneProducts = scene.scene_products;
        const sceneBasket = scene.scene_basket;

        const productsWithoutMesh = sceneProducts.filter(row => !row.mesh_client_side_uuid);
        if (productsWithoutMesh.length > 0) {
            await getVectors(productsWithoutMesh, [
                'position_client_side_uuid',
                'rotation_client_side_uuid',
                'scale_client_side_uuid',
                'ui_offset_position_client_side_uuid', 
                'ui_offset_rotation_client_side_uuid', 
                'ui_scale_client_side_uuid',
            ]);
            add(TYPES.SCENE_PRODUCT_MESH_REQUIRED, 
                `You got ${productsWithoutMesh.length} products without a mesh`,
                () => {
                    const row = productsWithoutMesh.shift();
                    usePopups().open('objects-edit-scene-product', {
                        recordData: {...row}
                    })
                }
            );
        }        

        const basketWithoutMesh = sceneBasket && !sceneBasket.object_client_side_uuid;

        if (basketWithoutMesh) {
            await getVectors([sceneBasket], [
                'position_client_side_uuid',
                'rotation_client_side_uuid',
                'scale_client_side_uuid',
                'object_offset_client_side_uuid',
                'placeholder_offset_client_side_uuid',
                'pocket_offset_client_side_uuid',
                'insert_area_size_client_side_uuid',
                'insert_area_offset_client_side_uuid',
            ]);
            add(TYPES.SCENE_PRODUCT_MESH_REQUIRED, 
                `You got a basket without a mesh`,
                () => {
                    usePopups().open('objects-edit-basket', {
                        recordData: {...sceneBasket}
                    })
                }
            );
        }

        if (notifications.value.length > 0) {
            Object.values(callbacks).forEach(cb => cb(notifications.value));
        }
    };

    const setCallback = (name, cb) => {
        callbacks[name] = cb;
    }

    const removeCallback = (name) => {
        delete callbacks[name];
    }

    return {
        notifications,
        add,
        sync,
        setCallback,
        removeCallback,
        TYPES
    }
}