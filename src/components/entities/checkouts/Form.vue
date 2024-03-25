<template>
    <form @submit.prevent="submit" class="p-3 text-white">
        <input type="text" placeholder="Name" v-model="name" class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]" />

        <VectorInput title="Surface offset" ref="surfaceOffsetRef" label="Surface Offset" class="mb-3" />
        <VectorInput title="Surface size" ref="surfaceSizeRef" label="Surface Size" class="mb-3" />
        <VectorInput title="UI offset" ref="uiOffsetRef" label="UI Offset" class="mb-3" />
        <VectorInput title="UI rotation" ref="uiRotationRef" label="UI Rotation" class="mb-3" />

        <div class="mb-3">
            <Paginator :findAllMethod="sdk.api.MeshController.findAll" :limit="10">
                <template #empty>
                    <div class="text-center">No meshes found</div>
                </template>

                <template #default="{ entities }">
                    <select v-model="mesh" class="w-full p-2 text-sm bg-white/[.10] rounded-md">
                        <option value="" class="text-black">Select Mesh</option>
                        <option v-for="mesh in entities" :key="mesh.uuid" :value="{uuid: mesh.uuid, name: mesh.name}" class="text-black">
                            {{ mesh.name }}
                        </option>
                    </select>
                </template>
            </Paginator>
        </div>

        <button type="submit" class="border border-gray-300 px-3 py-1 rounded">
            {{ uuid ? 'Update' : 'Create' }}
        </button>
    </form>
</template>

<script setup>
import Paginator from '../../UI/Paginator.vue';
import VectorInput from '../../UI/VectorInput.vue';
import CreateObject from '../../../editor/plugins/object/commands/CreateObject.js';
import UpdateObject from '../../../editor/plugins/object/commands/UpdateObject.js';
import { useEditor } from '../../../composables/useEditor.js';
import { router } from '../../../router.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { useToast } from '../../../composables/useToast.js';
import { ref, onMounted } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const { sdk } = useSceneSDK();
const editorCtrl = useEditor();
const toastCtrl = useToast();

const sceneUUID = router.currentRoute.value.params.sceneUUID;
const name = ref(props.data ? props.data.recordData.name : '');
const uuid = ref(props.data ? props.data.recordData.uuid : '');
const mesh = ref(props.data ? {
    uuid: props.data.recordData.Mesh.uuid,
    name: props.data.recordData.Mesh.name
} : '');

const surfaceOffsetRef = ref();
const surfaceSizeRef = ref();
const uiOffsetRef = ref();
const uiRotationRef = ref();

const submit = async () => {
    if (!name.value) {
        toastCtrl.add('Name is required', 5000, 'error');
        return
    }

    if (!mesh.value) {
        toastCtrl.add('Mesh is required', 5000, 'error');
        return
    }

    const surfaceOffsetValues = surfaceOffsetRef.value.getVector();
    const surfaceSizeValues = surfaceSizeRef.value.getVector();
    const uiOffsetValues = uiOffsetRef.value.getVector();
    const uiRotationValues = uiRotationRef.value.getVector();

    if (surfaceOffsetValues.x === 0) surfaceOffsetValues.x = 0.0001;
    if (surfaceOffsetValues.y === 0) surfaceOffsetValues.y = 0.0001;
    if (surfaceOffsetValues.z === 0) surfaceOffsetValues.z = 0.0001;
    if (surfaceSizeValues.x === 0) surfaceSizeValues.x = 0.0001;
    if (surfaceSizeValues.y === 0) surfaceSizeValues.y = 0.0001;
    if (surfaceSizeValues.z === 0) surfaceSizeValues.z = 0.0001;
    if (uiOffsetValues.x === 0) uiOffsetValues.x = 0.0001;
    if (uiOffsetValues.y === 0) uiOffsetValues.y = 0.0001;
    if (uiOffsetValues.z === 0) uiOffsetValues.z = 0.0001;
    if (uiRotationValues.x === 0) uiRotationValues.x = 0.0001;
    if (uiRotationValues.y === 0) uiRotationValues.y = 0.0001;
    if (uiRotationValues.z === 0) uiRotationValues.z = 0.0001;
    
    if (uuid.value) {
        await sdk.api.SceneCheckoutController.update({
            uuid: uuid.value,
            name: name.value,
            mesh_uuid: mesh.value.uuid
        });

        await sdk.api.Vector3DController.update({
            uuid: props.data.recordData.SurfaceOffset.uuid,
            x: surfaceOffsetValues.x,
            y: surfaceOffsetValues.y,
            z: surfaceOffsetValues.z
        });

        await sdk.api.Vector3DController.update({
            uuid: props.data.recordData.SurfaceSize.uuid,
            x: surfaceSizeValues.x,
            y: surfaceSizeValues.y,
            z: surfaceSizeValues.z
        });

        await sdk.api.Vector3DController.update({
            uuid: props.data.recordData.UIOffset.uuid,
            x: uiOffsetValues.x,
            y: uiOffsetValues.y,
            z: uiOffsetValues.z
        });

        await sdk.api.Vector3DController.update({
            uuid: props.data.recordData.UIRotation.uuid,
            x: uiRotationValues.x,
            y: uiRotationValues.y,
            z: uiRotationValues.z
        });

        const { rows } = await sdk.api.SceneCheckoutController.findAll({
            limit: 1,
            where: { uuid: uuid.value },
            include: [
                { model: 'Position' },
                { model: 'Rotation' },
                { model: 'Scale' },
                { model: 'SurfaceOffset' },
                { model: 'SurfaceSize' },
                { model: 'UIOffset' },
                { model: 'UIRotation' },
                { model: 'Mesh' }
            ]     
        })
        console.log(rows[0])
        await editorCtrl.invoke(new UpdateObject(
            uuid.value,
            name.value,
            mesh.value.uuid,
            rows[0]
        ));

        toastCtrl.add('Checkout updated', 5000, 'success');
    } else {
        const surfaceOffset = await sdk.api.Vector3DController.create(surfaceOffsetValues);
        const surfaceSize = await sdk.api.Vector3DController.create(surfaceSizeValues);
        const uiOffset = await sdk.api.Vector3DController.create(uiOffsetValues);
        const uiRotation = await sdk.api.Vector3DController.create(uiRotationValues);
        
        const checkout = await sdk.api.SceneCheckoutController.create({
            name: name.value,
            mesh_uuid: mesh.value.uuid,
            surface_offset_uuid: surfaceOffset.uuid,
            surface_size_uuid: surfaceSize.uuid,
            ui_offset_uuid: uiOffset.uuid,
            ui_rotation_uuid: uiRotation.uuid,
            scene_uuid: sceneUUID
        });

        await editorCtrl.invoke(new CreateObject(
            'Checkout',
            name.value,
            checkout.uuid,
            mesh.value.uuid
        ));

        name.value = '';
        mesh.value = '';

        toastCtrl.add('Checkout created', 5000, 'success');
    }
}

onMounted(async () => {
    if (!props.data) return;
    surfaceOffsetRef.value.setVector(props.data.recordData.SurfaceOffset);
    surfaceSizeRef.value.setVector(props.data.recordData.SurfaceSize);
    uiOffsetRef.value.setVector(props.data.recordData.UIOffset);
    uiRotationRef.value.setVector(props.data.recordData.UIRotation);
})
</script>
