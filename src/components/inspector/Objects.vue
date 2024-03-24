<template>
    <div class="grid grid-cols-2">
        <div v-for="object in objects" :key="object.name">
            <div class="flex items-center gap-3 overflow-hidden p-2 text-xs">
                <div v-if="object.options.objectType">
                    <component :is="icons[object.options.objectType]" fill="white" width="1.3em" />
                </div>
                <div v-else>
                    <CubeIcon fill="white" width="1.3em" />
                </div>
                <p class="truncate">{{ object.options.labelName || object.object.name || 'No name' }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import ReadObjects from '../../editor/plugins/object/readers/ReadObjects.js';
import LightBulbIcon from '../Icons/LightBulbIcon.vue';
import CubesIcon from '../Icons/CubesIcon.vue';
import SquareIcon from '../Icons/SquareIcon.vue';
import CheckoutIcon from '../Icons/CheckoutIcon.vue';
import BasketIcon from '../Icons/BasketIcon.vue';
import TagIcon from '../Icons/TagIcon.vue';
import CubeIcon from '../Icons/CubeIcon.vue';
import { computed } from 'vue';

const props = defineProps({
    editor: {
        type: Object,
        required: true
    }
});

const icons = {
    'Light': LightBulbIcon,
    'StaticObject': CubesIcon,
    'Floor': SquareIcon,
    'Checkout': CheckoutIcon,
    'Product': TagIcon,
    'Basket': BasketIcon,
    'BasketPlaceholder': BasketIcon
}

const readObjects = props.editor.newReader(ReadObjects);
const objects = computed(() => readObjects.read());
</script>
