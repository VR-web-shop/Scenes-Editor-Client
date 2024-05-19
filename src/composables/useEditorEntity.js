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
        const { name, client_side_uuid, mesh_client_side_uuid, Position, Rotation, Scale } = staticObject;
        await editor.invoke(new CreateObject(OBJECT_TYPE.STATIC_OBJECT,
            name, 
            client_side_uuid, 
            mesh_client_side_uuid, 
            Position, 
            Rotation, 
            Scale, 
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
        const { name, client_side_uuid, scene_light_type_name, intensity, hexColor, Position, Rotation } = light;
        await editor.invoke(new CreateLight(
            name, 
            client_side_uuid, 
            scene_light_type_name, 
            intensity, 
            hexColor, 
            Position,
            Rotation, 
            light
        ));
    }

    async function updateLight(light) {
        const { name, client_side_uuid, scene_light_type_name, intensity, hexColor } = light;
        await editor.invoke(new UpdateLight(
            client_side_uuid, 
            name, 
            scene_light_type_name, 
            intensity, 
            hexColor, 
            light
        ));
    }

    async function createFloor(floor) {
        const { name, client_side_uuid, mesh_client_side_uuid, Position, Rotation, Scale } = floor;
        await editor.invoke(new CreateObject(
            OBJECT_TYPE.FLOOR, 
            name, 
            client_side_uuid, 
            mesh_client_side_uuid, 
            Position, 
            Rotation, 
            Scale, 
            floor
        ));
    }

    async function updateFloor(floor) {
        const { name, client_side_uuid, mesh_client_side_uuid } = floor;
        await editor.invoke(new UpdateObject(
            client_side_uuid, 
            name, 
            mesh_client_side_uuid, 
            floor
        ));
    }

    async function createProduct(sceneProduct) {
        if (!sceneProduct.Mesh) return;
        const valuta = productsCtrl.valuta.value;
        const { client_side_uuid, mesh_client_side_uuid, Product, Position, Rotation, Scale } = sceneProduct;
        await editor.invoke(new CreateSceneProduct(
            OBJECT_TYPE.PRODUCT, 
            Product.name, 
            client_side_uuid, 
            mesh_client_side_uuid, 
            Position, 
            Rotation, 
            Scale, 
            sceneProduct, 
            valuta
        ));
    }

    async function updateProduct(sceneProduct) {
        if (!sceneProduct.Mesh) return;
        const valuta = productsCtrl.valuta.value;
        const { client_side_uuid, mesh_client_side_uuid, Product, Position, Rotation, Scale } = sceneProduct;
        await editor.invoke(new UpdateSceneProduct(
            OBJECT_TYPE.PRODUCT, 
            Product.name, 
            client_side_uuid, 
            mesh_client_side_uuid, 
            Position, 
            Rotation, 
            Scale, 
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
        const { name, client_side_uuid, mesh_client_side_uuid, Position, Rotation, Scale } = checkout;
        await editor.invoke(new UpdateCheckout(
            OBJECT_TYPE.CHECKOUT, 
            name, 
            client_side_uuid, 
            mesh_client_side_uuid, 
            Position, 
            Rotation, 
            Scale, 
            checkout
        ));
    }

    async function createBasket(basket) {
        if (!basket.Object) return;

        const { client_side_uuid, object_client_side_uuid, Position, Rotation, Scale } = basket;
        const name = 'Scene Basket';
        await editor.invoke(new CreateBasket(
            OBJECT_TYPE.BASKET, 
            name, 
            client_side_uuid, 
            object_client_side_uuid, 
            Position, 
            Rotation, 
            Scale, 
            basket
        ));
    }

    async function updateBasket(basket) {
        if (!basket.Object) return;
        console.log(basket);

        const { client_side_uuid, object_client_side_uuid, Position, Rotation, Scale } = basket;
        const name = 'Scene Basket';
        await editor.invoke(new UpdateBasket(
            OBJECT_TYPE.BASKET, 
            name, 
            client_side_uuid, 
            object_client_side_uuid, 
            Position, 
            Rotation, 
            Scale, 
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
        const textureNames = textures.map(t => t.uuid);
        const { client_side_uuid, material_type_name } = material;
        await editor.invoke(new LoadMaterial(client_side_uuid, material_type_name, textureNames));
    }

    async function createCamera(camera) {
        const { client_side_uuid, Position, Rotation } = camera;
        const name = 'Scene Camera';
        const mesh = 'FAKE_CAMERA';
        const scale = {x: 1, y: 1, z: 1};
        await editor.invoke(new CreateObject(
            OBJECT_TYPE.CAMERA, 
            name, 
            client_side_uuid, 
            mesh, 
            Position, 
            Rotation, 
            scale, 
            camera
        ));
    }

    async function createCharacter(character) {
        const { client_side_uuid, Position, Rotation } = character;
        const name = 'Scene Character';
        const mesh = 'FAKE_CHARACTER';
        const scale = {x: 1, y: 1, z: 1};
        await editor.invoke(new CreateObject(
            OBJECT_TYPE.CHARACTER, 
            name, 
            client_side_uuid, 
            mesh, 
            Position, 
            Rotation, 
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
