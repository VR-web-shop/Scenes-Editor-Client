<template>
    <div v-show="show" ref="wrapper">
        <slot />
    </div>
</template>

<script setup>
import { ref, defineExpose, onBeforeMount, onBeforeUnmount } from 'vue';
const props = defineProps({
    otherTargets: {
        type: Array,
        default: () => []
    }
});
const show = ref(false);
const wrapper = ref();

const toggle = () => {
    show.value = !show.value;
}

function closeOnOutsideClick(e) {
    const targets = [wrapper.value, ...props.otherTargets];
    if (targets.some(target => target.contains(e.target))) {
        return;
    }

    show.value = false;
}

defineExpose({ toggle });

onBeforeMount(() => {
    document.addEventListener('click', closeOnOutsideClick);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', closeOnOutsideClick);
});
</script>
