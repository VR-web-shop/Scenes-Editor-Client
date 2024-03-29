<template>
    <form @submit.prevent="submit" class="p-3 text-white">
        <input type="text" placeholder="Name" v-model="name"
            class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]" />
        <input type="text" placeholder="Source" v-model="source"
            class="w-full text-sm p-2 mb-3 rounded-md bg-white/[.10]" />

        <div class="mb-3 text-sm">
            <p class="mb-3 text-white">
                Submesh Configuration
            </p>
            <div class="mb-3 pb-3 border-b border-gray-500 max-h-[200px] overflow-y-auto">
                <p v-if="submeshConfigurations.length === 0" class="text-gray-500">None</p>
                <div v-else>
                    <div v-for="submeshConfiguration in submeshConfigurations" :key="submeshConfiguration.material.uuid"
                        class="p-2 bg-white/[.10] rounded-md mb-1">
                        <div class="flex justify-between gap-3">
                            <div class="w-full">
                                <input type="text" placeholder="Submesh Name"
                                    v-model="submeshConfiguration.submesh_name"
                                    class="w-full text-white p-2 mb-1 rounded-md bg-white/[.10]" />
                                <div class="flex gap-1 text-white text-sm">
                                    <span class="font-bold">Material:</span>
                                    <span>{{ submeshConfiguration.material.name }}</span>
                                </div>
                            </div>

                            <button type="button" @click="removeConfig(submeshConfiguration)"
                                class="bg-red-500 text-white px-1 py-1 rounded-md">Remove</button>
                        </div>
                    </div>
                </div>
            </div>

            <Paginator :findAllMethod="sdk.api.MaterialController.findAll" :limit="100">
                <template #empty>
                    <div class="text-center">No materials found</div>
                </template>

                <template #default="{ entities }">
                    <div v-for="material in entities" :key="material.uuid" class="p-2 bg-white/[.10] rounded-md mb-1">
                        <div class="flex items-center justify-between gap-3">
                            <span class="text-white">{{ material.name }}</span>

                            <div class="flex items-center justify-start gap-2">
                                <span class="bg-red-500 px-1 py-1 rounded-md text-white">
                                    {{ material.material_type_name }}
                                </span>

                                <button type="button" @click="addMaterial(material)"
                                    class="bg-emerald-500 text-white px-1 py-1 rounded-md">Add</button>
                            </div>
                        </div>
                    </div>
                </template>

            </Paginator>
        </div>

        <button type="submit" class="border border-gray-300 px-3 py-1 rounded">
            {{ uuid ? 'Update' : 'Create' }}
        </button>
    </form>
</template>

<script setup>
import Paginator from '../../UI/Paginator.vue';
import LoadMesh from '../../../editor/plugins/cache/commands/LoadMesh.js';
import { useEditor } from '../../../composables/useEditor.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { useToast } from '../../../composables/useToast.js';
import { ref, onBeforeMount } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const { sdk } = useSceneSDK();
const toastCtrl = useToast();
const editorCtrl = useEditor();
const name = ref(props.data ? props.data.name : '');
const source = ref(props.data ? props.data.source : '');
const uuid = ref(props.data ? props.data.uuid : '');
const submeshConfigurations = ref([]);

const addMaterial = (material, submesh_name = '') => {
    const id = submeshConfigurations.value.length + 1;
    submeshConfigurations.value.push({ id, submesh_name, material });
}

const removeConfig = (config) => {
    submeshConfigurations.value = submeshConfigurations.value.filter((submesh) => submesh.id !== config.id);
}

const submit = async () => {
    if (!name.value) {
        toastCtrl.add('Name is required', 5000, 'error');
        return
    }

    if (!source.value) {
        toastCtrl.add('Source is required', 5000, 'error');
        return
    }

    for (const submesh of submeshConfigurations.value) {
        if (!submesh.submesh_name) {
            toastCtrl.add('All submeshes must have a name', 5000, 'error');
            return
        }
    }

    if (uuid.value) {
        // Delete existing submeshes
        const existingSubmeshes = await sdk.api.MeshMaterialController.findAll({ limit: 1000, where: { mesh_uuid: uuid.value } });
        for (const submesh of existingSubmeshes.rows) {
            await sdk.api.MeshMaterialController.destroy({ uuid: submesh.uuid });
        }

        // Create new submeshes
        for (const submesh of submeshConfigurations.value) {
            await sdk.api.MeshMaterialController.create({
                mesh_uuid: uuid.value,
                material_uuid: submesh.material.uuid,
                submesh_name: submesh.submesh_name
            });
        }

        // Update mesh
        const mesh = await sdk.api.MeshController.update({
            uuid: uuid.value,
            name: name.value,
            source: source.value,
            responseInclude: [
                { model: 'Material' }
            ]
        });

        toastCtrl.add('Mesh updated successfully. Note: Updating meshes will first take effect after reload due to complexity of changing meshes in runtime.');
    } else {
        const mesh = await sdk.api.MeshController.create({
            name: name.value,
            source: source.value
        });

        for (const submesh of submeshConfigurations.value) {
            await sdk.api.MeshMaterialController.create({
                mesh_uuid: mesh.uuid,
                material_uuid: submesh.material.uuid,
                submesh_name: submesh.submesh_name
            });
        }

        const submeshes = submeshConfigurations.value.map((submesh) => {
            return new LoadMesh.SubMeshConfiguration(submesh.submesh_name, submesh.material.name);
        });
        await editorCtrl.invoke(new LoadMesh(mesh.uuid, mesh.source, submeshes));

        name.value = '';
        source.value = '';
        submeshConfigurations.value = [];

        toastCtrl.add('Mesh created successfully');
    }
}

onBeforeMount(async () => {
    if (uuid.value) {
        const { rows } = await sdk.api.MeshMaterialController.findAll({
            limit: 1000, where: { mesh_uuid: uuid.value }, include: [
                { model: 'Material' }
            ]
        });
        for (const meshMaterial of rows) {
            addMaterial(meshMaterial.Material, meshMaterial.submesh_name);
        }
    }
});
</script>