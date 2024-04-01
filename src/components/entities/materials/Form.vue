<template>
    <FormComponent 
        :submitMethod="submit" 
        :buttonText="uuid ? 'Update' : 'Create'" 
        :record="{
            name: { value: name, required: true, type: 'text' },
            material_type_name: { value: type, required: true, type: 'select-paginator', paginator: {
                    findMethod: sdk.api.MaterialTypeController.findAll,
                    limit: 10,
                    emptyMessage: 'No types found',
                    foreignKey: 'name',
                    displayKey: 'name',
                    valueKey: 'name', 
                    placeholder: 'Select Type'
            }}
    }">
        <TextureConfigurator :textures="initialTextures" ref="textureConfiguratorRef" />
        <input v-if="uuid" type="hidden" name="uuid" :value="uuid" />
    </FormComponent>
</template>

<script setup>
import FormComponent from '../../UI/Form.vue';
import TextureConfigurator from './TextureConfigurator.vue';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { ref } from 'vue';

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
const uuid = ref(props.data ? props.data.uuid : '');

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const textures = textureConfiguratorRef.value.getTextures();
    const params = {
        ...toJson(),
        responseInclude: [
            { model: 'Texture' }
        ]
    };

    if (params.uuid) {
        // Delete all material textures
        const { rows } = await sdk.api.MaterialTextureController.findAll({ limit: 1000, where: { 
            material_uuid: params.uuid 
        }});
        for (const materialTexture of rows) {
            await sdk.api.MaterialTextureController.destroy({ uuid: materialTexture.uuid });
        }

        // Create new material textures
        for (const texture of textures) {
            await sdk.api.MaterialTextureController.create({
                material_uuid: params.uuid,
                texture_uuid: texture.uuid
            });
        }

        // Update material
        await sdk.api.MaterialController.update(params);
        toastCtrl.add('Material updated successfully. Note: Updating materials will first take effect after reload due to complexity of changing materials in runtime.');

    } else {
        const material = await sdk.api.MaterialController.create(params);
        for (const texture of textures) {
            await sdk.api.MaterialTextureController.create({
                material_uuid: material.uuid,
                texture_uuid: texture.uuid
            });
        }

        await editorEntityCtrl.createMaterial(material, textures);
        clearData();
        textureConfiguratorRef.value.clear();
        toastCtrl.add('Material created successfully');
    }
}
</script>