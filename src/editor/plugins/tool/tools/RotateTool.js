import Tool from "../src/Tool.js";
import VisualTool from "../src/VisualTool.js";
import Util from "../src/util.js";
import * as THREE from 'three'

const arrowSize = new THREE.Vector3(0.1, 0.1, 0.1);

class RotateVisualTool extends VisualTool {
    constructor(tool) {
        super(tool)
        this.arrows = []
        this.mouseXLast = 0
        this.mouseYLast = 0
        this.rotateWrapper = new THREE.Group()
        this.centerVisual = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        )
    }

    setupArrows(size) {
        const zAxis = new THREE.Mesh(
            new THREE.TorusGeometry( 10, 0.2, 16, 100 ),
            new THREE.MeshBasicMaterial( { color: 0x0000ff }
        ))
        const yAxis = new THREE.Mesh(
            new THREE.TorusGeometry( 10, 0.2, 16, 100 ),
            new THREE.MeshBasicMaterial( { color: 0x00ff00 }
        ))
        const xAxis = new THREE.Mesh(
            new THREE.TorusGeometry( 10, 0.2, 16, 100 ),
            new THREE.MeshBasicMaterial( { color: 0xff0000 }
        ))

        zAxis.rotation.y = Math.PI / 2
        xAxis.rotation.x = Math.PI / 2

        zAxis.name = 'z'
        yAxis.name = 'y'
        xAxis.name = 'x'

        this.group.add(zAxis)
        this.group.add(yAxis)
        this.group.add(xAxis)

        this.arrows.push(zAxis, yAxis, xAxis)
        this.updateArrowSize()
    }

    updateArrowSize() {
        if (this.arrows.length === 0) {
            return
        }
        const camera = this.tool.options.view.camera
        const position = this.arrows[0].position.clone()
        const distance = camera.position.distanceTo(position)
        const scale = distance / 10

        for (const arrow of this.arrows) {
            arrow.scale.copy(arrowSize.clone().multiplyScalar(scale))
        }

        for (const collider of this.colliders) {
            collider.scale.copy(arrowSize.clone().multiplyScalar(scale))
        }
    }

    setupColliders(size) {
        this.colliders.push(this.arrows[0], this.arrows[1], this.arrows[2])
    }

    setup() {
        super.setup()
        
        if (this.selected === null) {
            return
        }

        const box = new THREE.Box3().setFromObject(this.selected)
        const size = box.getSize(new THREE.Vector3())
        this.setupArrows(size)
        this.setupColliders(size)
    }

    clear() {
        super.clear()

        for (const arrow of this.arrows) {
            arrow.material.dispose()
            arrow.geometry.dispose()
        }

        this.arrows = []
    }

    onPointerMove(event) {
        if (!this.axis.isSelected) {
            return
        }
        const camera = this.tool.options.view.camera;
        const selectedObject = this.selected;

// Get the position of the selected object in 2D screen coordinates
const selected2DPositionScreen = new THREE.Vector3();
selectedObject.updateMatrixWorld(); // Make sure the object's world matrix is up to date
selected2DPositionScreen.setFromMatrixPosition(selectedObject.matrixWorld); // Get the world position of the object
selected2DPositionScreen.project(camera); // Project the 3D position to 2D screen space

// Get the mouse position in normalized device coordinates (NDC)
const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

// Calculate the vector from the camera to the selected object
const cameraPosition = new THREE.Vector3();
camera.getWorldPosition(cameraPosition);
const objectPosition = selectedObject.position.clone();
const vectorToObj = objectPosition.sub(cameraPosition).normalize();

// Project the vector onto the plane perpendicular to the camera's view direction
const referenceVector = new THREE.Vector3(0, 0, -1); // Assuming your camera looks along the negative z-axis
const projectedVector = vectorToObj.projectOnPlane(referenceVector);

// Calculate the angle between the projected vector and the reference vector
const angle = referenceVector.angleTo(projectedVector);

// Use the angle to determine rotation
const rotationFactor = 1; // Adjust as needed
const rotationX = mouseY * rotationFactor;
const rotationY = mouseX * rotationFactor;

// Apply the rotation to the selected object
const axis = this.axis.name;
if (axis === 'x') {
    this.selected.rotation.y = rotationY+ this.originalRotation.y;
} else if (axis === 'y') {
    this.selected.rotation.z = rotationX+ this.originalRotation.z;
} else if (axis === 'z') {
    this.selected.rotation.x = rotationX+ this.originalRotation.x;
}

        this.mouseXLast = event.clientX;
        this.mouseYLast = event.clientY;
    }

    onSelectAxis() {
        const axis = this.axis.name
        this.originalRotation = this.selected.rotation.clone()
        console.log(axis)
        if (axis === 'x') {
            this.arrows[0].visible = false
            this.arrows[1].visible = false
        }

        else if (axis === 'y') {
            this.arrows[0].visible = false
            this.arrows[2].visible = false
        }

        else if (axis === 'z') {
            this.arrows[1].visible = false
            this.arrows[2].visible = false
        }
    }

    onDeselectAxis() {
        console.log('deselect')
        this.arrows[0].visible = true
        this.arrows[1].visible = true
        this.arrows[2].visible = true
    }
}

export default class RotateTool extends Tool {
    constructor() {
        super()
        this.visualTool = new RotateVisualTool(this)
    }

    activate(scene) {
        super.activate(scene)
        this.visualTool.setup()
    }

    deactivate() {
        super.deactivate()
        this.visualTool.clear()
    }

    setSelected(object) {
        super.setSelected(object)
        this.visualTool.setup()
    }

    onSelected(object) {
        super.onSelected(object)
        this.visualTool.setup()
    }

    onDeselected(object) {
        super.onDeselected(object)
    }

    onPointerDown(object) {
        super.onPointerDown(object)

        /**
         * If we select one of the axis, we don't want to deselect the object,
         * before the move operation is finished
         */
        if (this.visualTool.selectAxisCollider(object)) {
            return
        }

        /**
         * If we do not select an axis, and no longer have a selected object,
         * we want to clear the visual tool
         */
        if (!this.getSelected()) {
            this.visualTool.clear()
        }
    }

    onPointerUp(object) {
        super.onPointerUp(object)

        /**
         * If an axis is selected, we want to deselect it,
         * when the mouse is released
         */
        this.visualTool.deselectAxisCollider()
    }

    onPointerMove(object) {
        super.onPointerMove(object)

        /**
         * If an axis is selected we want to move the object by the axis
         */
        this.visualTool.onPointerMove(object)

        /**
         * Update arrow size depending on the distance to the camera
         */
        this.visualTool.updateArrowSize()
    }

    onScroll(object) {
        /**
         * Update arrow size depending on the distance to the camera
         */
        this.visualTool.updateArrowSize()
    }

    isReadyToDeselect() {
        /**
         * Do not allow deselection, if an axis is selected.
         * Because we want to finish the move operation first
         */
        return !this.visualTool.axis.isSelected
    }
}
