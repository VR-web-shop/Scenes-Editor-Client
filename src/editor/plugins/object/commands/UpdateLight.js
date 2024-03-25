import { Command } from '../../../editor.js'
import * as THREE from 'three'

/**
 * @extends Command
 * @class
 * @classdesc UpdateLight update an existing light
 */
export default class UpdateLight extends Command {

    /**
     * @constructor
     * 
     * @param {string} id the id of the object
     * @param {string} labelName the label name of the object
     * @param {string} type the type of the light
     * @param {number} intensity the intensity of the light (optional)
     * @param {string} color the color of the light (optional)
     * @param {object} recordData the record data of the object (optional)
     * @throws {Error} if meshName is not a string
     */
    constructor(id, labelName, type, intensity, color, recordData) {
        super()

        if (typeof id !== 'string') {
            throw new Error('Must be a string')
        }

        if (typeof labelName !== 'string') {
            throw new Error('Must be a string')
        }
        
        if (typeof type !== 'string') {
            throw new Error('type be a string')
        }

        this.id = id 
        this.color = color
        this.type = type
        this.intensity = intensity
        this.labelName = labelName
        this.recordData = recordData
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    async execute() {
        const { view, plugins } = this.invoker.options
        const { objects } = plugins
        const { scene } = view

        if (objects === null) {
            throw new Error('Dependency Error: Unable to find objects plugin')
        }

        const object = objects.find(this.id)
        if (object === null) {
            throw new Error('Object Error: Unable to find object')
        }

        if (this.type !== object.options.lightType) {
            const { position, rotation, scale, color } = object.object
            const { x: px, y: py, z: pz } = position
            const { x: rx, y: ry, z: rz } = rotation
            const { x: sx, y: sy, z: sz } = scale

            scene.remove(object.object)

            const light = new THREE[this.type](this.intensity)
            scene.add(light)

            object.object = light
            object.object.position.set(px, py, pz)
            object.object.rotation.set(rx, ry, rz)
            object.object.scale.set(sx, sy, sz)
            object.object.color.set(color)
            object.object.add(objects.getLightHelper(light))
            object.options.lightType = this.type
        }

        if (this.color) {
            object.object.color.set(this.color)
            scene.remove(object.object.children[0])
            object.object.add(objects.getLightHelper(object.object))
        }

        if (this.intensity) {
            object.object.intensity = this.intensity
        }

        if (this.labelName) {
            object.options.labelName = this.labelName
        }

        if (this.recordData) {
            object.options.recordData = this.recordData
        }

        objects.update(this.id, object)
    }
}
