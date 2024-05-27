<template>
    <FormComponent 
        :submitMethod="submit" 
        :buttonText="client_side_uuid ? 'Update' : 'Create'" 
        :record="{
            name: { value: name, required: true, type: 'text' },
            material_type_name: { value: type, required: true, type: 'select-paginator', paginator: {
                    findMethod: sdk.MaterialType.findAll,
                    limit: 10,
                    emptyMessage: 'No types found',
                    foreignKey: 'name',
                    displayKey: 'name',
                    valueKey: 'name', 
                    placeholder: 'Select Type'
            }}
    }">
        <TextureConfigurator :textures="initialTextures" ref="textureConfiguratorRef" />
        <input v-if="client_side_uuid" type="hidden" name="client_side_uuid" :value="client_side_uuid" />
    </FormComponent>
</template>

<script setup>
import FormComponent from '../../UI/Form.vue';
import TextureConfigurator from './TextureConfigurator.vue';
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

const { sdk } = useSceneSDK();
const editorEntityCtrl = useEditorEntity();
const textureConfiguratorRef = ref();
const initialTextures = props.data ? props.data.Texture : [];
const name = ref(props.data ? props.data.name : '');
const type = ref(props.data ? props.data.material_type_name : '');
const client_side_uuid = ref(props.data ? props.data.client_side_uuid : '');

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const textures = textureConfiguratorRef.value.getTextures();
    const params = { ...toJson() };
    console.log(textures);

    if (client_side_uuid.value) {
        // Delete all material textures
        const res = await fetch(`${import.meta.env.VITE_SCENES_SERVER_URL}/api/v1/material/${client_side_uuid.value}/material_textures`)
        const materialData = await res.json();
        const materialTextures = materialData.materialTextures;
        for (const materialTexture of materialTextures) {
            await sdk.MaterialTexture.remove(materialTexture.client_side_uuid);
        }

        // Create new material textures
        for (const texture of textures) {
            await sdk.MaterialTexture.create({
                client_side_uuid: uuidv4(),
                material_client_side_uuid: params.client_side_uuid,
                texture_client_side_uuid: texture.client_side_uuid
            });
        }

        // Update material
        await sdk.Material.update(client_side_uuid.value, params);
        toastCtrl.add('Material updated successfully. Note: Updating materials will first take effect after reload due to complexity of changing materials in runtime.');

    } else {
        params.client_side_uuid = uuidv4();
        const material = await sdk.Material.create(params);

        for (const texture of textures) {
            await sdk.MaterialTexture.create({
                client_side_uuid: uuidv4(),
                material_client_side_uuid: material.client_side_uuid,
                texture_client_side_uuid: texture.client_side_uuid
            });
        }

        await editorEntityCtrl.createMaterial(material, textures);
        clearData();
        textureConfiguratorRef.value.clear();
        toastCtrl.add('Material created successfully');
    }
}
</script>