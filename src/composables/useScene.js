import { useSceneSDK } from "./useScenesSDK.js";

import LoadMaterial from "../editor/plugins/cache/commands/LoadMaterial.js";
import LoadTexture from "../editor/plugins/cache/commands/LoadTexture.js";
import LoadMesh from "../editor/plugins/cache/commands/LoadMesh.js";

import CreateLight from "../editor/plugins/object/commands/CreateLight.js";
import CreateObject from "../editor/plugins/object/commands/CreateObject.js";
import SetSceneColor from "../editor/src/view/commands/SetSceneColor.js";

import ReadObjects from "../editor/plugins/object/readers/ReadObjects.js";

const { sdk } = useSceneSDK();

export function useScene() {
    let editor;

    function setEditor(newEditor) {
        editor = newEditor;
        return this;
    }

    async function loadScene(sceneUUID) {
        if (!editor) throw new Error('Editor not set');

        const { rows } = await sdk.api.SceneController.findAll({ limit: 100, where: { uuid: sceneUUID }, include: [
            { model: 'SceneCamera', include: ['Position', 'Rotation'] },
            { model: 'SceneLights', include: ['Position', 'Rotation'] },
            { model: 'SceneStaticObjects', include: ['Position', 'Rotation', 'Scale', 'Mesh'] },
            { model: 'SceneFloors', include: ['Position', 'Rotation', 'Scale', 'Mesh'] },
            { model: 'SceneBasket', include: ['Position', 'Rotation', 'Scale', 'Object', 'Placeholder', 'ObjectOffset', 'PlaceholderOffset'] },
            { model: 'SceneCheckouts', include: ['Position', 'Rotation', 'Scale', 'SurfaceOffset', 'SurfaceSize', 'UIOffset', 'UIRotation', 'Mesh'] },
            { model: 'SceneProducts', include: ['Position', 'Rotation', 'Scale', 'Mesh', 'Product'] },
            { model: 'SceneBackground' }
            
        ]});
        
        if (rows.length === 0) {
            throw new Error(`Scene with UUID ${sceneUUID} not found`);
        }

        const scene = rows[0];
        const { 
            SceneBackground, SceneBasket, SceneCheckouts, 
            SceneFloors, SceneStaticObjects, SceneLights, 
            SceneCamera, SceneProducts 
        } = scene;
        
        await editor.invoke(new SetSceneColor(SceneBackground.hex));
        await editor.invoke(new CreateObject(
            'Basket',
            'Scene Basket', 
            SceneBasket.uuid, 
            SceneBasket.Object.uuid, 
            SceneBasket.Position, 
            SceneBasket.Rotation, 
            SceneBasket.Scale,
            SceneBasket
        ));
        await editor.invoke(new CreateObject(
            'BasketPlaceholder',
            'Scene Basket Placeholder', 
            SceneBasket.uuid+'-basket-placeholder', 
            SceneBasket.Placeholder.uuid, 
            SceneBasket.Position, 
            SceneBasket.Rotation, 
            SceneBasket.Scale,
            SceneBasket
        ));
    
        for (const checkout of SceneCheckouts) {
            await editor.invoke(new CreateObject(
                'Checkout',
                checkout.name, 
                checkout.uuid, 
                checkout.Mesh.uuid, 
                checkout.Position, 
                checkout.Rotation, 
                checkout.Scale,
                checkout
            ));
        }
        
        for (const floor of SceneFloors) {
            await editor.invoke(new CreateObject(
                'Floor',
                floor.name, 
                floor.uuid, 
                floor.Mesh.uuid, 
                floor.Position, 
                floor.Rotation, 
                floor.Scale,
                floor
            ));
        }

        for (const staticObject of SceneStaticObjects) {
            await editor.invoke(new CreateObject(
                'StaticObject',
                staticObject.name, 
                staticObject.uuid, 
                staticObject.Mesh.uuid, 
                staticObject.Position, 
                staticObject.Rotation, 
                staticObject.Scale,
                staticObject
            ));
        }

        if (SceneLights.length > 0) {
            for (const light of SceneLights) {
                await editor.invoke(new CreateLight(
                    light.name, 
                    light.uuid, 
                    light.scene_light_type_name, 
                    light.intensity, 
                    light.hexColor, 
                    light.Position, 
                    light.Rotation, 
                    light.Scale,
                    light
                ));
            }
        } else {
            await editor.invoke(new CreateLight(
                'Default Light', 
                'default-light', 
                'AmbientLight', 
                1, 
                '#ffffff', 
                {x: 0, y: 10, z: 0}, 
                {x: 0, y: 0, z: 0}, 
                {x: 1, y: 1, z: 1},
                {}
            ));
        }

        for (const product of SceneProducts) {
            if (!product.Mesh) {
                continue;
            }
            await editor.invoke(new CreateObject(
                'Product',
                product.Product.name, 
                product.uuid,
                product.Mesh.uuid, 
                product.Position, 
                product.Rotation, 
                product.Scale,
                product
            ));
        }
    }

    async function saveScene(sceneUUID) {
        if (!editor) throw new Error('Editor not set');

        const reader = await editor.newReader(ReadObjects, editor);
        const objects = await reader.read();
        for (let object of objects) {
            const object3D = object.object;
            const { position, rotation, scale } = object3D;
            const { objectType, id, recordData } = object.options;

            if (objectType === 'Light' || 
                objectType === 'Product' || 
                objectType === 'Floor' || 
                objectType === 'Checkout' || 
                objectType === 'StaticObject') {
                const positionUUID = recordData.Position.uuid;
                const rotationUUID = recordData.Rotation.uuid;

                await sdk.api.Vector3DController.update({
                    uuid: positionUUID,
                    x: position.x,
                    y: position.y,
                    z: position.z
                });

                await sdk.api.Vector3DController.update({
                    uuid: rotationUUID,
                    x: rotation.x,
                    y: rotation.y,
                    z: rotation.z
                });
            }
            console.log({
                position, rotation, scale, objectType, id, recordData
            });
        }
    }

    async function loadAllMaterials(page = 1) {
        if (!editor) throw new Error('Editor not set');

        const { rows, pages } = await sdk.api.MaterialController.findAll({ page, limit: 100, include: [{ model:'Texture'}] });
        for (const material of rows) {
            const textureNames = material.Texture.map(texture => texture.name);
            await editor.invoke(new LoadMaterial(material.name, material.material_type_name, textureNames));
        }
    
        if (page < pages) {
            await loadAllMaterials(page + 1);
        }
    }
    
    async function loadAllTextures(page = 1) {
        if (!editor) throw new Error('Editor not set');

        const { rows, pages } = await sdk.api.TextureController.findAll({ page, limit: 100 });
        for (const texture of rows) {
            await editor.invoke(new LoadTexture(texture.name, texture.source, texture.texture_type_name));
        }
    
        if (page < pages) {
            await loadAllTextures(page + 1);
        }
    }

    async function loadAllMeshes(page = 1) {
        if (!editor) throw new Error('Editor not set');

        const { rows, pages } = await sdk.api.MeshController.findAll({ page, limit: 100, include: [{ model:'Material'}] });
        for (const mesh of rows) {
            const submeshes = mesh.Material.map(m => (new LoadMesh.SubMeshConfiguration(m.MeshMaterial.submesh_name, m.name)));
            await editor.invoke(new LoadMesh(mesh.uuid, `${mesh.source}`, submeshes));
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