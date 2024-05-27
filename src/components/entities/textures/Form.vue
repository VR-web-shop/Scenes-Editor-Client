<template>
    <FormComponent :submitMethod="submit" :buttonText="client_side_uuid ? 'Update' : 'Create'" :record="{
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
        <input v-if="client_side_uuid" type="hidden" name="client_side_uuid" :value="client_side_uuid" />
    </FormComponent>
</template>

<script setup>
import FormComponent from '../../UI/Form.vue';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
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
const name = ref(props.data ? props.data.name : '');
const type = ref(props.data ? props.data.texture_type_name : '');
const client_side_uuid = ref(props.data ? props.data.client_side_uuid : '');

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const token = localStorage.getItem('auth');
    const client_side_uuid = formData.get('client_side_uuid');
    if (client_side_uuid) {
        await fetch(`${import.meta.env.VITE_SCENES_SERVER_URL}/api/v1/texture/${client_side_uuid}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        toastCtrl.add('Texture updated. Note: Texture updates require reloading the scene for effect.', 5000, 'success');
    } else {
        formData.append('client_side_uuid', uuidv4());
        const res = await fetch(`${import.meta.env.VITE_SCENES_SERVER_URL}/api/v1/textures`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        const texture = await res.json();
        editorEntityCtrl.createTexture(texture);
        toastCtrl.add('Texture created', 5000, 'success');
        clearData();
    }
}
</script>
