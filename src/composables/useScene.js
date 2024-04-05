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

    async function loadScene(sceneUUID) {
        if (!editor) throw new Error('Editor not set');
        await productsCtrl.start();
        await loadEditorMeshes();

        const { rows } = await sdk.api.SceneController.findAll({
            limit: 100, where: { uuid: sceneUUID }, include: [
                { model: 'SceneCamera', include: ['Position', 'Rotation'] },
                { model: 'SceneLights', include: ['Position', 'Rotation'] },
                { model: 'SceneStaticObjects', include: ['Position', 'Rotation', 'Scale', 'Mesh'] },
                { model: 'SceneFloors', include: ['Position', 'Rotation', 'Scale', 'Mesh'] },
                { model: 'SceneBasket', include: ['Position', 'Rotation', 'Scale', 'Object', 'Placeholder', 'Pocket', 'ObjectOffset', 'PlaceholderOffset', 'PocketOffset', 'InsertAreaOffset', 'InsertAreaSize'] },
                { model: 'SceneCheckouts', include: ['Position', 'Rotation', 'Scale', 'SurfaceOffset', 'SurfaceSize', 'UIOffsetPosition', 'UIOffsetRotation', 'UIScale', 'Mesh'] },
                { model: 'SceneProducts', include: ['Position', 'Rotation', 'Scale', 'Mesh', 'Product', 'UIOffsetPosition', 'UIOffsetRotation', 'UIScale'] },
                { model: 'SceneBackground' },
                { model: 'SceneCharacter', include: ['Position', 'Rotation'] }

            ]
        });

        if (rows.length === 0) {
            throw new Error(`Scene with UUID ${sceneUUID} not found`);
        }

        const scene = rows[0];
        const {
            SceneBackground, SceneBasket, SceneCheckouts,
            SceneFloors, SceneStaticObjects, SceneLights,
            SceneCamera, SceneProducts, SceneCharacter
        } = scene;

        await editorEntityCtrl.updateSceneBackground(SceneBackground);
        
        if (SceneCamera) {
            await editorEntityCtrl.createCamera(SceneCamera);
        }

        if (SceneCharacter) {
            await editorEntityCtrl.createCharacter(SceneCharacter);
        }

        if (SceneBasket.Object) {
            // Note must be the character object
            await editorEntityCtrl.createBasket(SceneBasket);
        }

        for (const checkout of SceneCheckouts) {
            await editorEntityCtrl.createCheckout(checkout);
        }

        for (const floor of SceneFloors) {
            await editorEntityCtrl.createFloor(floor);
        }

        for (const staticObject of SceneStaticObjects) {
            await editorEntityCtrl.createStaticObject(staticObject);
        }

        for (const light of SceneLights) {
            await editorEntityCtrl.createLight(light);
        }

        for (const product of SceneProducts) {
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

                const positionUUID = recordData.Position.uuid;
                const rotationUUID = recordData.Rotation.uuid;

                await sdk.api.Vector3DController.update({ uuid: positionUUID, x: position.x, y: position.y, z: position.z });
                await sdk.api.Vector3DController.update({ uuid: rotationUUID, x: rotation.x, y: rotation.y, z: rotation.z });

                if (recordData.Scale) {
                    const scaleUUID = recordData.Scale.uuid;
                    await sdk.api.Vector3DController.update({ uuid: scaleUUID, x: scale.x, y: scale.y, z: scale.z });
                }
            }
        }
    }

    async function loadAllMaterials(page = 1) {
        if (!editor) throw new Error('Editor not set');

        const { rows, pages } = await sdk.api.MaterialController.findAll({ page, limit: 100, include: [{ model: 'Texture' }] });
        for (const material of rows) {
            await editorEntityCtrl.createMaterial(material, material.Texture);
        }

        if (page < pages) {
            await loadAllMaterials(page + 1);
        }
    }

    async function loadAllTextures(page = 1) {
        if (!editor) throw new Error('Editor not set');

        const { rows, pages } = await sdk.api.TextureController.findAll({ page, limit: 100 });
        for (const texture of rows) {
            await editorEntityCtrl.createTexture(texture);
        }

        if (page < pages) {
            await loadAllTextures(page + 1);
        }
    }

    async function loadAllMeshes(page = 1) {
        if (!editor) throw new Error('Editor not set');

        const { rows, pages } = await sdk.api.MeshController.findAll({ page, limit: 100, include: [{ model: 'Material' }] });
        for (const mesh of rows) {
            const submeshes = mesh.Material.map(m => {
                return { submesh_name: m.MeshMaterial.submesh_name, material: m};
            })
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