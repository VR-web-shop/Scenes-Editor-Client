<template>
    <div>
        <div v-if="logMessages.length === 0" class="text-white">No log messages</div>
        <div v-else class="text-white text-xs">
            <div v-for="message in logMessages" :key="message.id">
                {{ message }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
    editor: {
        type: Object,
        required: true
    },
    toggleEditorLog: {
        type: Function,
        required: true
    }
})
const logMessages = ref([])
const onLog = (message) => {
    // prepend the message to the logMessages array
    logMessages.value = [message, ...logMessages.value]
}
const startLog = props.editor.invoker().log;
const reversedLog = startLog.reverse();
logMessages.value = reversedLog;
props.editor.invoker().addLogListener(onLog)
</script>