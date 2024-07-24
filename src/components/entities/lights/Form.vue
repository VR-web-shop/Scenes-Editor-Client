<template>
    <div class="w-64">
        <p class="text-sm text-left p-3">
            Lights are used to illuminate a scene. A light requires a name, a type, a color, an intensity and a scene light type.
        </p>
        <FormComponent 
            :submitMethod="submit" 
            :buttonText="client_side_uuid ? 'Update' : 'Create'" 
            :record="{
                name: { value: name, required: true, type: 'text' },
                hexColor: { value: color, required: true, type: 'color', placeholder: 'Select Color' },
                intensity: { value: intensity, required: true, type: 'number' },
                scene_light_type_name: { value: type, required: true, type: 'select-paginator', paginator: {
                        findMethod: sdk.SceneLightType.findAll,
                        limit: 10,
                        emptyMessage: 'No types found',
                        foreignKey: 'name',
                        displayKey: 'name',
                        valueKey: 'name', 
                        placeholder: 'Select Type'
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
import { ref } from 'vue';
import { router } from '../../../router.js';
import { v4 as uuidv4 } from 'uuid';
const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const { sdk } = useSceneSDK();
const editorEntityCtrl = useEditorEntity();
const sceneUUID = router.currentRoute.value.params.client_side_uuid;
const name = ref(props.data ? props.data.recordData.name : '');
const type = ref(props.data ? props.data.recordData.scene_light_type_name : '');
const color = ref(props.data ? props.data.recordData.hexColor : '');
const intensity = ref(props.data ? props.data.recordData.intensity : 1);
const client_side_uuid = ref(props.data ? props.data.recordData.client_side_uuid : '');

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
    };

    if (params.client_side_uuid) {
        const client_side_uuid = params.client_side_uuid;
        await sdk.SceneLight.update(client_side_uuid, params);
        await editorEntityCtrl.updateLight(params);
        toastCtrl.add('Light updated', 5000, 'success');
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

        params.client_side_uuid = uuidv4();
        await sdk.SceneLight.create(params);
        await editorEntityCtrl.createLight(params);
        clearData();
        toastCtrl.add('Light created', 5000, 'success');
    }
}
</script>
