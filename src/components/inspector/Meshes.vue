<template>
    <div v-for="mesh in meshes" :key="mesh.mesh.name">
        <div class="flex items-center justify-between gap-3 overflow-hidden p-2">
            <p class="text-sm truncate">{{ mesh.mesh.name }}</p>
            
        </div>
    </div>
</template>

<script setup>
import PenIcon from '../Icons/PenIcon.vue';
import ReadCache from '../../editor/plugins/cache/readers/ReadCache.js';

import { computed } from 'vue';
const props = defineProps({
    editor: {
        type: Object,
        required: true
    }
});

const readMeshes = props.editor.newReader(ReadCache, 'meshes');
const meshes = computed(() => readMeshes.read());
</script>
