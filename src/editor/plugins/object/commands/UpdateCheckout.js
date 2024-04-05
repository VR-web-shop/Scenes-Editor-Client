import UpdateObject from './UpdateObject.js'
import RemoveCheckout from './RemoveCheckout.js'
import CreateCheckout from './CreateCheckout.js'

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

        const { plugins, view } = this.invoker.options
        const { objects } = plugins
        const { scene } = view
        if (objects === null) {
            throw new Error('Dependency Error: Unable to find objects plugin')
        }

        await this.invoker.invoke(new RemoveCheckout(this.id))
        await this.invoker.invoke(new CreateCheckout(
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
}
