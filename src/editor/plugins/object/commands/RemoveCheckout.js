import { Command } from '../../../editor.js'

/**
 * @extends Command
 * @class
 * @classdesc RemoveCheckout remove checkout object
 */
export default class RemoveCheckout extends Command {

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
        objects.remove(this.id)
    }
}
