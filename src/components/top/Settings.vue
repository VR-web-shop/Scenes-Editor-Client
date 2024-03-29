<template>
  <div class="flex gap-2">
    <button class="p-1 text-white shadow-md"
      :class="gridVisibility ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gray-800 hover:bg-gray-700'"
      title="Toggle grid visibility" @click="toggleGrid(editor)">
      <GridIcon width="0.8em" fill="white" />
    </button>

    <button class="p-1 text-white shadow-md"
      :class="lightVisibility ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gray-800 hover:bg-gray-700'"
      title="Toggle light visibility" @click="toggleLights(editor)">
      <LightBulbIcon width="0.8em" fill="white" />
    </button>

    <button class="p-1 text-white shadow-md"
      :class="basketVisibility ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gray-800 hover:bg-gray-700'"
      title="Toggle basket visibility" @click="toggleBaskets(editor)">
      <BasketIcon width="0.8em" fill="white" />
    </button>

    <button class="p-1 text-white shadow-md"
      :class="floorVisibility ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gray-800 hover:bg-gray-700'"
      title="Toggle floor visibility" @click="toggleFloors(editor)">
      <SquareIcon width="0.8em" fill="white" />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GridIcon from '../Icons/GridIcon.vue';
import LightBulbIcon from '../Icons/LightBulbIcon.vue';
import BasketIcon from '../Icons/BasketIcon.vue';
import SquareIcon from '../Icons/SquareIcon.vue';
import SetGridVisibility from '../../editor/src/view/commands/SetGridVisibility.js';
import SetObjectsVisibleByType from '../../editor/plugins/object/commands/SetObjectsVisibleByType.js';
import SetBasketVisible from '../../editor/plugins/object/commands/SetBasketVisible.js';

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
});

const gridVisibility = ref(true);
const toggleGrid = (editor) => {
  gridVisibility.value = !gridVisibility.value;
  editor.invoke(new SetGridVisibility(gridVisibility.value));
}

const lightVisibility = ref(true);
const toggleLights = (editor) => {
  lightVisibility.value = !lightVisibility.value;
  editor.invoke(new SetObjectsVisibleByType('Light', lightVisibility.value));
}

const basketVisibility = ref(true);
const toggleBaskets = (editor) => {
  basketVisibility.value = !basketVisibility.value;
  editor.invoke(new SetBasketVisible(basketVisibility.value));
}

const floorVisibility = ref(true);
const toggleFloors = (editor) => {
  floorVisibility.value = !floorVisibility.value;
  editor.invoke(new SetObjectsVisibleByType('Floor', floorVisibility.value));
}
</script>