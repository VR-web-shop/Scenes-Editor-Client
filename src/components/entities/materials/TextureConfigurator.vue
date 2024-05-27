<template>
    <div class="mb-3 text-sm">
        <p class="mb-3 text-white">
            Selected Textures
        </p>
        <div class="mb-3 pb-3 border-b border-gray-500">
            <p v-if="textures.length === 0" class="text-gray-500">None</p>
            <div v-else>
                <div v-for="texture in textures" :key="texture.client_side_uuid" class="p-2 bg-white/[.10] rounded-md mb-1">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center justify-start gap-2">
                            <span class="text-white">{{ texture.name }}</span>
                            <span class="bg-red-500 px-1 py-1 rounded-md text-white">
                                {{ texture.texture_type_name }}
                            </span>
                        </div>

                        <button type="button" @click="deselectTexture(texture)"
                            class="bg-red-500 text-white px-1 py-1 rounded-md">Remove</button>
                    </div>
                </div>
            </div>
        </div>

        <Paginator :findAllMethod="sdk.Texture.findAll" :limit="100">
            <template #empty>
                <div class="text-center">No textures found</div>
            </template>

            <template #default="{ entities }">
                <div v-for="texture in entities" :key="texture.client_side_uuid" class="p-2 bg-white/[.10] rounded-md mb-1">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center justify-start gap-2">
                            <span class="text-white">{{ texture.name }}</span>
                            <span class="bg-red-500 px-1 py-1 rounded-md text-white">
                                {{ texture.texture_type_name }}
                            </span>
                        </div>

                        <div v-if="!isSelected(texture) && isTextureTypeSelected(texture.texture_type_name)"
                            class="text-gray-500">
                            Only one of each type allowed
                        </div>

                        <div v-else-if="isSelected(texture)" class="text-gray-500">
                            Selected
                        </div>

                        <button v-else type="button" @click="selectTexture(texture)"
                            class="bg-emerald-500 text-white px-1 py-1 rounded-md">Select</button>
                    </div>
                </div>
            </template>

        </Paginator>
    </div>
</template>

<script setup>
import Paginator from '../../UI/Paginator.vue';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { ref, defineExpose, toRaw } from 'vue';

const { sdk } = useSceneSDK();

const props = defineProps({
    textures: {
        type: Array,
        default: []
    }
})

const textures = ref(props.textures);
const getTextures = () => toRaw(textures.value);
const clear = () => textures.value = [];

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

defineExpose({
    getTextures,
    clear
})
</script>