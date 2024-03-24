<template>
    <div class="p-3">
        <div class="border-b border-white mb-1 pb-1 flex items-center justify-between gap-3">
            <p>Background:</p>
            <p>{{ background }}</p>
        </div>

        <div>
            <p class="text-xs uppercase text-bold mb-1">
                Set color
            </p>

            <div class="flex items-center justify-between gap-3">
                <input type="color" v-model="colorInput" class="w-full h-6 border-none px-1 bg-black" />
                <button class="bg-slate-600 hover:bg-slate-500 rounded text-xs px-2 py-1 h-6" @click="setBackgroundColor()">Save</button>
            </div>
        </div>
        
    </div>
</template>

<script setup>
import * as THREE from 'three';
import ReadScene from '../../editor/src/view/readers/ReadScene.js';
import SetSceneColor from '../../editor/src/view/commands/SetSceneColor.js';
import { router } from '../../router.js';
import { useSceneSDK } from '../../composables/useScenesSDK.js';
import { ref, computed, onBeforeMount } from 'vue';

const props = defineProps({
    editor: {
        type: Object,
        required: true
    }
});

const { sdk } = useSceneSDK();
const sceneUUID = router.currentRoute.value.params.sceneUUID;
const readView = props.editor.newReader(ReadScene);
const scene = computed(() => readView.read());

const colorInput = ref(0x000000)
const setBackgroundColor = async () => {
    const hex = colorInput.value;
    await props.editor.invoke(new SetSceneColor(hex));
    const { SceneBackground } = await sdk.api.SceneController.find({ uuid: sceneUUID }, { include: 'scene_backgrounds' });
    sdk.api.SceneBackgroundController.update({ uuid: SceneBackground.uuid, hex });
}

const background = computed(() => {
    if (scene.value === null) {
        return "No scene";
    }

    if (scene.value.background instanceof THREE.Color) {
        return "#" + scene.value.background.getHexString();
    }

    if (scene.value.background instanceof THREE.Texture) {
        return "Cube Texture";
    }

    return "Unknown background type";
});

const basket = ref(null);

onBeforeMount(async () => {
    const { rows } = await sdk.api.SceneController.findAll({ 
        limit: 100,
        where: { uuid: sceneUUID }, 
        include: [
            { model: 'SceneBackground' },
            { model: 'SceneBasket', include: ['Object']}
        ]
    });
    const { SceneBackground, SceneBasket } = rows[0];
    colorInput.value = SceneBackground.hex;
});
</script>
