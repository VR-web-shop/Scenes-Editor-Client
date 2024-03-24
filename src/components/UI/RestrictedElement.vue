<template>
    <div v-if="!isRestricted">
        <slot></slot>
    </div>
</template>
<script setup>
import { usePermission } from '../../composables/usePermission.js';
import { ref, onBeforeMount } from 'vue'

const isRestricted = ref(true)
const props = defineProps({
    permissions: {
        type: Array,
        required: true
    }
})
onBeforeMount(() => {
    for (const permission of props.permissions) {
        if (usePermission(permission)) {
            isRestricted.value = false
            break
        }
    }
})
</script>
