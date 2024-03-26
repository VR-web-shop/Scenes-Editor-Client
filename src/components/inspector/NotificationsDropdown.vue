<template>
    <Dropdown ref="dropdown" class="p-3 text-white shadow-lg absolute top-0 left-10 bg-slate-800 overflow-hidden rounded-md w-32"
        style="z-index:1000;"
        :otherTargets="otherTargets">

        <div v-if="notifications.length > 0" class="mb-1 grid grid-cols-1 gap-3">
            <div v-for="notification in notifications" :key="notification.id">
                <p class="text-sm mb-1">
                    {{ notification.msg }}
                </p>

                <button @click="solve(notification)" 
                    class="text-xs border border-slate-500 rounded-md text-xs uppercase p-2 bg-gray-800/50 text-white hover:bg-slate-500">
                    Solve
                </button>
            </div>
        </div>
        <div v-else>
            <p class="text-sm text-center">
                You are all set!
            </p>
        </div>
    </Dropdown>
</template>

<script setup>
import Dropdown from '../UI/Dropdown.vue';
import { useNotifications } from '../../composables/useNotifications.js';
import { ref, defineExpose, onMounted } from 'vue';

const props = defineProps({
    otherTargets: {
        type: Array,
        required: false,
        default: () => []
    }
})

const dropdown = ref();
const notificationCtrl = useNotifications();
const notifications = notificationCtrl.notifications;

const solve = async (notification) => {
    await notification.solve();
    dropdown.value.toggle();
}

onMounted(async () => await notificationCtrl.sync())
defineExpose({ dropdown })
</script>
