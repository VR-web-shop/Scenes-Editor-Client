import { useSceneSDK } from "./useScenesSDK.js";
import { useProductsSDK } from "./useProductsSDK.js";
import { useEditorEntity } from "./useEditorEntity.js";
import { useWebsocket } from "./useWebsocket.js";
import { useNotifications } from "./useNotifications.js";

import LoadMesh from "../editor/plugins/cache/commands/LoadMesh.js";
import ReadObjects from "../editor/plugins/object/readers/ReadObjects.js";

const { sdk } = useSceneSDK();
const productsCtrl = useProductsSDK();
const editorEntityCtrl = useEditorEntity();
const notificationCtrl = useNotifications();
const ws = useWebsocket();

const getVectors = async (entities, attributes) => {
    const vector3dIds = entities.map(e => {
        return attributes.map(attribute => e[attribute]);
    }).flat();
    const { rows: vectors } = await sdk.Vector3D.batchByUUID(vector3dIds);
    entities.forEach((element, index) => {
        for (const attribute of attributes) {
            const vector_client_side_uuid = element[attribute];
            const vector = vectors.find(v => v.client_side_uuid === vector_client_side_uuid);
            entities[index][attribute] = { ...vector, vector_client_side_uuid };
        }
    });
};

const getProducts = async (entities) => {
    const productIds = entities.map(e => e.product_client_side_uuid);
    const { rows: products } = await sdk.Product.batchByUUID(productIds);
    entities.forEach((element, index) => {
        const product_client_side_uuid = element.product_client_side_uuid;
        const product = products.find(p => p.client_side_uuid === product_client_side_uuid);
        entities[index].product = { ...product, product_client_side_uuid };
    });
};

