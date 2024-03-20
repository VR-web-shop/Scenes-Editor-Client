<template>
    <div>
        <div v-if="isRestricted">
            <div class="text-center mt-3">
                <h1 class="text-xl font-bold mb-3">Require Permissions</h1>
                <p>You do not have permission to view this content</p>
            </div>
        </div>

        <div v-else>
            <slot></slot>
        </div>
    </div>
</template>
<script setup>
import { usePermission } from '../composables/usePermission.js';
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
