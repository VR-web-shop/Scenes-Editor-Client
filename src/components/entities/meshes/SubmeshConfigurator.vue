<template>
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
                            <input type="text" placeholder="Submesh Name" v-model="submeshConfiguration.submesh_name"
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

        <Paginator :findAllMethod="sdk.Material.findAll" :limit="100">
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
</template>

<script setup>
import Paginator from '../../UI/Paginator.vue';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { ref, toRaw, onBeforeMount, defineExpose } from 'vue';
const props = defineProps({
    uuid: {
        type: String,
        default: null
    }
});

const { sdk } = useSceneSDK();
const submeshConfigurations = ref([]);
const getSubmeshConfigurations = () => toRaw(submeshConfigurations.value);
const clear = () => submeshConfigurations.value = [];

const addMaterial = (material, submesh_name = '') => {
    const id = submeshConfigurations.value.length + 1;
    submeshConfigurations.value.push({ id, submesh_name, material });
}

const removeConfig = (config) => {
    submeshConfigurations.value = submeshConfigurations.value.filter((submesh) => submesh.id !== config.id);
}

onBeforeMount(async () => {
    if (props.uuid) {
        const { rows } = await sdk.api.MeshMaterialController.findAll({
            limit: 1000, where: { mesh_uuid: props.uuid }, include: [
                { model: 'Material' }
            ]
        });
        for (const meshMaterial of rows) {
            addMaterial(meshMaterial.Material, meshMaterial.submesh_name);
        }
    }
});

defineExpose({ getSubmeshConfigurations, clear });
</script>