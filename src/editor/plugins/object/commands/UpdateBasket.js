import CreateBasket from './CreateBasket.js'
import RemoveBasket from './RemoveBasket.js'
import UpdateObject from './UpdateObject.js'

/**
 * @extends Command
 * @class
 * @classdesc UpdateBasket update basket object
 */
export default class UpdateBasket extends UpdateObject {

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
        super(id, labelName, meshName, recordData)

        this.objectType = objectType
        this.position = position
        this.rotation = rotation
        this.scale = scale
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    async execute() {
        super.execute()
        console.log(this.invoker.options)
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

        await this.invoker.invoke(new RemoveBasket(this.id))
        await this.invoker.invoke(new CreateBasket(
            this.objectType,
            this.labelName,
            this.id,
            this.meshName,
            this.position,
            this.rotation,
            this.scale,
            this.recordData
        ))
    }

    toString() {
        return `UpdateBasket(objectType: ${this.objectType}, labelName: ${this.labelName}, id: ${this.id}, meshName: ${this.meshName}, position: ${this.position}, rotation: ${this.rotation}, scale: ${this.scale}, recordData: ${this.recordData})`
    }
}
