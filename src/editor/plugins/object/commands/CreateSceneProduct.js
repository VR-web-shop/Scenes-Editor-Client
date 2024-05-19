import CreateObject from './CreateObject.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import * as THREE from 'three'

let font;
let textOptions;

function createText(text, color = 0x000000, options = textOptions) {
    return new THREE.Mesh(
        new TextGeometry(text, options),
        [
            new THREE.MeshBasicMaterial( { color } ), // front
            new THREE.MeshBasicMaterial( { color } ) // side
        ]
    );
}

/**
 * @extends Command
 * @class
 * @classdesc CreateSceneProduct create scene product object
 */
export default class CreateSceneProduct extends CreateObject {

    /**
     * @constructor
     * 
     * @param {string} objectType the type of the object
     * @param {string} labelName the label name of the object
     * @param {string} id the id of the object
     * @param {string} meshName the name of the mesh to create
     * @param {object} position the position of the object (optional)
     * @param {object} rotation the rotation of the object (optional)
     * @param {object} scale the scale of the object (optional)
     * @param {object} recordData the record data of the object (optional)
     * @param {object} valuta the valuta of the object (optional)
     * @throws {Error} if meshName is not a string
     */
    constructor(objectType, labelName, id, meshName, position, rotation, scale, recordData, valuta={short:'DKK'}) {
        super(objectType, labelName, id, meshName, position, rotation, scale, recordData)

        this.valuta = valuta
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    async execute() {
        super.execute()

        if (!font) {
            const loader = new FontLoader();
            font = await loader.loadAsync('fonts/helvetiker_regular.typeface.json');
            textOptions = { font, size: 0.05, height: 0.01 }
        }

        const { plugins, view } = this.invoker.options
        const { objects } = plugins
        const { scene } = view
        if (objects === null) {
            throw new Error('Dependency Error: Unable to find objects plugin')
        }

        const object = objects.find(this.id);

        const { 
            ui_offset_position_client_side_uuid: opV, 
            ui_offset_rotation_client_side_uuid: orV, 
            ui_scale_client_side_uuid: sV,
            product 
        } = object.options.recordData;
        const uiPosition = new THREE.Vector3(opV.x, opV.y, opV.z);
        const uiRotation = new THREE.Euler(orV.x, orV.y, orV.z);
        const uiScale = new THREE.Vector3(sV.x, sV.y, sV.z);
        
        const short = this.valuta.short;
        const nameText = createText(product.name)
        const priceText = createText(`${product.price} ${short}`) 
        const outOfStockText = createText('Out of stock', 0xff0000)
        const wrapper = new THREE.Object3D()
        
        wrapper.add(nameText);
        wrapper.add(priceText);
        wrapper.add(outOfStockText);

        const x = uiPosition.x;
        const y = uiPosition.y;
        const z = uiPosition.z;
        wrapper.position.set(x, y, z)
        nameText.position.set(0, 0.1, 0)
        priceText.position.set(0, 0.0, 0)
        outOfStockText.position.set(0, 0.2, 0)

        wrapper.rotation.copy(uiRotation);
        wrapper.scale.copy(uiScale);
        
        object.object.add(wrapper);
        object.options.ui = wrapper
    }
}
