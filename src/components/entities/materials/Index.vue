<template>
    <div class="p-3">
        <Paginator ref="paginatorRef" :find-all-method="sdk.Material.findAll" :include="[{ model: 'Texture' }]" :limit="5">

            <template #empty>
                <div>No materials found</div>
            </template>

            <template #default="{ entities }">
                <div class="grid grid-cols-1 gap-1">
                    <div v-for="material in entities" :key="material.uuid">
                        <div
                            class="flex items-center justify-between gap-3 overflow-hidden p-2 border border-gray-500 rounded-md">
                            <p class="text-xs truncate">{{ material.name }}</p>

                            <div class="flex items-center gap-1">
                                <button @click="popups.open('materials-edit', { ...material })"
                                    class="p-1 border border-gray-300 rounded-md hover:bg-gray-300">
                                    <PenIcon fill="white" width="0.8em" />
                                </button>

                                <button @click="destroy(material)"
                                    class="p-1 bg-red-500 border border-red-800 rounded-md hover:bg-red-800">
                                    <TimesIcon fill="white" width="0.6em" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Paginator>
    </div>
</template>

<script setup>
import PenIcon from '../../Icons/PenIcon.vue';
import TimesIcon from '../../Icons/TimesIcon.vue';
import Paginator from '../../UI/Paginator.vue';
import RemoveTexture from '../../../editor/plugins/cache/commands/RemoveTexture.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { usePopups } from '../../../composables/usePopups.js';
import { useToast } from '../../../composables/useToast.js';
import { useEditor } from '../../../composables/useEditor.js';
import { ref } from 'vue';

const { sdk } = useSceneSDK();
const toastCtrl = useToast();
const popups = usePopups();
const editorCtrl = useEditor();
const paginatorRef = ref();

const destroy = async (material) => {
    const confirm = window.confirm('Are you sure you want to delete this material?');
    if (!confirm) return;
    try {
        await sdk.api.MaterialController.destroy({uuid: material.uuid});
        await editorCtrl.invoke(new RemoveTexture(material.uuid))
        paginatorRef.value.paginator.page=1;
        paginatorRef.value.paginator.refresh();
        toastCtrl.add('Material deleted', 5000, 'success');
    } catch (error) {
        console.error(error);
    }
};
</script>
