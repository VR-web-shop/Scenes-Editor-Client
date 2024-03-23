<script setup>
import * as THREE from 'three';

import Restricted from '../components/Restricted.vue';
import Loader from '../components/Loader.vue';
import Tools from '../components/Tools.vue';
import Settings from '../components/Settings.vue';
import Inspector from '../components/Inspector.vue';
import Editor from '../components/Editor.vue';

import LoadTexture from '../editor/plugins/cache/commands/LoadTexture.js';
import LoadMaterial from '../editor/plugins/cache/commands/LoadMaterial.js';
import LoadMesh from '../editor/plugins/cache/commands/LoadMesh';
import SetSceneColor from '../editor/src/view/commands/SetSceneColor.js';

import CreateObject from '../editor/plugins/object/commands/CreateObject';

import { useScene } from '../composables/useScene.js';

import { router } from '../router.js';
import { useSceneSDK } from '../composables/useScenesSDK.js';
import { ViewConfiguration } from '../editor/editor.js';
import { ref, onMounted } from 'vue';

const editorRef = ref();
const frameRate = 15;
const viewConfiguration = new ViewConfiguration();
const sceneUUID = router.currentRoute.value.params.sceneUUID;

const sceneCtrl = useScene()

onMounted(async () => {
  viewConfiguration.sceneConfig.instance.background = new THREE.Color(0xCCCDDD);
    const editor = editorRef.value.editor;
    console.log('Preload:', editor)
    editor.pause()

    sceneCtrl.setEditor(editor)
    await sceneCtrl.loadAllTextures()
    await sceneCtrl.loadAllMaterials()
    await sceneCtrl.loadAllMeshes()
    await sceneCtrl.loadScene(sceneUUID)

    /*
    const textures = await sdk.api.TextureController.findAll({ limit: 100 })
    for (const texture of textures.rows) {
        await editor.invoke(new LoadTexture(texture.name, texture.source, texture.texture_type_name))
    }

    const materials = await sdk.api.MaterialController.findAll({ limit: 100, include: 'Texture' })

    for (const material of materials.rows) {
        const textureNames = material.Texture.map(texture => texture.name)
        await editor.invoke(new LoadMaterial(material.name, material.material_type_name, textureNames))
    }*/

    /*
    if (preload.textures) {
        for (const texture of preload.textures) {
            await editor.value.invoke(new LoadTexture(texture.name, texture.src, texture.type))
        }
    }

    if (preload.materials) {
        for (const material of preload.materials) {
            await editor.value.invoke(new LoadMaterial(material.name, material.type, material.textures))
        }
    }

    if (preload.meshes) {
        for (const mesh of preload.meshes) {
            const subMeshConfigurations = mesh.subMeshConfigurations.map(subMeshConfiguration => {
                return new SubMeshConfiguration(subMeshConfiguration.subMeshName, subMeshConfiguration.materialName)
            })

            await editor.value.invoke(new LoadMesh(mesh.name, mesh.src, subMeshConfigurations))
        }
    }

    if (preload.objects) {
        for (const object of preload.objects) {
            await editor.value.invoke(new CreateObject(object.name, object.position, object.rotation, object.scale))
        }
    }

    if (preload.scene) {
        if (preload.scene.color) {
            await editor.value.invoke(new SetSceneColor(preload.scene.color))
        }
        
        if (preload.scene.cubeMap) {
            const { path, px, nx, py, ny, pz, nz } = preload.scene.cubeMap
            await editor.value.invoke(new SetSceneCubeMap(path, px, py, pz, nx, ny, nz))
        }
    }*/

    editor.resume()
})
</script>

<template>
    <Restricted :permissions="['scenes-editor:client:access']">
        <div>
            <Editor ref="editorRef" :viewConfiguration="viewConfiguration" :frameRate="frameRate">
                <template v-slot:executing="{ editor }">
                    <div class="bg-gray-500/50 shadow-md text-white fixed top-3 bottom-3 left-3 rounded">
                        <Inspector :editor="editor" />
                    </div>
                    
                    <div class="fixed top-0 right-0 p-3 flex flex-col gap-2 items-end">
                        <Tools :editor="editor" />
                        <Settings :editor="editor" />
                    </div>    
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
