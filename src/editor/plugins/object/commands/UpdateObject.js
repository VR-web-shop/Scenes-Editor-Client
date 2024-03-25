import { Command } from '../../../editor.js'

/**
 * @extends Command
 * @class
 * @classdesc UpdateObject update an existing object
 */
export default class UpdateObject extends Command {

    /**
     * @constructor
     * 
     * @param {string} id the id of the object
     * @param {string} labelName the label name of the object
     * @param {string} meshName the name of the mesh to create
     * @param {object} recordData the record data of the object (optional)
     * @throws {Error} if meshName is not a string
     */
    constructor(id, labelName, meshName, recordData) {
        super()

        if (typeof id !== 'string') {
            throw new Error('Must be a string')
        }

        if (typeof labelName !== 'string') {
            throw new Error('Must be a string')
        }
        
        if (typeof meshName !== 'string') {
            throw new Error('Must be a string')
        }
        
        this.id = id
        this.meshName = meshName
        this.labelName = labelName
        this.recordData = recordData
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    async execute() {
        const { view, plugins } = this.invoker.options
        const { caches, objects } = plugins
        const { scene } = view

        if (caches === null) {
            throw new Error('Dependency Error: Unable to find caches plugin')
        }

        if (objects === null) {
            throw new Error('Dependency Error: Unable to find objects plugin')
        }

        const object = objects.find(this.id)
        if (object === null) {
            throw new Error('Object Error: Unable to find object')
        }

        if (object.options.meshName !== this.meshName) {
            const { position, rotation, scale } = object.object
            const { x: px, y: py, z: pz } = position
            const { x: rx, y: ry, z: rz } = rotation
            const { x: sx, y: sy, z: sz } = scale

            scene.remove(object.object)

            const meshCache = caches.find('meshes')
            if (meshCache === null) {
                throw new Error('Cache Error: Unable to find mesh cache')
            }

            const mesh = meshCache.clone(this.meshName)
            if (!mesh) {
                throw new Error('Unable to clone mesh')
            }
            scene.add(mesh)

            object.object = mesh
            object.object.position.set(px, py, pz)
            object.object.rotation.set(rx, ry, rz)
            object.object.scale.set(sx, sy, sz)
            object.options.meshName = this.meshName
        }

        if (this.labelName) {
            object.options.labelName = this.labelName
        }

        if (this.recordData) {
            object.options.recordData = this.recordData
        }

        objects.update(this.id, object)
    }
}
