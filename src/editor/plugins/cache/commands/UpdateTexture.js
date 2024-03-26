import { Command } from '../../../editor.js'

/**
 * @extends Command
 * @class
 * @classdesc UpdateTexture, updates a texture in the textures cache
 */
export default class UpdateTexture extends Command {

    /**
     * @constructor
     * 
     * @param {string} name the name of the texture
     * @param {string} src the source of the texture
     * @param {string} type the type of the texture
     * @throws {Error} if name is not a string
     * @throws {Error} if src is not a string
     * @throws {Error} if type is not a string
     */
    constructor(name, src, type) {
        super()

        if (typeof name !== 'string') {
            throw new Error('Name must be a string')
        }

        if (typeof src !== 'string') {
            throw new Error('Src must be a string')
        }

        if (typeof type !== 'string') {
            throw new Error('Type must be a string')
        }
        
        this.name = name
        this.src = src
        this.type = type
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    async execute() {
        const textureCache = this.invoker.options.plugins.caches.find('textures')
        if (!textureCache) {
            throw new Error('Textures Cache not found')
        }

        const cacheKey = this.name
        const cached = textureCache.find(cacheKey)
        if (!cached) {
            return
        }

        
    }
}
