<template>
    <form @submit.prevent="submit" class="p-3 text-white">
        <input type="text" placeholder="Name" v-model="name"
            class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]" />
        <input type="text" placeholder="Source" v-model="source"
            class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]" />

        <select v-model="type" class="w-full p-2 text-sm mb-3 bg-white/[.10] rounded-md">
            <option value="" class="text-black">Select Type</option>
            <option v-for="textureType in textureTypes" :key="textureType.uuid" :value="textureType.name"
                class="text-black">
                {{ textureType.name }}
            </option>
        </select>
        
        <button type="submit" class="border border-gray-300 px-3 py-1 rounded">
            {{ uuid ? 'Update' : 'Create' }}
        </button>
    </form>
</template>

<script setup>
import LoadTexture from '../../../editor/plugins/cache/commands/LoadTexture.js';
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
const editorCtrl = useEditor();
const toastCtrl = useToast();
const textureTypes = ref([]);
const name = ref(props.data ? props.data.name : '');
const source = ref(props.data ? props.data.source : '');
const type = ref(props.data ? props.data.texture_type_name : '');
const uuid = ref(props.data ? props.data.uuid : '');

const submit = async () => {

    if (!name.value) {
        toastCtrl.add('Name is required', 5000, 'error');
        return
    }

    if (!source.value) {
        toastCtrl.add('Source is required', 5000, 'error');
        return
    }

    if (!type.value) {
        toastCtrl.add('Type is required', 5000, 'error');
        return
    }

    // Check if the source exists
    const response = await fetch(source.value)
    if (!response.ok) {
        toastCtrl.add(`Invalid source: ${source.value}`, 5000, 'error');
        return
    }
    // Check if the source is an image
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image')) {
        toastCtrl.add(`Invalid source: ${source.value}`, 5000, 'error');
        return
    }

    if (uuid.value) {
        await sdk.api.TextureController.update({
            uuid: uuid.value,
            name: name.value,
            source: source.value,
            texture_type_name: type.value
        });
        console.log('Todo: update command')
        //await editorCtrl.invoke(new UpdateTexture(texture.name, texture.source, texture.texture_type_name));
        toastCtrl.add('Texture update', 5000, 'success');
    } else {
        const newTexture = await sdk.api.TextureController.create({
            name: name.value,
            source: source.value,
            texture_type_name: type.value
        });
        await editorCtrl.invoke(new LoadTexture(newTexture.uuid, newTexture.source, newTexture.texture_type_name));
        toastCtrl.add('Texture created', 5000, 'success');

        name.value = '';
        source.value = '';
        type.value = '';
    }
}

onBeforeMount(async () => {
    const { rows } = await sdk.api.TextureTypeController.findAll({ limit: 100 });
    textureTypes.value = rows
});

</script>