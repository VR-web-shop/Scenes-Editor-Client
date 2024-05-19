<template>
    <div class="p-3">
        

        <div class="mb-3 pb-3 border-b border-gray-300">
            <div class="flex items-center justify-between gap-3 text-xs uppercase mb-2">
                <p class="text-bold">
                    Set color
                </p>

                <div>
                    <p>{{ background }}</p>
                </div>
            </div>

            <div class="flex justify-between gap-3">
                <input type="color" v-model="colorInput" class="w-full h-10 border-none px-1 bg-black" />
                <button class="border border-gray-300 px-3 py-1 rounded" @click="setBackgroundColor()">
                    Update
                </button>
            </div>
        </div>

        <div>
            <div class="flex items-center justify-between gap-3 text-xs uppercase mb-2">
                <p class="text-bold">
                    Set name
                </p>

                <div>
                    <p>{{ name }}</p>
                </div>
            </div>

            <form @submit.prevent="submit" class="text-white flex justify-between gap-3">
                <input type="text" placeholder="Name" v-model="name" class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]" />
            
                <button type="submit" class="border border-gray-300 px-3 py-1 rounded">
                    Update
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import * as THREE from 'three';
import ReadScene from '../../../editor/src/view/readers/ReadScene.js';
import SetSceneColor from '../../../editor/src/view/commands/SetSceneColor.js';
import { router } from '../../../router.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { useEditor } from '../../../composables/useEditor.js';
import { useToast } from '../../../composables/useToast.js';
import { ref, computed, onBeforeMount } from 'vue';

const { sdk } = useSceneSDK();
const toastCtrl = useToast();
const editorCtrl = useEditor();
const client_side_uuid = router.currentRoute.value.params.client_side_uuid;

const name = ref('');
const readView = editorCtrl.newReader(ReadScene);
const scene = ref(readView.read());
const dbScene = ref(null);
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

const colorInput = ref(0x000000)
const setBackgroundColor = async () => {
    const hex = colorInput.value;
    await editorCtrl.invoke(new SetSceneColor(hex));
    await sdk.SceneBackground.update(dbScene.value.scene_background.client_side_uuid, { hex });
    scene.value.background = new THREE.Color(hex);
}

const submit = async () => {
    if (!name.value) {
        toastCtrl.add('Name is required', 5000, 'error');
        return
    }
    await sdk.Scene.update(client_side_uuid, { name: name.value, active: true });
    toastCtrl.add('Scene name updated', 5000, 'success');
}

onBeforeMount(async () => {
    const { rows } = await sdk.Scene.active();
    const scene = rows[0];
    const sceneBackground = scene.scene_background;

    colorInput.value = sceneBackground.hex;
    name.value = scene.name;
    dbScene.value = scene;
});
</script>
