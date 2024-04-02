import { useEditor } from "./useEditor.js";

import SetSceneColor from "../editor/src/view/commands/SetSceneColor.js";

import CreateObject from "../editor/plugins/object/commands/CreateObject.js";
import UpdateObject from "../editor/plugins/object/commands/UpdateObject.js";

import CreateLight from "../editor/plugins/object/commands/CreateLight.js";
import UpdateLight from "../editor/plugins/object/commands/UpdateLight.js";

import CreateCheckout from "../editor/plugins/object/commands/CreateCheckout.js";
import UpdateCheckout from "../editor/plugins/object/commands/UpdateCheckout.js";

import CreateBasket from "../editor/plugins/object/commands/CreateBasket.js";
import UpdateBasket from "../editor/plugins/object/commands/UpdateBasket.js";

import LoadTexture from "../editor/plugins/cache/commands/LoadTexture.js";
import LoadMaterial from "../editor/plugins/cache/commands/LoadMaterial.js";
import LoadMesh from "../editor/plugins/cache/commands/LoadMesh.js";

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

    async function createStaticObject(staticObject) {
        const { name, uuid, Mesh, Position, Rotation, Scale } = staticObject;
        await editor.invoke(new CreateObject(OBJECT_TYPE.STATIC_OBJECT,
            name, uuid, Mesh.uuid, Position, Rotation, Scale, staticObject
        ))
    }

    async function updateStaticObject(staticObject) {
        const { name, uuid, Mesh } = staticObject;
        await editor.invoke(new UpdateObject(uuid, name, Mesh.uuid, staticObject));
    }

    async function createLight(light) {
        const { name, uuid, scene_light_type_name, intensity, hexColor, Position, Rotation } = light;
        await editor.invoke(new CreateLight(
            name, uuid, scene_light_type_name, intensity, hexColor, Position, Rotation, light
        ));
    }

    async function updateLight(light) {
        const { name, uuid, scene_light_type_name, intensity, hexColor } = light;
        await editor.invoke(new UpdateLight(uuid, name, scene_light_type_name, intensity, hexColor, light));
    }

    async function createFloor(floor) {
        const { name, uuid, Mesh, Position, Rotation, Scale } = floor;
        await editor.invoke(new CreateObject(
            OBJECT_TYPE.FLOOR, name, uuid, Mesh.uuid, Position, Rotation, Scale, floor
        ));
    }

    async function updateFloor(floor) {
        const { name, uuid, Mesh } = floor;
        await editor.invoke(new UpdateObject(
            uuid, name, Mesh.uuid, floor
        ));
    }

    async function createProduct(sceneProduct) {
        if (!sceneProduct.Mesh) return;

        const { uuid, Mesh, Product, Position, Rotation, Scale } = sceneProduct;
        await editor.invoke(new CreateObject(
            OBJECT_TYPE.PRODUCT, Product.name, uuid, Mesh.uuid, Position, Rotation, Scale, sceneProduct
        ));
    }

    async function updateProduct(sceneProduct) {
        if (!sceneProduct.Mesh) return;

        const { uuid, Mesh, Product } = sceneProduct;
        await editor.invoke(new UpdateObject(
            uuid, Product.name, Mesh.uuid, sceneProduct
        ));
    }

    async function createCheckout(checkout) {
        const { name, uuid, Mesh, Position, Rotation, Scale } = checkout;
        await editor.invoke(new CreateCheckout(
            OBJECT_TYPE.CHECKOUT, name, uuid, Mesh.uuid, Position, Rotation, Scale, checkout
        ));
    }

    async function updateCheckout(checkout) {
        const { name, uuid, Mesh } = checkout;
        await editor.invoke(new UpdateCheckout(
            uuid, name, Mesh.uuid, checkout
        ));
    }

    async function createBasket(basket) {
        if (!basket.Object) return;

        const { uuid, Object, Position, Rotation, Scale } = basket;
        const name = 'Scene Basket';
        await editor.invoke(new CreateBasket(
            OBJECT_TYPE.BASKET, name, uuid, Object.uuid, Position, Rotation, Scale, basket
        ));
    }

    async function updateBasket(basket) {
        if (!basket.Object) return;
        console.log(basket);

        const { uuid, Object, Position, Rotation, Scale } = basket;
        const name = 'Scene Basket';
        await editor.invoke(new UpdateBasket(
            OBJECT_TYPE.BASKET, name, uuid, Object.uuid, Position, Rotation, Scale, basket
        ));
    }

    async function createMesh(mesh, submeshConfigurations=[]) {
        const submeshes = submeshConfigurations.map((submesh) => {
            return new LoadMesh.SubMeshConfiguration(submesh.submesh_name, submesh.material.name);
        });
        await editor.invoke(new LoadMesh(mesh.uuid, mesh.source, submeshes));
    }

    async function createTexture(texture) {
        const { uuid, source, texture_type_name } = texture;
        await editor.invoke(new LoadTexture(uuid, source, texture_type_name));
    }

    async function createMaterial(material, textures=[]) {
        const textureNames = textures.map(t => t.uuid);
        await editor.invoke(new LoadMaterial(material.uuid, material.material_type_name, textureNames));
    }

    async function createCamera(camera) {
        const { uuid, Position, Rotation } = camera;
        const name = 'Scene Camera';
        const mesh = 'FAKE_CAMERA';
        const scale = {x: 1, y: 1, z: 1};
        await editor.invoke(new CreateObject(
            OBJECT_TYPE.CAMERA, name, uuid, mesh, Position, Rotation, scale, camera
        ));
    }

    async function createCharacter(character) {
        const { uuid, Position, Rotation } = character;
        const name = 'Scene Character';
        const mesh = 'FAKE_CHARACTER';
        const scale = {x: 1, y: 1, z: 1};
        await editor.invoke(new CreateObject(
            OBJECT_TYPE.CHARACTER, name, uuid, mesh, Position, Rotation, scale, character
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
        updateSceneBackground
    }
}
