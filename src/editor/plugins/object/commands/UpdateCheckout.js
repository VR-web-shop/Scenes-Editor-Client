import UpdateObject from './UpdateObject.js'
import * as THREE from 'three'

/**
 * @extends Command
 * @class
 * @classdesc UpdateCheckout update checkout object
 */
export default class UpdateCheckout extends UpdateObject {

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

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    async execute() {
        super.execute()

        const { plugins, view } = this.invoker.options
        const { objects } = plugins
        const { scene } = view
        if (objects === null) {
            throw new Error('Dependency Error: Unable to find objects plugin')
        }

        const object = objects.find(this.id);
        const { surface, ui } = object.options;

        scene.remove(surface);
        scene.remove(ui);
        
        const { SurfaceOffset, SurfaceSize } = object.options.recordData;
        const surfacePosition = object.object.position.clone()
            .add(new THREE.Vector3(SurfaceOffset.x, SurfaceOffset.y, SurfaceOffset.z));
        const cubeGeometry = new THREE.BoxGeometry(SurfaceSize.x, SurfaceSize.y, SurfaceSize.z);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.copy(surfacePosition);
        scene.add(cube);

        const { UIOffset, UIRotation } = object.options.recordData;
        const uiPosition = object.object.position.clone()
            .add(new THREE.Vector3(UIOffset.x, UIOffset.y, UIOffset.z));
        const uiRotation = new THREE.Euler(UIRotation.x, UIRotation.y, UIRotation.z);
        const planeGeometry = new THREE.PlaneGeometry(2, 1);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.copy(uiPosition);
        plane.rotation.copy(uiRotation);
        scene.add(plane);

        object.options.surface = cube;
        object.options.ui = plane;
    }
}
