<template>
    <form @submit.prevent="submit" class="p-3 text-white">
        <input type="text" placeholder="Name" v-model="name" class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]" />

        <select v-model="type" class="w-full p-2 text-sm mb-1 bg-white/[.10] rounded-md mb-3">
            <option value="" class="text-black">Select Type</option>
            <option v-for="materialType in materialTypes" :key="materialType.name" :value="materialType.name" class="text-black">
                {{ materialType.name }}
            </option>
        </select>

        <div class="mb-3 text-sm">
            <p class="mb-3 text-white">
                Selected Textures
            </p>
            <div class="mb-3 pb-3 border-b border-gray-500">
                <p v-if="textures.length === 0" class="text-gray-500">None</p>
                <div v-else>
                    <div v-for="texture in textures" :key="texture.uuid" class="p-2 bg-white/[.10] rounded-md mb-1">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center justify-start gap-2">
                                <span class="text-white">{{ texture.name }}</span>
                                <span class="bg-red-500 px-1 py-1 rounded-md text-white">
                                    {{ texture.texture_type_name }}
                                </span>
                            </div>

                            <button type="button" @click="deselectTexture(texture)" class="bg-red-500 text-white px-1 py-1 rounded-md">Remove</button>
                        </div>
                    </div>
                </div>
            </div>

            <Paginator :findAllMethod="sdk.api.TextureController.findAll" :limit="100">
                <template #empty>
                    <div class="text-center">No textures found</div>
                </template>

                <template #default="{ entities }">
                    <div v-for="texture in entities" :key="texture.id" class="p-2 bg-white/[.10] rounded-md mb-1">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center justify-start gap-2">
                                <span class="text-white">{{ texture.name }}</span>
                                <span class="bg-red-500 px-1 py-1 rounded-md text-white">
                                    {{ texture.texture_type_name }}
                                </span>
                            </div>

                            <div v-if="!isSelected(texture) && isTextureTypeSelected(texture.texture_type_name)" class="text-gray-500">
                                Only one of each type allowed
                            </div>
                            
                            <div v-else-if="isSelected(texture)" class="text-gray-500">
                                Selected
                            </div>
                            
                            <button v-else type="button" @click="selectTexture(texture)" class="bg-emerald-500 text-white px-1 py-1 rounded-md">Select</button>
                        </div>
                    </div>
                </template>

            </Paginator>
        </div>

        <button type="submit" class="border border-gray-300 px-3 py-1 rounded text-white">Create</button>
    </form>
</template>

<script setup>
import Paginator from '../../UI/Paginator.vue';
import LoadMaterial from '../../../editor/plugins/cache/commands/LoadMaterial.js';
import { useEditor } from '../../../composables/useEditor.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { useToast } from '../../../composables/useToast.js';
import { ref, onBeforeMount } from 'vue';

const { sdk } = useSceneSDK();
const editorCtrl = useEditor();
const toastCtrl = useToast();
const materialTypes = ref([]);
const textures = ref([]);
const name = ref('');
const type = ref('');

const selectTexture = (texture) => {
    textures.value.push(texture);
}

const deselectTexture = (texture) => {
    textures.value = textures.value.filter(t => t !== texture);
}

const isSelected = (texture) => {
    return textures.value.includes(texture);
}

const isTextureTypeSelected = (textureType) => {
    return textures.value.some(t => t.texture_type_name === textureType);
}

const submit = async () => {
    if (!name.value) {
        toastCtrl.add('Name is required', 5000, 'error');
        return
    }

    if (!type.value) {
        toastCtrl.add('Type is required', 5000, 'error');
        return     
    }

    const material = await sdk.api.MaterialController.create({
        name: name.value,
        material_type_name: type.value
    });

    for (const texture of textures.value) {
        await sdk.api.MaterialTextureController.create({
            material_uuid: material.uuid,
            texture_uuid: texture.uuid
        });
    }

    
    const textureNames = textures.value.map(t => t.name);
    await editorCtrl.invoke(new LoadMaterial(material.name, material.material_type_name, textureNames));

    name.value = '';
    type.value = '';
    textures.value = [];

    toastCtrl.add('Material created successfully');
}

onBeforeMount(async () => {
    const { rows } = await sdk.api.MaterialTypeController.findAll({ limit: 100 });
    materialTypes.value = rows
});
</script>