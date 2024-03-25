import { Command } from '../../../editor.js'

/**
 * @extends Command
 * @class
 * @classdesc CreateObject create an object from a mesh
 */
export default class CreateObject extends Command {

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
        super()

        if (typeof labelName !== 'string') {
            throw new Error('Must be a string')
        }

        if (typeof id !== 'string') {
            throw new Error('Must be a string')
        }
        
        if (typeof meshName !== 'string') {
            throw new Error('Must be a string')
        }
        
        this.objectType = objectType
        this.meshName = meshName
        this.position = position
        this.rotation = rotation
        this.scale = scale

        this.labelName = labelName
        this.id = id
        this.recordData = recordData
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    async execute() {
        const { caches, objects } = this.invoker.options.plugins

        if (caches === null) {
            throw new Error('Dependency Error: Unable to find caches plugin')
        }

        if (objects === null) {
            throw new Error('Dependency Error: Unable to find objects plugin')
        }

        const meshCache = caches.find('meshes')
        if (meshCache === null) {
            throw new Error('Cache Error: Unable to find mesh cache')
        }

        const mesh = meshCache.clone(this.meshName)
        if (!mesh) {
            throw new Error('Unable to clone mesh')
        }
        
        if (this.position) {
            mesh.position.set(this.position.x, this.position.y, this.position.z)
        }

        if (this.rotation) {
            mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z)
        }

        if (this.scale) {
            mesh.scale.set(this.scale.x, this.scale.y, this.scale.z)
        }

        // Add the object to the scene and objects list
        objects.add(mesh, { 
            labelName: this.labelName, 
            id: this.id, 
            objectType: this.objectType, 
            meshName: this.meshName,
            recordData: this.recordData 
        })
    }
}
