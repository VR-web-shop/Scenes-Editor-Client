import { Command } from '../../../editor.js'

/**
 * @extends Command
 * @class
 * @classdesc SetObjectsVisibleByType set objects visible by type
 */
export default class SetObjectsVisibleByType extends Command {

    /**
     * @constructor
     * 
     * @param {string} objectType the type of the object
     * @param {boolean} visibilityState the visibility state of the object
     * @throws {Error} if objectType is not a string
     */
    constructor(objectType, visibilityState) {
        super()

        if (typeof objectType !== 'string') {
            throw new Error('objectType must be a string')
        }

        
        this.objectType = objectType
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
        
        const objects = objectsPlugin.findAllByType(this.objectType);
        objects.forEach(object => {
            object.object.visible = this.visibilityState;
        });
    }
}
