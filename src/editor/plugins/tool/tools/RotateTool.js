import Tool from "../src/Tool.js";
import Util from "../src/util.js";
import * as THREE from 'three'

const group = new THREE.Group()
const arrows = []
const colliders = []
const selectedAxis = {
    name: null,
    selectOffset: new THREE.Vector3(),
    isSelected: () => selectedAxis.name !== null,
}
let mouseXLast = 0
let mouseYLast = 0
const originalRotation = new THREE.Euler()

const size = new THREE.Vector3(0.1, 0.1, 0.1);
const zAxis = new THREE.Mesh(
    new THREE.TorusGeometry(10, 0.2, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0x0000ff }
    ))
const yAxis = new THREE.Mesh(
    new THREE.TorusGeometry(10, 0.2, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }
    ))
const xAxis = new THREE.Mesh(
    new THREE.TorusGeometry(10, 0.2, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0xff0000 }
    ))

zAxis.rotation.y = Math.PI / 2
xAxis.rotation.x = Math.PI / 2

zAxis.name = 'z'
yAxis.name = 'y'
xAxis.name = 'x'

group.add(zAxis)
group.add(yAxis)
group.add(xAxis)

arrows.push(zAxis, yAxis, xAxis)
colliders.push(zAxis, yAxis, xAxis)

function updateArrowSize(view) {
    if (arrows.length === 0) {
        return
    }

    const camera = view.camera
    const position = arrows[0].position.clone()
    const distance = camera.position.distanceTo(position)
    const scale = distance / 5

    for (const arrow of arrows) {
        arrow.scale.copy(size.clone().multiplyScalar(scale))
    }

    for (const collider of colliders) {
        collider.scale.copy(size.clone().multiplyScalar(scale))
    }
}

function setVisibility(visible) {
    group.visible = visible
}

function moveToSelected(selected) {
    const box = new THREE.Box3().setFromObject(selected)
    const center = box.getCenter(new THREE.Vector3())
    group.position.copy(center)
}

function getAxisIntersection(event, camera) {
    const intersections = Util.calculateObjectsIntersection(event, camera, colliders)
    if (intersections && intersections.length > 0) {
        return intersections[0]
    }
    return null
}

function rotateSelected(event, selected, camera) {
    if (!selectedAxis.isSelected()) {
        return
    }

    const selectedObject = selected;

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
    const axis = selectedAxis.name;
    if (axis === 'x') {
        selected.rotation.y = rotationY + originalRotation.y;
    } else if (axis === 'y') {
        selected.rotation.z = rotationX + originalRotation.z;
    } else if (axis === 'z') {
        selected.rotation.x = rotationX + originalRotation.x;
    }

    mouseXLast = event.clientX;
    mouseYLast = event.clientY;
}

function showSelectColor() {
    if (!selectedAxis.isSelected()) {
        return
    }

    const axis = selectedAxis.name
    for (const arrow of arrows) {
        if (arrow.name === axis) {
            arrow.visible = true
        } else {
            arrow.visible = false
        }
    }
}

function hideSelectColor() {
    for (const arrow of arrows) {
        arrow.visible = true
    }
}

function selectAxis(intersection, controls) {
    selectedAxis.selectOffset.copy(intersection.point).sub(group.position)
    selectedAxis.name = intersection.object.name
    controls.enabled = false
    showSelectColor()
}

function deselectAxis(controls) {
    selectedAxis.name = null
    controls.enabled = true
    hideSelectColor()
}

export default class RotateTool extends Tool {
    constructor() {
        super()
    }

    activate(scene) {
        super.activate(scene)
        this.options.view.scene.add(group)
    }

    deactivate() {
        super.deactivate()
        this.options.view.scene.remove(group)
    }

    setSelected(event) {
        super.setSelected(event)
    }

    onSelected(event) {
        const view = this.options.view
        if (this.getSelected()) {
            const intersection = getAxisIntersection(event.pointerDownEvent.event, view.camera)
            if (intersection) {
                selectAxis(intersection, view.controls)
                return
            }
        }

        super.onSelected(event)
        const next = this.getSelected()
        if (next) {
            originalRotation.copy(next.rotation)
            setVisibility(true)
            moveToSelected(next)
            updateArrowSize(view)
        }
    }

    onDeselected(event) {
        if (this.getSelected()) {
            const view = this.options.view
            const intersection = getAxisIntersection(event.pointerDownEvent.event, view.camera)
            if (intersection) {
                selectAxis(intersection, view.controls)
                return
            }
        }

        super.onDeselected(event)
        setVisibility(false)
    }

    onPointerDown(event) {
    }

    onPointerUp(event) {
        deselectAxis(this.options.view.controls)
        const selected = this.getSelected()
        if (selected) {
            originalRotation.copy(selected.rotation)
        }
    }

    onPointerMove(event) {
        const object = this.getSelected()
        if (object) {
            const view = this.options.view
            rotateSelected(event, object, view.camera)
            moveToSelected(object)
            updateArrowSize(view)
        }
    }

    onScroll(object) {
        updateArrowSize()
    }
}
