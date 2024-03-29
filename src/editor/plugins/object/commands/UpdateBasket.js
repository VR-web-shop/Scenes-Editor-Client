import CreateBasket from './CreateBasket.js'
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
        const { placeholder:_placeholder, fakeHand:_fakeHand, insertArea:_insertArea, pocket:_pocket } = object.options;

        scene.remove(_placeholder);
        scene.remove(_fakeHand);
        scene.remove(_insertArea);
        scene.remove(_pocket);

        const createCommand = new CreateBasket(
            this.objectType,
            this.labelName,
            this.id,
            this.meshName,
            this.position,
            this.rotation,
            this.scale,
            this.recordData
        );
        await createCommand.execute();
    }
}
