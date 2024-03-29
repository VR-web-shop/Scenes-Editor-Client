<template>
    <form @submit.prevent="submit" class="p-3 text-white">
        <input type="text" placeholder="Name" v-model="name" class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]" />
        
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
import CreateObject from '../../../editor/plugins/object/commands/CreateObject.js';
import UpdateObject from '../../../editor/plugins/object/commands/UpdateObject.js';
import { useEditor } from '../../../composables/useEditor.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { useToast } from '../../../composables/useToast.js';
import { router } from '../../../router.js';
import { ref } from 'vue';

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

const submit = async () => {
    if (!name.value) {
        toastCtrl.add('Name is required', 5000, 'error');
        return
    }

    if (!mesh.value) {
        toastCtrl.add('Mesh is required', 5000, 'error');
        return
    }

    if (uuid.value) {

        await sdk.api.SceneStaticObjectController.update({
            uuid: uuid.value,
            name: name.value,
            mesh_uuid: mesh.value.uuid
        });

        const { rows } = await sdk.api.SceneStaticObjectController.findAll({
            limit: 1,
            where: { uuid: uuid.value },
            include: [
                { model: 'Position' },
                { model: 'Rotation' },
                { model: 'Scale' },
                { model: 'Mesh' },
            ]     
        })

        await editorCtrl.invoke(new UpdateObject(
            uuid.value,
            name.value,
            mesh.value.uuid,
            rows[0]
        ));

        toastCtrl.add('Static object updated', 5000, 'success');
    } else {

        const staticObject = await sdk.api.SceneStaticObjectController.create({
            name: name.value,
            mesh_uuid: mesh.value.uuid,
            scene_uuid: sceneUUID,
            responseInclude: [
                { model: 'Position' },
                { model: 'Rotation' },
                { model: 'Scale' },
                { model: 'Mesh' },
            ]
        });

        await editorCtrl.invoke(new CreateObject(
            'StaticObject',
            name.value,
            staticObject.uuid,
            mesh.value.uuid,
            staticObject.Position,
            staticObject.Rotation,
            staticObject.Scale,
            staticObject
        ))

        name.value = '';
        mesh.value = '';
        toastCtrl.add('Static object created', 5000, 'success');
    }
}
</script>
