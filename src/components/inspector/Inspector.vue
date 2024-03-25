<template>
  <div class="relative">
    <NotificationsDropdown ref="dropdownBell" :otherTargets="[bellBtn]" />
    <CreateEntityDropdown ref="dropdownAdd" :otherTargets="[addBtn]" />

    <div class="rounded-md">

      <button @click="saveScene" title="Save" 
        class="bg-green-500 p-1 hover:bg-green-800 flex items-center justify-center w-8 h-8">
        <CheckmarkIcon fill="white" width="0.8em" />
      </button>

      <button @click="dropdownBell.dropdown.toggle" ref="bellBtn" title="Notifications"
        class="relative bg-red-500 hover:bg-red-800 p-1 flex items-center justify-center w-8 h-8">
        <BellIcon fill="white" width="0.8em" class="z-1" :class="notificationsCount > 0 ? 'animate-shake' : ''" />
        <span v-if="notificationsCount > 0" class="absolute top-0 right-0 -mt-1 -mr-1 bg-red-800 text-xs text-white rounded-full px-1">{{ notificationsCount }}</span>
      </button>

      <button @click="dropdownAdd.toggle" ref="addBtn" title="Add" 
        class="bg-blue-500 hover:bg-blue-800 p-1 flex items-center justify-center w-8 h-8">
        <PlusIcon fill="white" width="0.8em" />
      </button>

      <button v-for="popup in popups" :key="popup.id" @click="popupCtrl.open(popup.id)" :title="popup.title"
        class="bg-slate-800 hover:bg-slate-500 p-1 flex items-center justify-center w-8 h-8">
        <component :is="popup.icon" fill="white" width="0.8em" />
      </button>

      <button @click="logout"
        class="bg-slate-600 p-1 hover:bg-slate-700 flex items-center justify-center w-8 h-8">
        <LogoutIcon fill="white" width="0.8em" />
      </button>

    </div>
  </div>
</template>

<script setup>
import NotificationsDropdown from './NotificationsDropdown.vue';
import CreateEntityDropdown from './CreateEntityDropdown.vue';

import PlusIcon from '../Icons/PlusIcon.vue';
import BellIcon from '../Icons/BellIcon.vue';
import LogoutIcon from '../Icons/LogoutIcon.vue';
import CheckmarkIcon from '../Icons/CheckmarkIcon.vue';
import ImageIcon from '../Icons/ImageIcon.vue';
import CircleIcon from '../Icons/CircleIcon.vue';
import CubeIcon from '../Icons/CubeIcon.vue';
import LayerGroupIcon from '../Icons/LayerGroupIcon.vue';
import SceneIcon from '../Icons/SceneIcon.vue';

import { router } from '../../router.js';
import { usePopups } from '../../composables/usePopups.js';
import { useScene } from '../../composables/useScene.js';
import { useAuthSDK } from '../../composables/useAuthSDK.js';
import { useNotifications } from '../../composables/useNotifications.js';
import { ref, computed } from 'vue';

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
});

const popupCtrl = usePopups()
const popups = [
  {id: 'objects-index', title: 'Objects', icon: LayerGroupIcon},
  {id: 'meshes-index', title: 'Meshes', icon: CubeIcon},
  {id: 'materials-index', title: 'Materials', icon: CircleIcon},
  {id: 'textures-index', title: 'Textures', icon: ImageIcon},
  {id: 'scene-edit', title: 'Scene', icon: SceneIcon}
]

const dropdownAdd = ref()
const dropdownBell = ref()
const addBtn = ref()

const bellBtn = ref()
const notificationsCtrl = useNotifications()
const notificationsCount = computed(() => notificationsCtrl.notifications.value.length)

const sceneUUID = router.currentRoute.value.params.sceneUUID
const sceneCtrl = useScene().setEditor(props.editor)
const saveScene = async () => await sceneCtrl.saveScene(sceneUUID)

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