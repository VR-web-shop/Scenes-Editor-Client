<template>
  <div class="w-52 h-full">
    <div>
      <div class="text-xs text-white p-2">
        <button @click="logout" class="flex items-center justify-between gap-3 w-full bg-slate-600 px-2 py-1 rounded-md hover:bg-slate-700">
          <span>Logout</span>
          <LogoutIcon fill="white" width="0.8em" />
        </button>
      </div>

      <div class="flex items-center justify-between p-2">
        <h2 class="text-sm uppercase font-bold text-white">
          Inspector
        </h2>

        <div class="relative flex items-center justify-between gap-1">
          <button class="bg-green-500 p-1 rounded-md hover:bg-green-800" title="Save">
            <CheckmarkIcon fill="white" width="0.8em" />
          </button>

          <button @click="dropdownBell.toggle" ref="bellBtn" title="Notifications" class="bg-red-500 hover:bg-red-800 p-1 rounded-md">
            <BellIcon fill="white" width="0.8em" class="animate-shake" />
          </button>

          <button @click="dropdownAdd.toggle" ref="addBtn" title="Add" class="bg-blue-500 hover:bg-blue-800 p-1 rounded-md">
            <PlusIcon fill="white" width="0.8em" />
          </button>

          <NotificationsDropdown ref="dropdownBell" :otherTargets="[bellBtn]" />
          <PopupDropdown ref="dropdownAdd" :otherTargets="[addBtn]" />
        </div>


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
import Textures from './Textures.vue';
import Materials from './Materials.vue';
import Meshes from './Meshes.vue';
import Objects from './Objects.vue';
import Scene from './Scene.vue';
import Tab from './Tab.vue';
import NotificationsDropdown from './NotificationsDropdown.vue';
import PopupDropdown from './PopupDropdown.vue';
import PlusIcon from '../Icons/PlusIcon.vue';
import BellIcon from '../Icons/BellIcon.vue';
import LogoutIcon from '../Icons/LogoutIcon.vue';
import CheckmarkIcon from '../Icons/CheckmarkIcon.vue';
import { useAuthSDK } from '../../composables/useAuthSDK.js';
import { ref } from 'vue';


const dropdownAdd = ref()
const dropdownBell = ref()
const addBtn = ref()
const bellBtn = ref()

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
});

const logout = async () => {
  const { sdk, authenticated } = useAuthSDK()
  await sdk.token.remove()
  authenticated.value = false
}

</script>

<style scoped>
.animate-shake {
  animation: shake 2s infinite;
}

@keyframes shake {
  0% {
    transform: translate(0, 0);
    rotate: (0deg);
  }

  5% {
    transform: translate(-2px, 0);
    rotate: (-5deg);
  }

  10% {
    transform: translate(2px, 0);
    rotate: (5deg);
  }

  15% {
    transform: translate(-2px, 0);
    rotate: (-5deg);
  }

  20% {
    transform: translate(2px, 0);
    rotate: (5deg);
  }

  21% {
    transform: translate(0, 0);
    rotate: (0deg);
  }
}
</style>