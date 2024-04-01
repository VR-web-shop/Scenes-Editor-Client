<template>
    <div class="text-sm">
        <p class="mb-1 text-gray-500">{{ title }}</p>
        <div class="flex items-center justify-between gap-1 text-sm">
            <div class="w-1/3 flex items-center justify-between gap-1 bg-white/[.10]">
                <label for="x" class="px-1">X</label>
                <input type="number" step="0.001" :name="`${name}[x]`" placeholder="X" v-model="x" class="w-full p-1 bg-white/[.10]" @input="inputChange" />
            </div>

            <div class="w-1/3 flex items-center justify-between gap-1 bg-white/[.10]">
                <label for="y" class="px-1">Y</label>
                <input type="number" step="0.001" :name="`${name}[y]`" placeholder="Y" v-model="y" class="w-full p-1 bg-white/[.10]" @input="inputChange" />
            </div>

            <div class="w-1/3 flex items-center justify-between gap-1 bg-white/[.10]">
                <label for="z" class="px-1">Z</label>
                <input type="number" step="0.001" :name="`${name}[z]`" placeholder="Z" v-model="z" class="w-full p-1 bg-white/[.10]" @input="inputChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineExpose, defineEmits } from 'vue';
const emits = defineEmits(['change']);
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    x: {
        type: Number,
        default: 0
    },
    y: {
        type: Number,
        default: 0
    },
    z: {
        type: Number,
        default: 0
    }
})

const x = ref(props.x);
const y = ref(props.y);
const z = ref(props.z);

const inputChange = () => {
    emits('change', { x: x.value, y: y.value, z: z.value });
}

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