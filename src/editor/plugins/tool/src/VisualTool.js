import * as THREE from 'three';
import Axis from './Axis.js';
import Util from './util.js';

export default class VisualTool {
    constructor(tool) {
        this.tool = tool;
        this.selected = null;
        this.group = new THREE.Group();
        this.group.visible = false;

        this.axis = new Axis('x');
        this.axisSelectOffset = new THREE.Vector3();
        this.colliders = [];
    }

    activate() {
        this.tool.options.view.scene.add(this.group);
    }

    deactivate() {
        this.clear();
    }

    clear() {
        if (this.group) {
            this.tool.options.view.scene.remove(this.group)
        }

        for (const collider of this.colliders) {
            collider.material.dispose()
            collider.geometry.dispose()
        }

        this.selected = null;
    }

    updatePosition() {
        /**
         * No group, nothing to update
         */
        if (!this.group) {
            return
        }

        /**
         * No selected, nothing to update
         */
        if (!this.selected) {
            return
        }

        /**
         * Move to the center of the selected object
         */
        const box = new THREE.Box3().setFromObject(this.selected)
        const center = box.getCenter(new THREE.Vector3())
        this.group.position.copy(center)
    }

    selectAxisCollider(object) {
        if (!this.group) {
            return false
        }
        
        const view = this.tool.options.view
        const intersections = Util.calculateObjectsIntersection(object, view.camera, this.colliders)
        if (intersections && intersections.length > 0) {
            const intersection = intersections[0]
            this.axisSelectOffset.copy(intersection.point).sub(this.group.position)
            this.axis.setName(intersection.object.name)
            this.axis.select();
            view.controls.enabled = false
            this.onSelectAxis()
            return true
        }

        return false
    }

    deselectAxisCollider() {
        if (this.axis.isSelected) {
            this.onDeselectAxis()
            this.axis.deselect();
            this.tool.options.view.controls.enabled = true
        }
    }

    onSelectAxis() {
    }

    onDeselectAxis() {
    }
}
