import { Command } from '../../../editor.js'

/**
 * @extends Command
 * @class
 * @classdesc RemoveMaterial, removes a material from the materials cache
 */
export default class RemoveMaterial extends Command {

    /**
     * @constructor
     * 
     * @param {string} name the name of the material
     */
    constructor(name) {
        super()

        if (typeof name !== 'string') {
            throw new Error('Must be a string')
        }

        
        this.name = name
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    async execute() {
        const materialCache = this.invoker.options.plugins.caches.find('materials')
        if (!materialCache) {
            throw new Error('Material cache not found')
        }

        const cacheKey = this.name
        const cached = materialCache.find(cacheKey)
        if (!cached) {
            return
        }

        materialCache.dispose(cacheKey)
    }
}
