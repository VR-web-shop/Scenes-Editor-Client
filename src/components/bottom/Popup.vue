<template>
    <div v-if="!isClosed">
        <div class="flex justify-between">
            <button @click="minimize" class="w-full text-xs px-3 py-2 hover:bg-gray-800 text-left"
                    :class="isOpen ? 'bg-gray-800/50 text-white ' : 'bg-black/50 text-white'">
                {{ title }}
            </button>
            <button @click="close" class="text-white px-3 bg-red-500 text-white hover:bg-red-800">
                <TimesIcon fill="white" width="0.7em" />
            </button>
        </div>

        <div v-if="isOpen">
            <slot :data="popup.data" />
        </div>
    </div>
</template>

<script setup>
import TimesIcon from '../Icons/TimesIcon.vue';
import { usePopups } from '../../composables/usePopups.js';
import { onBeforeMount, onBeforeUnmount, computed, ref } from 'vue';
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
})

const popups = usePopups()
const popup = ref()
const isOpen = computed(() => popups.isOpen(props.id))
const isClosed = computed(() => popups.isClosed(props.id))
const minimize = () => popups.minimize(props.id)
const close = () => popups.close(props.id)

onBeforeMount(() => {
    popups.addPopup(props.id)
    popup.value = popups.getPopup(props.id)
})

onBeforeUnmount(() => {
    popups.removePopup(props.id)
    popup.value = null
})
</script>
