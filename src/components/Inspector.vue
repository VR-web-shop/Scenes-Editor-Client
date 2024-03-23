<template>
  <div class="w-52 h-full">
    <div>
      <div class="p-2">
        <button @click="logout" class="text-xs w-full text-white bg-slate-600 px-2 py-1 rounded hover:bg-slate-700">
          Logout
        </button>
      </div>

      <div class="flex items-center justify-between p-2">
        <h2 class="text-sm uppercase font-bold text-white">
          Inspector
        </h2>
      </div>

      <Tab title="Objects">
        <Objects :editor="editor" />
      </Tab>

      <Tab title="Meshes">
        <Meshes :editor="editor" />
      </Tab>

      <Tab title="Materials">
        <Materials :editor="editor" />
      </Tab>

      <Tab title="Textures">
        <Textures :editor="editor" />
      </Tab>

      <Tab title="Scene">
        <Scene :editor="editor" />
      </Tab>
      
    </div>
  </div>
</template>

<script setup>
import Textures from './inspector/Textures.vue';
import Materials from './inspector/Materials.vue';
import Meshes from './inspector/Meshes.vue';
import Objects from './inspector/Objects.vue';
import Scene from './inspector/Scene.vue';
import Tab from './Tab.vue';
import { useAuthSDK } from '../composables/useAuthSDK.js';

const logout = async () => {
  const { sdk, authenticated } = useAuthSDK()
  await sdk.token.remove()
  authenticated.value = false
}

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
});

</script>
