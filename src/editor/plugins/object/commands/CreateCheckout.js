import CreateObject from './CreateObject.js'
import * as THREE from 'three'

/**
 * @extends Command
 * @class
 * @classdesc CreateCheckout create checkout object
 */
export default class CreateCheckout extends CreateObject {

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

        const object = objects.findByIdAndType(this.id, 'Checkout');
        
        const { 
            surface_offset_client_side_uuid: soV,
            surface_size_client_side_uuid: ssV
        } = object.options.recordData;

        const surfacePosition = new THREE.Vector3(soV.x, soV.y, soV.z);
        const cubeGeometry = new THREE.BoxGeometry(ssV.x, ssV.y, ssV.z);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.copy(surfacePosition);
        object.object.add(cube);

        const { 
            ui_offset_position_client_side_uuid: uopV, 
            ui_offset_rotation_client_side_uuid: uorV,
            ui_scale_client_side_uuid: usV
        } = object.options.recordData;
        const uiPosition = new THREE.Vector3(uopV.x, uopV.y, uopV.z);
        const uiRotation = new THREE.Euler(uorV.x, uorV.y, uorV.z);
        const uiScale = new THREE.Vector3(usV.x, usV.y, usV.z);
        const planeGeometry = new THREE.PlaneGeometry(2, 1);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.copy(uiPosition);
        plane.rotation.copy(uiRotation);
        plane.scale.copy(uiScale);
        object.object.add(plane);

        object.options.surface = cube;
        object.options.ui = plane;
    }
}