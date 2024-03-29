import Command from '../../abstractions/Command.js';
import * as THREE from 'three';

let timeout = null
let timeoutMethod = null

function clearEffect() {
    if (timeout) {
        clearTimeout(timeout)
        timeoutMethod()

        timeout = null
        timeoutMethod = null
    }
}

/**
 * @class
 * @classdesc SetCameraFocus sets the position and target of the camera
 * @extends Command
 */
export default class SetCameraFocus extends Command {

    /**
     * @constructor
     * @param {Object} target the target object to focus on
     * @param {Object} offset the offset of the camera
     */
    constructor(target, offset, effectDelay=200) {
        super()
        
        this.target = target
        this.offset = offset
        this.effectDelay = effectDelay
    }

    /**
     * Execute the command
     * 
     * @returns {void}
     */
    execute() {
        clearEffect()

        const { view } = this.invoker.options
        const { camera, controls } = view
        const { position } = this.target

        camera.position.copy(position.clone().add(this.offset))
        camera.lookAt(position)
        controls.target.copy(position)

        const effectMaterial = new THREE.MeshToonMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00, 
            emissiveIntensity: 0.5 
        })
        const submeshConfiguration = [];
        this.target.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
                submeshConfiguration.push({
                    mesh: child,
                    material: child.material
                })

                child.material = effectMaterial
            }
        })

        timeoutMethod = () => {
            submeshConfiguration.forEach(({ mesh, material }) => {
                mesh.material = material
            })
            effectMaterial.dispose()
        }

        timeout = setTimeout(() => {
            timeoutMethod()
        }, this.effectDelay)
    }
}
