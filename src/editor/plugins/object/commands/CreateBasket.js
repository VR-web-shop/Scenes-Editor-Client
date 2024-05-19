import CreateObject from './CreateObject.js'
import * as THREE from 'three'
import { toRaw } from 'vue'
/**
 * @extends Command
 * @class
 * @classdesc CreateBasket create basket object
 */
export default class CreateBasket extends CreateObject {

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
     * @throws {Error} if meshName is not a string
     */
    constructor(objectType, labelName, id, meshName, position, rotation, scale, recordData) {
        super(objectType, labelName, id, meshName, position, rotation, scale, recordData)
    }

    async execute() {
        super.execute()

        const { plugins, view } = this.invoker.options
        const { objects, caches } = plugins
        const { scene } = view

        if (caches == null) {
            throw new Error('Dependency Error: Unable to find caches plugin')
        }

        if (objects == null) {
            throw new Error('Dependency Error: Unable to find objects plugin')
        }

        const meshCache = caches.find('meshes')
        if (meshCache === null) {
            throw new Error('Cache Error: Unable to find mesh cache')
        }

        const object = objects.findByIdAndType(this.id, 'Basket');
        const { 
            object_offset_client_side_uuid: objectOffset,
            placeholder_client_side_uuid, 
            pocket_client_side_uuid, 
            pocket_offset_client_side_uuid: pocketOffset, 
            placeholder_offset_client_side_uuid: placeholderOffset,
            insert_area_offset_client_side_uuid: insertAreaOffset, 
            insert_area_size_client_side_uuid: insertAreaSize,
        } = toRaw(object.options.recordData);
        
        // Create placeholder
        if (placeholder_client_side_uuid) {
            const placeholder = meshCache.clone(placeholder_client_side_uuid)
            if (!placeholder) {
                throw new Error('Unable to clone placeholder')
            }

            placeholder.position.copy(object.object.position.clone()
                .add(new THREE.Vector3(
                    placeholderOffset.x,
                    placeholderOffset.y,
                    placeholderOffset.z
                )));
            object.object.add(placeholder);
            object.options.placeholder = placeholder;
        }

        // Create pocket
        if (pocket_client_side_uuid) {
            const pocket = meshCache.clone(pocket_client_side_uuid)
            if (!pocket) {
                throw new Error('Unable to clone pocket')
            }

            const character = objects.findByType('Character');
            const characterObject = character.object;
            const headOffset = 0.5; // VR Vector3d.zero = the position of the head
            pocket.position.copy(new THREE.Vector3(
                pocketOffset.x,
                pocketOffset.y + headOffset,
                pocketOffset.z
            ));
            characterObject.add(pocket);
            object.options.pocket = pocket;
        }

        const fakeHand = meshCache.clone("FAKE_HAND")
        if (!fakeHand) {
            throw new Error('Unable to clone FAKE_HAND')
        }

        // Create fake hand
        fakeHand.position.copy(new THREE.Vector3(
            objectOffset.x,
            -objectOffset.y,
            objectOffset.z
        ));
        object.object.add(fakeHand);
        object.options.fakeHand = fakeHand;

        // Create insert area
        const insertAreaPosition = new THREE.Vector3(
            insertAreaOffset.x,
            insertAreaOffset.y,
            insertAreaOffset.z
        );
        const cubeGeometry = new THREE.BoxGeometry(insertAreaSize.x, insertAreaSize.y, insertAreaSize.z);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.copy(insertAreaPosition);
        object.object.add(cube);
        object.options.insertArea = cube;
    }
}
