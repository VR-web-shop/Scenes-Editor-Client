import { Command } from '../../../editor.js'

/**
 * @extends Command
 * @class
 * @classdesc RemoveMesh, removes a mesh from the materials cache
 */
export default class RemoveMesh extends Command {

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
        const meshCache = this.invoker.options.plugins.caches.find('meshes')
        if (!meshCache) {
            throw new Error('Mesh cache not found')
        }

        const cacheKey = this.name
        const cached = meshCache.find(cacheKey)
        if (!cached) {
            return
        }

        meshCache.dispose(cacheKey)
    }
}
