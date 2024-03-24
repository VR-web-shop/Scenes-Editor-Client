<template>
    <Dropdown ref="dropdown" class="shadow-lg absolute top-0 bg-slate-800 overflow-hidden rounded-md w-32 z-60"
        :otherTargets="otherTargets">

        <div class="p-3">
            <p class="text-sm mb-3">You got <span class="underline">2</span> products without mesh</p>
            <button class="border border-slate-500 rounded-md text-sm uppercase px-3 py-2 bg-gray-800/50 text-white hover:bg-gray-800">Solve</button>
        </div>
    </Dropdown>
</template>

<script setup>
import PlusIcon from '../Icons/PlusIcon.vue';
import Dropdown from '../UI/Dropdown.vue';
import { ref, defineExpose } from 'vue';

const props = defineProps({
    otherTargets: {
        type: Array,
        required: false,
        default: () => []
    }
})

const dropdown = ref()
const toggle = () => {
    dropdown.value.toggle()
}

defineExpose({
    toggle
})
</script>
