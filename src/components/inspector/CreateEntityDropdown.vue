<template>
    <Dropdown ref="dropdown" class="text-white shadow-lg absolute top-0 left-10 bg-slate-800 overflow-hidden rounded-md w-44 z-60"
        :otherTargets="otherTargets">
        <div v-for="option in options" :key="option.name">
            <button @click="openPopup(option.popup)"
                class="hover:bg-slate-500 w-full flex items-center justify-start gap-3 px-3 py-1 text-sm">
                <component :is="icons[option.icon]" fill="white" width="0.8em" />
                <span>{{ option.name }}</span>
            </button>
        </div>
    </Dropdown>
</template>

<script setup>
import SquareIcon from '../Icons/SquareIcon.vue';
import CircleIcon from '../Icons/CircleIcon.vue';
import ImageIcon from '../Icons/ImageIcon.vue';
import CheckoutIcon from '../Icons/CheckoutIcon.vue';
import LightBulbIcon from '../Icons/LightBulbIcon.vue';
import BasketIcon from '../Icons/BasketIcon.vue';
import CubesIcon from '../Icons/CubesIcon.vue';
import TagIcon from '../Icons/TagIcon.vue';
import CubeIcon from '../Icons/CubeIcon.vue';
import Dropdown from '../UI/Dropdown.vue';
import { usePopups } from '../../composables/usePopups';
import { ref, defineExpose } from 'vue';

const props = defineProps({
    otherTargets: {
        type: Array,
        required: false,
        default: () => []
    }
})

const options = [
    { name: 'Texture', popup: 'textures-create', icon: 'ImageIcon' },
    { name: 'Material', popup: 'materials-create', icon: 'CircleIcon' },
    { name: 'Mesh', popup: 'meshes-create', icon: 'CubeIcon' },
    { name: 'Light', popup: 'objects-create-light', icon: 'LightBulbIcon' },
    { name: 'Static Object', popup: 'objects-create-static-object', icon: 'CubesIcon' },
    { name: 'Floor', popup: 'objects-create-floor', icon: 'SquareIcon' },
    { name: 'Checkout', popup: 'objects-create-checkout', icon: 'CheckoutIcon' },
]

const icons = {
    ImageIcon,
    SquareIcon,
    CircleIcon,
    LightBulbIcon,
    CubeIcon,
    BasketIcon,
    CheckoutIcon,
    CubesIcon,
    TagIcon
}

const dropdown = ref()
const popups = usePopups()

const openPopup = (popupName) => {
    popups.open(popupName)
    dropdown.value.toggle()
}

const toggle = () => {
    dropdown.value.toggle()
}

defineExpose({
    toggle
})
</script>
