<template>
    <form @submit.prevent="submit" class="p-3 text-white">
        <VectorInput title="Object offset" ref="objectOffsetRef" label="Object Offset" class="mb-3" />
        <VectorInput title="Placeholder offset" ref="placeholderOffsetRef" label="Placeholder Offset" class="mb-3" />

        <div class="mb-3">
            <p class="mb-1 text-gray-500">Object Mesh</p>
            <Paginator :findAllMethod="sdk.api.MeshController.findAll" :limit="10">
                <template #empty>
                    <div class="text-center">No meshes found</div>
                </template>

                <template #default="{ entities }">
                    <select v-model="objectMesh" class="w-full p-2 text-sm bg-white/[.10] rounded-md">
                        <option value="" class="text-black">Select Object Mesh</option>
                        <option v-for="mesh in entities" :key="mesh.uuid" :value="{ uuid: mesh.uuid, name: mesh.name }"
                            class="text-black">
                            {{ mesh.name }}
                        </option>
                    </select>
                </template>
            </Paginator>
        </div>

        <div class="mb-3">
            <p class="mb-1 text-gray-500">Placeholder Mesh</p>
            <Paginator :findAllMethod="sdk.api.MeshController.findAll" :limit="10">
                <template #empty>
                    <div class="text-center">No meshes found</div>
                </template>

                <template #default="{ entities }">
                    <select v-model="placeholderMesh" class="w-full p-2 text-sm bg-white/[.10] rounded-md">
                        <option value="" class="text-black">Select Placeholder Mesh</option>
                        <option v-for="mesh in entities" :key="mesh.uuid" :value="{ uuid: mesh.uuid, name: mesh.name }"
                            class="text-black">
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
import { useNotifications } from '../../../composables/useNotifications';
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
const notificationCtrl = useNotifications();
const uuid = ref(props.data ? props.data.recordData.uuid : '');
const objectMesh = ref(props.data && props.data.recordData.Object ? {
    uuid: props.data.recordData.Object.uuid,
    name: props.data.recordData.Object.name
} : '');
const placeholderMesh = ref(props.data && props.data.recordData.Placeholder ? {
    uuid: props.data.recordData.Placeholder.uuid,
    name: props.data.recordData.Placeholder.name
} : '');

const objectOffsetRef = ref();
const placeholderOffsetRef = ref();

const submit = async () => {
    if (!objectMesh.value) {
        toastCtrl.add('Object Mesh is required', 5000, 'error');
        return
    }

    if (!placeholderMesh.value) {
        toastCtrl.add('Placeholder Mesh is required', 5000, 'error');
        return
    }

    const objectOffsetValues = objectOffsetRef.value.getVector();
    const placeholderOffsetValues = placeholderOffsetRef.value.getVector();

    if (objectOffsetValues.x === 0) objectOffsetValues.x = 0.0001;
    if (objectOffsetValues.y === 0) objectOffsetValues.y = 0.0001;
    if (objectOffsetValues.z === 0) objectOffsetValues.z = 0.0001;
    if (placeholderOffsetValues.x === 0) placeholderOffsetValues.x = 0.0001;
    if (placeholderOffsetValues.y === 0) placeholderOffsetValues.y = 0.0001;
    if (placeholderOffsetValues.z === 0) placeholderOffsetValues.z = 0.0001;
    
    if (uuid.value) {
        await sdk.api.Vector3DController.update({
            uuid: props.data.recordData.ObjectOffset.uuid,
            x: objectOffsetValues.x,
            y: objectOffsetValues.y,
            z: objectOffsetValues.z
        });

        await sdk.api.Vector3DController.update({
            uuid: props.data.recordData.PlaceholderOffset.uuid,
            x: placeholderOffsetValues.x,
            y: placeholderOffsetValues.y,
            z: placeholderOffsetValues.z
        });

        const sceneBasket = await sdk.api.SceneBasketController.update({
            uuid: uuid.value,
            object_uuid: objectMesh.value.uuid,
            placeholder_uuid: placeholderMesh.value.uuid,
            responseInclude: [
                { model: 'Position' },
                { model: 'Rotation' },
                { model: 'Scale' },
                { model: 'Object' },
                { model: 'Placeholder' },
                { model: 'ObjectOffset' },
                { model: 'PlaceholderOffset' }
            ]    
        });

        if (props.data && props.data.recordData.object_uuid === null) {
            await editorCtrl.invoke(new CreateObject(
                'Basket',
                'Scene Basket',
                uuid.value,
                objectMesh.value.uuid,
                sceneBasket.Position,
                sceneBasket.Rotation,
                sceneBasket.Scale,
                sceneBasket
            ));
        } else {
            await editorCtrl.invoke(new UpdateObject(
                uuid.value,
                'Scene Basket',
                objectMesh.value.uuid,
                sceneBasket
            ));
        }

        if (props.data && props.data.recordData.placeholder_uuid === null) {
            await editorCtrl.invoke(new CreateObject(
                'BasketPlaceholder',
                'Scene Basket Placeholder',
                uuid.value + '-basket-placeholder',
                objectMesh.value.uuid,
                sceneBasket.Position,
                sceneBasket.Rotation,
                sceneBasket.Scale,
                sceneBasket
            ));
        } else {
            await editorCtrl.invoke(new UpdateObject(
                uuid.value,
                'Scene Basket',
                placeholderMesh.value.uuid,
                sceneBasket
            ));
        }

        await notificationCtrl.sync();

        toastCtrl.add('Basket updated', 5000, 'success');
    }
}

onMounted(async () => {
    if (!props.data) return;
    objectOffsetRef.value.setVector(props.data.recordData.ObjectOffset);
    placeholderOffsetRef.value.setVector(props.data.recordData.PlaceholderOffset);
})
</script>
