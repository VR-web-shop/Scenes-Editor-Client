import { Command } from '../../../editor.js'

/**
 * @extends Command
 * @class
 * @classdesc RemoveSceneProduct remove scene product object
 */
export default class RemoveSceneProduct extends Command {

    /**
     * @constructor
     * 
     * @param {string} id the id of the object
     * @throws {Error} if id is not a string
     */
    constructor(id) {
        super()

        if (typeof id !== 'string') {
            throw new Error('Must be a string')
        }
        
        this.id = id
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    async execute() {
        const { plugins } = this.invoker.options
        const { objects } = plugins
        if (objects === null) {
            throw new Error('Dependency Error: Unable to find objects plugin')
        }

        const object = objects.find(this.id);
        const { ui } = object.options;

        object.object.remove(ui);
        objects.remove(this.id)
    }
}