export function useScene() {
    let editor;

    function setEditor(newEditor) {
        editor = newEditor;
        return this;
    }

    async function loadEditorMeshes() {
        const fakeHandUrl = 'meshes/fake-hand.glb';
        const fakeCameraUrl = 'meshes/fake-camera.glb';
        const fakeCharacterUrl = 'meshes/fake-character.glb';

        await editor.invoke(new LoadMesh('FAKE_HAND', fakeHandUrl, []));
        await editor.invoke(new LoadMesh('FAKE_CAMERA', fakeCameraUrl, []));
        await editor.invoke(new LoadMesh('FAKE_CHARACTER', fakeCharacterUrl, []));
    }

    async function loadScene() {
        if (!editor) throw new Error('Editor not set');
        await productsCtrl.start();
        await loadEditorMeshes();

        const { rows } = await sdk.Scene.active();
        
        if (rows.length == 0) {
            throw new Error(`No active scene found`);
        }

        const scene = rows[0];

        await getVectors([scene.scene_character], [
            'position_client_side_uuid',
            'rotation_client_side_uuid',
        ]);
        await getVectors([scene.scene_camera], [
            'position_client_side_uuid',
            'rotation_client_side_uuid',
        ]);
        await getVectors([scene.scene_basket], [
            'position_client_side_uuid',
            'rotation_client_side_uuid',
            'scale_client_side_uuid',
            'object_offset_client_side_uuid',
            'placeholder_offset_client_side_uuid',
            'pocket_offset_client_side_uuid',
            'insert_area_size_client_side_uuid',
            'insert_area_offset_client_side_uuid',
        ]);
        
        await editorEntityCtrl.updateSceneBackground(scene.scene_background);
        await editorEntityCtrl.createCamera(scene.scene_camera);
        await editorEntityCtrl.createCharacter(scene.scene_character);
        await editorEntityCtrl.createBasket(scene.scene_basket);

        await getVectors(scene.scene_checkouts, [
            'position_client_side_uuid',
            'rotation_client_side_uuid',
            'scale_client_side_uuid',
            'surface_offset_client_side_uuid',
            'surface_size_client_side_uuid',
            'ui_offset_position_client_side_uuid',
            'ui_offset_rotation_client_side_uuid',
            'ui_scale_client_side_uuid'
        ]);
        for (const checkout of scene.scene_checkouts) {
            await editorEntityCtrl.createCheckout(checkout);
        }

        await getVectors(scene.scene_floors, [
            'position_client_side_uuid',
            'rotation_client_side_uuid',
            'scale_client_side_uuid',
        ]);
        for (const floor of scene.scene_floors) {
            await editorEntityCtrl.createFloor(floor);
        }

        await getVectors(scene.scene_static_objects, [
            'position_client_side_uuid',
            'rotation_client_side_uuid',
            'scale_client_side_uuid',
        ]);
        for (const staticObject of scene.scene_static_objects) {
            await editorEntityCtrl.createStaticObject(staticObject);
        }

        await getVectors(scene.scene_lights, [
            'position_client_side_uuid',
            'rotation_client_side_uuid',
        ]);
        for (const light of scene.scene_lights) {
            await editorEntityCtrl.createLight(light);
        }

        await getVectors(scene.scene_products, [
            'position_client_side_uuid',
            'rotation_client_side_uuid',
            'scale_client_side_uuid',
            'ui_offset_position_client_side_uuid', 
            'ui_offset_rotation_client_side_uuid', 
            'ui_scale_client_side_uuid',
        ]);
        await getProducts(scene.scene_products);
        for (const product of scene.scene_products) {
            await editorEntityCtrl.createProduct(product);
        }

        ws.addEventListener(ws.EVENTS.SCENES_NEW_SCENE_PRODUCT, async (event) => {
            const { payload } = event;
            await editorEntityCtrl.createProduct(payload);
            await notificationCtrl.sync();
        });

        ws.addEventListener(ws.EVENTS.SCENES_DELETE_SCENE_PRODUCT, async (event) => {
            const { payload } = event;
            await editorEntityCtrl.removeProduct(payload.uuid);
            await notificationCtrl.sync();
        });
    }

    async function saveScene() {
        if (!editor) throw new Error('Editor not set');

        const savables = ['Light', 'Product', 'Floor', 'Checkout', 'StaticObject', 'Camera', 'Character'];
        const reader = await editor.newReader(ReadObjects, editor);
        const objects = await reader.read();
        for (let object of objects) {
            const object3D = object.object;
            const { position, rotation, scale } = object3D;
            const { objectType, id, recordData } = object.options;
            const isSavable = savables.includes(objectType);

            if (isSavable) {
                if (!recordData.Position || !recordData.Rotation) {
                    console.error(`Position or Rotation not found for with ID ${id} and it cannot be saved.`, recordData);
                    continue;
                }

                if (recordData.Position.x !== position.x || recordData.Position.y !== position.y || recordData.Position.z !== position.z) {
                    const positionUUID = recordData.Position.uuid;
                    await sdk.Vector3d.update({ uuid: positionUUID, x: position.x, y: position.y, z: position.z });
                }

                if (recordData.Rotation.x !== rotation.x || recordData.Rotation.y !== rotation.y || recordData.Rotation.z !== rotation.z) {
                    const rotationUUID = recordData.Rotation.uuid;
                    await sdk.Vector3d.update({ uuid: rotationUUID, x: rotation.x, y: rotation.y, z: rotation.z });
                }

                if (recordData.Scale && (recordData.Scale.x !== scale.x || recordData.Scale.y !== scale.y || recordData.Scale.z !== scale.z)) {
                    const scaleUUID = recordData.Scale.uuid;
                    await sdk.Vector3d.update({ uuid: scaleUUID, x: scale.x, y: scale.y, z: scale.z });
                }
            }
        }
    }

    async function loadAllMaterials(page = 1) {
        if (!editor) throw new Error('Editor not set');

        const { rows, pages } = await sdk.Material.findAll(page, 100, { fields: [
            {key: 'include', value: 'materialtexture:material_client_side_uuid<client_side_uuid'}
        ] });
        for (const material of rows) {
            await editorEntityCtrl.createMaterial(material, material.Texture);
        }

        if (page < pages) {
            await loadAllMaterials(page + 1);
        }
    }

    async function loadAllTextures(page = 1) {
        if (!editor) throw new Error('Editor not set');

        const { rows, pages } = await sdk.Texture.findAll(page, 100);
        for (const texture of rows) {
            //await editorEntityCtrl.createTexture(texture);
        }

        if (page < pages) {
            await loadAllTextures(page + 1);
        }
    }

    async function loadAllMeshes(page = 1) {
        if (!editor) throw new Error('Editor not set');

        const { rows, pages } = await sdk.Mesh.findAll( 
            page, 100, { fields: [
                {key: 'include', value: 'material.MeshMaterial'},
            ]}
        );

        for (const mesh of rows) {
            const submeshes = mesh.mesh_materials?.map(mesh_material => {
                return { 
                    submesh_name: mesh_material.submesh_name, 
                    material: { client_side_uuid: mesh_material.material_client_side_uuid }
                };
            }) || [];

            await editorEntityCtrl.createMesh(mesh, submeshes);
        }

        if (page < pages) {
            await loadAllMeshes(page + 1);
        }
    }

    return {
        setEditor,
        saveScene,
        loadScene,
        loadAllMaterials,
        loadAllTextures,
        loadAllMeshes
    };
}