<template>
    <div class="flex">
        <button v-for="tool in tools" :key="tool.name"
            :title="tool.name"
            class="px-2 py-1 text-xs text-white shadow-md"
            :class="tool.handler.isActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gray-800 hover:bg-gray-700'"
            @click="toggleTool(tool.handler)">
            <div class="p-1">
              <component :is="icons[tool.icon]" fill="white" width="1.2em" />
            </div>
          </button>
    </div>
</template>

<script setup>
import MoveIcon from '../Icons/MoveIcon.vue';
import RotateIcon from '../Icons/RotateIcon.vue';
import ScaleIcon from '../Icons/ScaleIcon.vue';
import MirrorIcon from '../Icons/MirrorIcon.vue';

import ActivateTool from '../../editor/plugins/tool/commands/ActivateTool.js';
import DeactivateTool from '../../editor/plugins/tool/commands/DeactivateTool.js';

import MoveTool from '../../editor/plugins/tool/tools/MoveTool.js';
import RotateTool from '../../editor/plugins/tool/tools/RotateTool.js';
import ScaleTool from '../../editor/plugins/tool/tools/ScaleTool.js';
import MirrorTool from '../../editor/plugins/tool/tools/MirrorTool.js';
import { ref } from 'vue';

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
});

const tools = ref([
  { name: 'Move', handler: new MoveTool(), icon: 'MoveIcon' },
  { name: 'Rotate', handler: new RotateTool(), icon: 'RotateIcon' },
  { name: 'Scale', handler: new ScaleTool(), icon: 'ScaleIcon' },
  { name: 'Mirror', handler: new MirrorTool(), icon: 'MirrorIcon' }
]);
const icons = { MoveIcon, RotateIcon, ScaleIcon, MirrorIcon };
const toggleTool = (tool) => {
  if (tool.isActive) {
    props.editor.invoke(new DeactivateTool());
  } else {
    props.editor.invoke(new ActivateTool(tool));
  }
}
</script>