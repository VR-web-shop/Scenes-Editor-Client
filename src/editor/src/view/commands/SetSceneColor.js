import Command from '../../abstractions/Command.js';
import * as THREE from 'three'

/**
 * @class
 * @classdesc SetSceneColor sets the color of the scene
 * @extends Command
 */
export default class SetSceneColor extends Command {

    /**
     * @constructor
     * 
     * @param {Object} hex - The color to set
     * @throws {Error} If color is not a THREE.Color
     */
    constructor(hex) {
        super()

        if (!hex) {
            throw new Error('hex is required')
        }

        this.color = new THREE.Color(hex)
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    execute() {
        const { viewConfiguration } = this.invoker.options.view
        const scene = viewConfiguration.sceneConfig.instance

        scene.background = this.color
    }
}
