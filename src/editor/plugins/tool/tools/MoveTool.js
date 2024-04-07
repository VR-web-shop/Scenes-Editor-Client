import Tool from "../src/Tool.js";
import Util from "../src/util.js";
import * as THREE from "three";

const group = new THREE.Group()
const arrows = []
const colliders = []
const selectedAxis = {
    name: null,
    selectOffset: new THREE.Vector3(),
    isSelected: () => selectedAxis.name !== null,
}

const size = new THREE.Vector3(1.5, 1.5, 1.5);
const position = new THREE.Vector3()
const zAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), position, size.z, 0x0000ff)
const yAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), position, size.y, 0x00ff00)
const xAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), position, size.x, 0xff0000)

zAxis.name = 'z'
yAxis.name = 'y'
xAxis.name = 'x'

group.add(zAxis)
group.add(yAxis)
group.add(xAxis)

arrows.push(zAxis, yAxis, xAxis)

const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, side: THREE.DoubleSide })
const zCollider = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, size.z), wireframeMaterial)
const yCollider = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, size.y), wireframeMaterial)
const xCollider = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, size.x), wireframeMaterial)

zCollider.rotation.z = Math.PI / 2
yCollider.rotation.x = Math.PI / 2
xCollider.rotation.y = Math.PI / 2

zCollider.position.z += size.z / 2
yCollider.position.y += size.y / 2
xCollider.position.x += size.x / 2

zCollider.name = 'z'
yCollider.name = 'y'
xCollider.name = 'x'

zCollider.material.visible = false
yCollider.material.visible = false
xCollider.material.visible = false

group.add(zCollider)
group.add(yCollider)
group.add(xCollider)

colliders.push(zCollider, yCollider, xCollider)

function updateArrowSize(view) {
    if (arrows.length === 0) {
        return
    }

    const camera = view.camera
    const position = arrows[0].position.clone()
    const distance = camera.position.distanceTo(position)
    const scale = 1

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

function moveSelected(event, selected, camera) {
    if (!selectedAxis.isSelected()) {
        return
    }

    const normal = Util.calculateNormalFromAxis(selectedAxis.name)
    const { isIntersecting, intersection } = Util.calculatePlaneIntersection(event, camera, normal)
    if (isIntersecting) {
        intersection.sub(selectedAxis.selectOffset)
        Util.clampPositionToObjectAxis(intersection, selected, selectedAxis.name)
        selected.position.copy(intersection)
    }
}

function showSelectColor() {
    if (!selectedAxis.isSelected()) {
        return
    }

    const axis = selectedAxis.name
    for (const arrow of arrows) {
        if (arrow.name === axis) {
            arrow.setColor(0xffa500)
        } else {
            if (arrow.name === 'x') arrow.setColor(0xff0000)
            if (arrow.name === 'y') arrow.setColor(0x00ff00)
            if (arrow.name === 'z') arrow.setColor(0x0000ff)
        }
    }
}

function hideSelectColor() {
    for (const arrow of arrows) {
        if (arrow.name === 'x') arrow.setColor(0xff0000)
        if (arrow.name === 'y') arrow.setColor(0x00ff00)
        if (arrow.name === 'z') arrow.setColor(0x0000ff)
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

export default class MoveTool extends Tool {
    constructor() {
        super()
    }

    activate(options) {
        super.activate(options)
        this.options.view.scene.add(group)
    }

    deactivate() {
        super.deactivate()
        this.options.view.scene.remove(group)
    }

    setSelected(object) {
        super.setSelected(object)
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
    }

    onPointerMove(event) {
        const object = this.getSelected()
        if (object) {
            const view = this.options.view
            moveSelected(event, object, view.camera)
            moveToSelected(object)
            updateArrowSize(view)
        }
    }

    onScroll(event) {
        updateArrowSize(this.options.view)
    }
}
