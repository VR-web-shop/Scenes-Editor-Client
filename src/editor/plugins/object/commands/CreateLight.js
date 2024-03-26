import { Command } from '../../../editor.js'
import * as THREE from 'three'

/**
 * @extends Command
 * @class
 * @classdesc CreateLight create an object from a light
 */
export default class CreateLight extends Command {

    /**
     * @constructor
     * 
     * @param {string} labelName the label name of the object
     * @param {string} id the id of the object
     * @param {string} type the type of the light
     * @param {number} intensity the intensity of the light (optional)
     * @param {string} color the color of the light (optional)
     * @param {object} position the position of the light (optional)
     * @param {object} rotation the rotation of the object (optional)
     * @param {object} recordData the record data of the object (optional)
     * @throws {Error} if meshName is not a string
     */
    constructor(labelName, id, type, intensity, color, position, rotation, recordData) {
        super()

        if (typeof labelName !== 'string') {
            throw new Error('Must be a string')
        }

        if (typeof id !== 'string') {
            throw new Error('Must be a string')
        }
        
        if (typeof type !== 'string') {
            throw new Error('type be a string')
        }
        
        this.type = type
        this.intensity = intensity
        this.color = color
        this.position = position
        this.rotation = rotation
        this.labelName = labelName
        this.id = id
        this.recordData = recordData
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    async execute() {
        const { objects } = this.invoker.options.plugins

        if (objects === null) {
            throw new Error('Dependency Error: Unable to find objects plugin')
        }

        const light = new THREE[this.type](this.intensity)

        if (this.color) {
            light.color.set(this.color)
        }
        
        if (this.position) {
            light.position.set(this.position.x, this.position.y, this.position.z)
        }

        if (this.rotation) {
            light.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z)
        }

        // Add the object to the scene and objects list
        objects.add(light, { 
            labelName: this.labelName, 
            id: this.id, 
            objectType: 'Light', 
            lightType: this.type,
            recordData: this.recordData 
        })
    }
}
