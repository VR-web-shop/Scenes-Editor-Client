<template>
    <FormComponent :submitMethod="submit" :buttonText="uuid ? 'Update' : 'Create'" :record="{
        name: { value: name, required: true, type: 'text' },
        source: { required: true, type: 'file', accept: 'image/*' },
        texture_type_name: {
            value: type, required: true, type: 'select-paginator', paginator: {
                findMethod: sdk.TextureType.findAll,
                limit: 10,
                emptyMessage: 'No types found',
                foreignKey: 'name',
                displayKey: 'name',
                valueKey: 'name',
                placeholder: 'Select Type'
            }
        }
    }">
        <input v-if="uuid" type="hidden" name="uuid" :value="uuid" />
    </FormComponent>
</template>

<script setup>
import FormComponent from '../../UI/Form.vue';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { ref } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const editorEntityCtrl = useEditorEntity();
const { sdk } = useSceneSDK();
const name = ref(props.data ? props.data.name : '');
const type = ref(props.data ? props.data.texture_type_name : '');
const uuid = ref(props.data ? props.data.uuid : '');

const submit = async (formData, toJson, clearData, toastCtrl) => {
    if (formData.get('client_side_uuid')) {
        await sdk.Texture.update(formData.get('client_side_uuid'), formData);
        toastCtrl.add('Texture updated. Note: Texture updates require reloading the scene for effect.', 5000, 'success');
    } else {
        const texture = await sdk.Texture.create(formData);
        editorEntityCtrl.createTexture(texture);
        toastCtrl.add('Texture created', 5000, 'success');
        clearData();
    }
}
</script>
