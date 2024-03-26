<script setup>
import * as THREE from 'three';

import Restricted from '../components/UI/Restricted.vue';
import Loader from '../components/UI/Loader.vue';
import Tools from '../components/top/Tools.vue';
import Settings from '../components/top/Settings.vue';
import Inspector from '../components/inspector/Inspector.vue';
import Bottom from '../components/bottom/Bottom.vue';
import Editor from '../components/Editor.vue';

import LoadTexture from '../editor/plugins/cache/commands/LoadTexture.js';
import LoadMaterial from '../editor/plugins/cache/commands/LoadMaterial.js';
import LoadMesh from '../editor/plugins/cache/commands/LoadMesh';
import SetSceneColor from '../editor/src/view/commands/SetSceneColor.js';

import CreateObject from '../editor/plugins/object/commands/CreateObject';

import { useScene } from '../composables/useScene.js';

import { router } from '../router.js';
import { useSceneSDK } from '../composables/useScenesSDK.js';
import { ref, onMounted } from 'vue';

const editorRef = ref();
const frameRate = 15;
const sceneUUID = router.currentRoute.value.params.sceneUUID;

const sceneCtrl = useScene()

onMounted(async () => {
    const editor = editorRef.value.editor;
    editor.pause()
    sceneCtrl.setEditor(editor)
    await sceneCtrl.loadAllTextures()
    await sceneCtrl.loadAllMaterials()
    await sceneCtrl.loadAllMeshes()
    await sceneCtrl.loadScene(sceneUUID)
    editor.resume()
})
</script>

<template>
    <Restricted :permissions="['scenes-editor:client:access']">
        <div>
            <Editor ref="editorRef" :frameRate="frameRate">
                <template v-slot:executing="{ editor }">
                    <div class="fixed top-3 bottom-3 left-3 rounded">
                        <Inspector :editor="editor" />
                    </div>
                    
                    <div class="fixed top-0 right-0 p-3 flex flex-col gap-2 items-end">
                        <Tools :editor="editor" />
                        <Settings :editor="editor" />
                    </div>    

                    <Bottom />
                </template>

                <template v-slot:initializing="{ editor }">
                    <Loader title="Initializing Editor" message="Did you know you can upload your own 3D models?" />
                </template>

                <template v-slot:paused="{ editor }">
                    <Loader title="Paused Editor" message="Processing Calculations. This may take a few seconds..." />
                </template>

                <template v-slot:exiting="{ editor }">
                    <Loader title="Stopping Editor" message="This may take a few seconds..." />
                </template>

                <template v-slot:stopped="{ editor }">
                    <Loader title="Editor Stopped" message="Reload the page to start the editor again." />
                </template>

            </Editor>
        </div>
    </Restricted>
</template>
