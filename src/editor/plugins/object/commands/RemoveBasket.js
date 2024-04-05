import { Command } from '../../../editor.js'

/**
 * @extends Command
 * @class
 * @classdesc RemoveBasket remove basket object
 */
export default class RemoveBasket extends Command {

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

    async execute() {
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
        const character = objects.findByType('Character');
        const { placeholder, fakeHand, insertArea, pocket } = object.options;

        object.object.remove(placeholder);
        object.object.remove(fakeHand);
        object.object.remove(insertArea);
        character.object.remove(pocket);
        objects.remove(this.id)
    }
}
