<template>
    <FormComponent :submitMethod="submit" :buttonText="uuid ? 'Update' : 'Create'" :record="{
        name: { value: name, required: true, type: 'text' },
        source: { required: true, type: 'file' },
    }
        ">
            <SubmeshConfigurator :uuid="uuid" ref="submeshConfiguratorRef" />
            <input v-if="uuid" type="hidden" name="uuid" :value="uuid" />
    </FormComponent>
</template>

<script setup>
import SubmeshConfigurator from './SubmeshConfigurator.vue';
import FormComponent from '../../UI/Form.vue';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
import { ref } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const { sdk } = useSceneSDK();
const editorEntityCtrl = useEditorEntity();
const submeshConfiguratorRef = ref();
const name = ref(props.data ? props.data.name : '');
const uuid = ref(props.data ? props.data.uuid : '');

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const submeshConfigurations = submeshConfiguratorRef.value.getSubmeshConfigurations();
    for (const submesh of submeshConfigurations) {
        if (!submesh.submesh_name) {
            toastCtrl.add('All submeshes must have a name', 5000, 'error');
            return
        }
    }
    
    if (formData.get('uuid')) {
        // Delete existing submeshes
        const existingSubmeshes = await sdk.api.MeshMaterialController.findAll({ limit: 1000, where: { mesh_uuid: uuid.value } });
        for (const submesh of existingSubmeshes.rows) {
            await sdk.api.MeshMaterialController.destroy({ uuid: submesh.uuid });
        }

        // Create new submeshes
        for (const submesh of submeshConfigurations) {
            await sdk.api.MeshMaterialController.create({
                mesh_uuid: uuid.value,
                material_uuid: submesh.material.uuid,
                submesh_name: submesh.submesh_name
            });
        }

        // Update mesh
        await sdk.api.MeshController.update(formData);
        toastCtrl.add('Mesh updated successfully. Note: Updating meshes will first take effect after reload due to complexity of changing meshes in runtime.');
    } else {
        const mesh = await sdk.api.MeshController.create(formData);

        for (const submesh of submeshConfigurations) {
            await sdk.api.MeshMaterialController.create({
                mesh_uuid: mesh.uuid,
                material_uuid: submesh.material.uuid,
                submesh_name: submesh.submesh_name
            });
        }
        
        await editorEntityCtrl.createMesh(mesh, submeshConfigurations);
        toastCtrl.add('Mesh created successfully');
        clearData();
        submeshConfiguratorRef.value.clear();
    }
}


</script>