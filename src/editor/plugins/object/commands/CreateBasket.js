import CreateObject from './CreateObject.js'
import * as THREE from 'three'

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

        const object = objects.find(this.id);
        const { ObjectOffset, Placeholder, PlaceholderOffset, InsertAreaOffset, InsertAreaSize } = object.options.recordData;

        // Create placeholder
        if (Placeholder) {
            const placeholder = meshCache.clone(Placeholder.uuid)
            if (!placeholder) {
                throw new Error('Unable to clone placeholder')
            }

            placeholder.position.copy(object.object.position.clone()
                .add(new THREE.Vector3(
                    PlaceholderOffset.x, 
                    PlaceholderOffset.y, 
                    PlaceholderOffset.z
                )));
            scene.add(placeholder);
            object.options.placeholder = placeholder;
        }

        const fakeHand = meshCache.clone("FAKE_HAND")
        if (!fakeHand) {
            throw new Error('Unable to clone FAKE_HAND')
        }

        // Create fake hand
        fakeHand.position.copy(object.object.position.clone()
            .sub(new THREE.Vector3(
                ObjectOffset.x, 
                ObjectOffset.y, 
                ObjectOffset.z
            )));
        scene.add(fakeHand);
        object.options.fakeHand = fakeHand;

        // Create insert area
        const insertAreaPosition = object.object.position.clone()
            .add(new THREE.Vector3(
                InsertAreaOffset.x, 
                InsertAreaOffset.y, 
                InsertAreaOffset.z
            ));
        const cubeGeometry = new THREE.BoxGeometry(InsertAreaSize.x, InsertAreaSize.y, InsertAreaSize.z);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.copy(insertAreaPosition);
        scene.add(cube);
        object.options.insertArea = cube;
    }
}
