import { useEditor } from "./useEditor.js";
import { useProductsSDK } from "./useProductsSDK.js";

import SetSceneColor from "../editor/src/view/commands/SetSceneColor.js";

import CreateObject from "../editor/plugins/object/commands/CreateObject.js";
import UpdateObject from "../editor/plugins/object/commands/UpdateObject.js";
import RemoveObject from "../editor/plugins/object/commands/RemoveObject.js";

import CreateLight from "../editor/plugins/object/commands/CreateLight.js";
import UpdateLight from "../editor/plugins/object/commands/UpdateLight.js";

import CreateCheckout from "../editor/plugins/object/commands/CreateCheckout.js";
import UpdateCheckout from "../editor/plugins/object/commands/UpdateCheckout.js";

import CreateBasket from "../editor/plugins/object/commands/CreateBasket.js";
import UpdateBasket from "../editor/plugins/object/commands/UpdateBasket.js";

import CreateSceneProduct from "../editor/plugins/object/commands/CreateSceneProduct.js";
import UpdateSceneProduct from "../editor/plugins/object/commands/UpdateSceneProduct.js";
import RemoveSceneProduct from "../editor/plugins/object/commands/RemoveSceneProduct.js";

import LoadTexture from "../editor/plugins/cache/commands/LoadTexture.js";
import LoadMaterial from "../editor/plugins/cache/commands/LoadMaterial.js";
import LoadMesh from "../editor/plugins/cache/commands/LoadMesh.js";

import { toRaw } from "vue";

const productsCtrl = useProductsSDK();
const editor = useEditor();
const OBJECT_TYPE = {
    STATIC_OBJECT: 'StaticObject',
    DYNAMIC_OBJECT: 'DynamicObject',
    LIGHT: 'Light',
    CAMERA: 'Camera',
    FLOOR: 'Floor',
    PRODUCT: 'Product',
    CHECKOUT: 'Checkout',
    CHARACTER: 'Character',
    BASKET: 'Basket'
}


