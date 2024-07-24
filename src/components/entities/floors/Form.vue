<template>
    <div class="w-64">
        <p class="text-sm text-left p-3">
            Floors control the surfaces where the VR player can teleport. A floor requires a name and a mesh.
        </p>
        <FormComponent 
            :submitMethod="submit" 
            :buttonText="uuid ? 'Update' : 'Create'" 
            :record="{
                name: { value: name, required: true, type: 'text' },
                mesh_client_side_uuid: { value: mesh, required: true, type: 'select-paginator', paginator: {
                        findMethod: sdk.Mesh.findAll,
                        limit: 10,
                        emptyMessage: 'No meshes found',
                        foreignKey: 'client_side_uuid',
                        displayKey: 'name',
                        valueKey: 'client_side_uuid', 
                        placeholder: 'Select Mesh'
                }}
        }">
            <input type="hidden" name="scene_client_side_uuid" :value="sceneUUID" />
            <input v-if="client_side_uuid" type="hidden" name="client_side_uuid" :value="client_side_uuid" />
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
console.log(props.data)
const { sdk } = useSceneSDK();
const editorEntityCtrl = useEditorEntity();
const sceneUUID = router.currentRoute.value.params.client_side_uuid;
const name = ref(props.data ? props.data.recordData.name : '');
const client_side_uuid = ref(props.data ? props.data.recordData.client_side_uuid : '');
const mesh = ref(props.data ? props.data.recordData.mesh_client_side_uuid : '');
 
const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
    };

    if (client_side_uuid.value) {
        params.position_client_side_uuid = props.data.recordData.position_client_side_uuid.client_side_uuid;
        params.rotation_client_side_uuid = props.data.recordData.rotation_client_side_uuid.client_side_uuid;
        params.scale_client_side_uuid = props.data.recordData.scale_client_side_uuid.client_side_uuid;
        
        await sdk.SceneFloor.update(client_side_uuid.value, params);
        await editorEntityCtrl.updateFloor(params);
        toastCtrl.add('Floor updated', 5000, 'success');
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
        await sdk.SceneFloor.create(params);
        await editorEntityCtrl.createFloor(params);
        clearData();
        toastCtrl.add('Floor created', 5000, 'success');
    }
}
</script>
