import { router } from '../router.js';
import { useSceneSDK } from './useScenesSDK.js';
import { usePopups } from './usePopups.js';
import { ref } from 'vue';

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
        
        const sceneUUID = router.currentRoute.value.params.sceneUUID;
        const { sdk } = useSceneSDK();
        const { rows } = await sdk.api.SceneProductController.findAll({ 
            limit: 1000, 
            where: { 
                scene_uuid: sceneUUID,
                state_name: 'MeshRequired'
            },
            include: [
                { model: 'Product' }
            ]
        })

        if (rows.length === 0) {
            return;
        }

        add(TYPES.SCENE_PRODUCT_MESH_REQUIRED, 
            `You got ${rows.length} products without a mesh`,
            () => {
                const row = rows.shift();
                usePopups().open('objects-edit-scene-product', {
                    recordData: {...row}
                })
            }
        );

        Object.values(callbacks).forEach(cb => cb(notifications.value));
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