export function useEditorEntity() {

    async function removeObject(uuid) {
        await editor.invoke(new RemoveObject(uuid));
    }

    async function createStaticObject(staticObject) {
        await editor.invoke(new CreateObject(OBJECT_TYPE.STATIC_OBJECT,
            staticObject.name,
            staticObject.client_side_uuid,
            staticObject.mesh_client_side_uuid,
            staticObject.position_client_side_uuid,
            staticObject.rotation_client_side_uuid,
            staticObject.scale_client_side_uuid,
            staticObject
        ))
    }

    async function updateStaticObject(staticObject) {
        const { name, client_side_uuid, mesh_client_side_uuid } = staticObject;
        await editor.invoke(new UpdateObject(
            client_side_uuid, 
            name, 
            mesh_client_side_uuid, 
            staticObject
        ));
    }

    async function createLight(light) {
        await editor.invoke(new CreateLight(
            light.name,
            light.client_side_uuid, 
            light.scene_light_type_name,
            light.intensity,
            light.hex_color,
            light.position_client_side_uuid,
            light.rotation_client_side_uuid,
            light
        ));
    }

    async function updateLight(light) {
        await editor.invoke(new UpdateLight(
            light.client_side_uuid,
            light.name,
            light.scene_light_type_name, 
            light.intensity,
            light.hex_color,
            light
        ));
    }

    async function createFloor(floor) {
        await editor.invoke(new CreateObject(
            OBJECT_TYPE.FLOOR, 
            floor.name,
            floor.client_side_uuid, 
            floor.mesh_client_side_uuid, 
            floor.position_client_side_uuid, 
            floor.rotation_client_side_uuid,
            floor.scale_client_side_uuid,
            floor
        ));
    }

    async function updateFloor(floor) {
        await editor.invoke(new UpdateObject(
            floor.client_side_uuid, 
            floor.name, 
            floor.mesh_client_side_uuid, 
            floor
        ));
    }

    async function createProduct(sceneProduct) {
        if (!sceneProduct.mesh_client_side_uuid) return;
        const valuta = productsCtrl.valuta.value;
        await editor.invoke(new CreateSceneProduct(
            OBJECT_TYPE.PRODUCT, 
            sceneProduct.product.name, 
            sceneProduct.client_side_uuid, 
            sceneProduct.mesh_client_side_uuid, 
            sceneProduct.position_client_side_uuid,
            sceneProduct.rotation_client_side_uuid,
            sceneProduct.scale_client_side_uuid,
            sceneProduct, 
            valuta
        ));
    }

    async function updateProduct(sceneProduct) {
        if (!sceneProduct.Mesh) return;
        const valuta = productsCtrl.valuta.value;
        await editor.invoke(new UpdateSceneProduct(
            OBJECT_TYPE.PRODUCT, 
            sceneProduct.product.name,
            sceneProduct.client_side_uuid,
            sceneProduct.mesh_client_side_uuid,
            sceneProduct.position_client_side_uuid,
            sceneProduct.rotation_client_side_uuid,
            sceneProduct.scale_client_side_uuid,
            sceneProduct, 
            valuta
        ));
    }

    async function removeProduct(uuid) {
        await editor.invoke(new RemoveSceneProduct(uuid));
    }

    async function createCheckout(checkout) {
        await editor.invoke(new CreateCheckout(
            OBJECT_TYPE.CHECKOUT, 
            checkout.name, 
            checkout.client_side_uuid, 
            checkout.mesh_client_side_uuid, 
            checkout.position_client_side_uuid,
            checkout.rotation_client_side_uuid, 
            checkout.scale_client_side_uuid, 
            checkout
        ));
    }

    async function updateCheckout(checkout) {
        await editor.invoke(new UpdateCheckout(
            OBJECT_TYPE.CHECKOUT, 
            checkout.name,
            checkout.client_side_uuid, 
            checkout.mesh_client_side_uuid,
            checkout.position_client_side_uuid,
            checkout.rotation_client_side_uuid,
            checkout.scale_client_side_uuid,
            checkout
        ));
    }

    async function createBasket(basket) {
        if (!basket.object_client_side_uuid) return;

        const name = 'Scene Basket';
        await editor.invoke(new CreateBasket(
            OBJECT_TYPE.BASKET, 
            name, 
            basket.client_side_uuid, 
            basket.object_client_side_uuid,
            basket.position_client_side_uuid,
            basket.rotation_client_side_uuid,
            basket.scale_client_side_uuid,
            basket
        ));
    }

    async function updateBasket(basket) {
        if (!basket.object_client_side_uuid) return;

        const name = 'Scene Basket';
        await editor.invoke(new UpdateBasket(
            OBJECT_TYPE.BASKET, 
            name, 
            basket.client_side_uuid,
            basket.object_client_side_uuid,
            basket.position_client_side_uuid,
            basket.rotation_client_side_uuid,
            basket.scale_client_side_uuid,
            basket
        ));
    }

    async function createMesh(mesh, submeshConfigurations=[]) {
        const submeshes = submeshConfigurations.map((submesh) => {
            return new LoadMesh.SubMeshConfiguration(submesh.submesh_name, submesh.material.client_side_uuid);
        });
        await editor.invoke(new LoadMesh(mesh.client_side_uuid, mesh.source, submeshes));
    }

    async function createTexture(texture) {
        const { client_side_uuid, source, texture_type_name } = texture;
        await editor.invoke(new LoadTexture(client_side_uuid, source, texture_type_name));
    }

    async function createMaterial(material, textures=[]) {
        const textureNames = textures.map(t => t.client_side_uuid);
        const { client_side_uuid, material_type_name } = material;
        //await editor.invoke(new LoadMaterial(client_side_uuid, material_type_name, textureNames));
    }

    async function createCamera(camera) {
        console.log(camera);
        const name = 'Scene Camera';
        const mesh = 'FAKE_CAMERA';
        const scale = {x: 1, y: 1, z: 1};
        await editor.invoke(new CreateObject(
            OBJECT_TYPE.CAMERA, 
            name, 
            camera.client_side_uuid, 
            mesh, 
            camera.position_client_side_uuid, 
            camera.rotation_client_side_uuid,
            scale, 
            camera
        ));
    }

    async function createCharacter(character) {
        console.log(character);
        const name = 'Scene Character';
        const mesh = 'FAKE_CHARACTER';
        const scale = {x: 1, y: 1, z: 1};
        await editor.invoke(new CreateObject(
            OBJECT_TYPE.CHARACTER, 
            name, 
            character.client_side_uuid, 
            mesh, 
            character.position_client_side_uuid, 
            character.rotation_client_side_uuid,
            scale, 
            character
        ));
    }

    async function updateSceneBackground(sceneBackground) {
        const { hex } = sceneBackground;
        await editor.invoke(new SetSceneColor(hex));
    }

    return {
        createMesh,
        createTexture,
        createMaterial,
        createCamera,
        createCharacter,
        createStaticObject,
        updateStaticObject,
        createLight,
        updateLight,
        createFloor,
        updateFloor,
        createProduct,
        updateProduct,
        createCheckout,
        updateCheckout,
        createBasket,
        updateBasket,
        updateSceneBackground,
        removeObject
    }
}
