<template>
    <FormComponent 
        :submitMethod="submit" 
        :buttonText="uuid ? 'Update' : 'Create'" 
        :record="{
            name: { value: name, required: true, type: 'text' },
            hexColor: { value: color, required: true, type: 'color', placeholder: 'Select Color' },
            intensity: { value: intensity, required: true, type: 'number' },
            scene_light_type_name: { value: type, required: true, type: 'select-paginator', paginator: {
                    findMethod: sdk.api.SceneLightTypeController.findAll,
                    limit: 10,
                    emptyMessage: 'No types found',
                    foreignKey: 'name',
                    displayKey: 'name',
                    valueKey: 'name', 
                    placeholder: 'Select Type'
            }}
    }">
        <input type="hidden" name="scene_uuid" :value="sceneUUID" />
        <input v-if="uuid" type="hidden" name="uuid" :value="uuid" />
    </FormComponent>
</template>

<script setup>
import FormComponent from '../../UI/Form.vue';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { ref } from 'vue';
import { router } from '../../../router.js';

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const { sdk } = useSceneSDK();
const editorEntityCtrl = useEditorEntity();
const sceneUUID = router.currentRoute.value.params.sceneUUID;
const name = ref(props.data ? props.data.recordData.name : '');
const type = ref(props.data ? props.data.recordData.scene_light_type_name : '');
const color = ref(props.data ? props.data.recordData.hexColor : '');
const intensity = ref(props.data ? props.data.recordData.intensity : 1);
const uuid = ref(props.data ? props.data.recordData.uuid : '');

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
        responseInclude: [
                { model: 'Position' },
                { model: 'Rotation' }
            ]
    };

    if (params.uuid) {
        const light = await sdk.api.SceneLightController.update(params);
        await editorEntityCtrl.updateLight(light);
        toastCtrl.add('Light updated', 5000, 'success');
    } else {
        const light = await sdk.api.SceneLightController.create(params);
        await editorEntityCtrl.createLight(light);
        clearData();
        toastCtrl.add('Light created', 5000, 'success');
    }
}
</script>
