<template>
    <div class="mb-3 text-sm">
        <p class="mb-1 text-gray-500">{{ title }}</p>
        <div class="flex items-center justify-between gap-1 text-sm">
            <div class="w-1/3 flex items-center justify-between gap-1 bg-white/[.10]">
                <label for="x" class="px-1">X</label>
                <input type="number" placeholder="X" v-model="x" class="w-full p-1 bg-white/[.10]" />
            </div>

            <div class="w-1/3 flex items-center justify-between gap-1 bg-white/[.10]">
                <label for="y" class="px-1">Y</label>
                <input type="number" placeholder="Y" v-model="y" class="w-full p-1 bg-white/[.10]" />
            </div>

            <div class="w-1/3 flex items-center justify-between gap-1 bg-white/[.10]">
                <label for="z" class="px-1">Z</label>
                <input type="number" placeholder="Z" v-model="z" class="w-full p-1 bg-white/[.10]" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue';
const props = defineProps({
    title: {
        type: String,
        required: true
    }
})

const x = ref(0);
const y = ref(0);
const z = ref(0);

const getVector = () => {
    return {
        x: x.value,
        y: y.value,
        z: z.value
    }
}

const setVector = (vector) => {
    x.value = vector.x;
    y.value = vector.y;
    z.value = vector.z;
}

defineExpose({ x, y, z, getVector, setVector });
</script>