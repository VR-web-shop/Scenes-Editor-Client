<template>
    <FormComponent :submitMethod="submit" :buttonText="client_side_uuid ? 'Update' : 'Create'" :record="{
        name: { value: name, required: true, type: 'text' },
        source: { required: true, type: 'file' },
    }
        ">
            <SubmeshConfigurator :client_side_uuid="client_side_uuid" ref="submeshConfiguratorRef" />
            <input v-if="client_side_uuid" type="hidden" name="client_side_uuid" :value="client_side_uuid" />
    </FormComponent>
</template>

<script setup>
import SubmeshConfigurator from './SubmeshConfigurator.vue';
import FormComponent from '../../UI/Form.vue';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
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
const submeshConfiguratorRef = ref();
const name = ref(props.data ? props.data.name : '');
const client_side_uuid = ref(props.data ? props.data.client_side_uuid : '');

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const submeshConfigurations = submeshConfiguratorRef.value.getSubmeshConfigurations();
    for (const submesh of submeshConfigurations) {
        if (!submesh.submesh_name) {
            toastCtrl.add('All submeshes must have a name', 5000, 'error');
            return
        }
    }
    
    if (formData.get('client_side_uuid')) {
        // Delete existing submeshes
        const res = await fetch(`${import.meta.env.VITE_SCENES_SERVER_URL}/api/v1/mesh/${client_side_uuid.value}/mesh_materials`)
        const meshData = await res.json();
        const meshMaterials = meshData.meshMaterials;

        for (const submesh of meshMaterials) {
            await sdk.MeshMaterial.remove(submesh.client_side_uuid);
        }

        // Create new submeshes
        for (const submesh of submeshConfigurations) {
            await sdk.MeshMaterial.create({
                client_side_uuid: uuidv4(),
                mesh_client_side_uuid: client_side_uuid.value,
                material_client_side_uuid: submesh.material.client_side_uuid,
                submesh_name: submesh.submesh_name
            });
        }

        const token = localStorage.getItem('auth');
        await fetch(`${import.meta.env.VITE_SCENES_SERVER_URL}/api/v1/mesh/${client_side_uuid.value}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        toastCtrl.add('Mesh updated successfully. Note: Updating meshes will first take effect after reload due to complexity of changing meshes in runtime.');
    } else {
        const uuid = uuidv4();
        formData.append('client_side_uuid', uuid);
        const token = localStorage.getItem('auth');
        const res = await fetch(`${import.meta.env.VITE_SCENES_SERVER_URL}/api/v1/meshes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        const mesh = await res.json();

        for (const submesh of submeshConfigurations) {
            await sdk.MeshMaterial.create({
                client_side_uuid: uuidv4(),
                mesh_client_side_uuid: uuid,
                material_client_side_uuid: submesh.material.client_side_uuid,
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