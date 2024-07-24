<template>
    <div class="w-64">
        <p class="text-sm text-left p-3">
            Static objects are used to decorate the scene. A static object requires a name and a mesh.
        </p>
        <FormComponent 
            :submitMethod="submit" 
            :buttonText="client_side_uuid ? 'Update' : 'Create'" 
            :record="{
                name: { value: name, required: true, type: 'text' },
                mesh_client_side_uuid: { value: mesh, required: true, type: 'select-paginator', paginator: {
                    findMethod: sdk.Mesh.findAll,
                    limit: 10,
                    emptyMessage: 'No meshes found',
                    foreignKey: 'uuid',
                    displayKey: 'name',
                    valueKey: 'client_side_uuid', 
                    placeholder: 'Select Mesh'
                }
            }
        }">
            <input v-if="client_side_uuid" type="hidden" name="client_side_uuid" :value="client_side_uuid" />
            <input type="hidden" name="scene_client_side_uuid" :value="sceneUUID" />
        </FormComponent>
    </div>
</template>

<script setup>
import FormComponent from '../../UI/Form.vue';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { router } from '../../../router.js';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const editorEntityCtrl = useEditorEntity();
const { sdk } = useSceneSDK();
const sceneUUID = router.currentRoute.value.params.client_side_uuid;
const name = ref(props.data ? props.data.recordData.name : '');
const client_side_uuid = ref(props.data ? props.data.recordData.client_side_uuid : '');
const mesh = ref(props.data ? props.data.recordData.mesh_client_side_uuid : '');

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
    };

    if (params.client_side_uuid) {
        const client_side_uuid = params.client_side_uuid;
        await sdk.SceneStaticObject.update(client_side_uuid, params);
        editorEntityCtrl.updateStaticObject(params);
        toastCtrl.add('Static object updated', 5000, 'success');
    } else {
        const position_client_side_uuid = uuidv4();
        await sdk.Vector3D.create({
            client_side_uuid: position_client_side_uuid,
            x: 0,
            y: 0,
            z: 0
        });
        params.position_client_side_uuid = position_client_side_uuid;

        const rotation_client_side_uuid = uuidv4();
        await sdk.Vector3D.create({
            client_side_uuid: rotation_client_side_uuid,
            x: 0,
            y: 0,
            z: 0
        });
        params.rotation_client_side_uuid = rotation_client_side_uuid;

        const scale_client_side_uuid = uuidv4();
        await sdk.Vector3D.create({
            client_side_uuid: scale_client_side_uuid,
            x: 1,
            y: 1,
            z: 1
        });
        params.scale_client_side_uuid = scale_client_side_uuid;

        params.client_side_uuid = uuidv4();
        await sdk.SceneStaticObject.create(params);
        editorEntityCtrl.createStaticObject(params);
        toastCtrl.add('Static object created', 5000, 'success');
        clearData();
    }
}
</script>
