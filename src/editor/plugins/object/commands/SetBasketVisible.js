import { Command } from '../../../editor.js'

/**
 * @extends Command
 * @class
 * @classdesc SetObjectsVisibleByType set objects visible by type
 */
export default class SetBasketVisible extends Command {

    /**
     * @constructor
     * 
     * @param {boolean} visibilityState the visibility state of the object
     * @throws {Error} if objectType is not a string
     */
    constructor(visibilityState) {
        super()

        this.visibilityState = visibilityState
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    async execute() {
        const { objects: objectsPlugin } = this.invoker.options.plugins

        if (objectsPlugin === null) {
            throw new Error('Dependency Error: Unable to find objects plugin')
        }
        
        const objects = objectsPlugin.findAllByType("Basket");
        objects.forEach(object => {
            object.object.visible = this.visibilityState;
            object.options.placeholder.visible = this.visibilityState;
            object.options.fakeHand.visible = this.visibilityState;
        });
    }
}
