<template>
    <div class="p-3">
        <Paginator ref="paginatorRef" :find-all-method="sdk.api.MeshController.findAll" :include="[{ model: 'Material' }]" :limit="5">
            <template #empty>
                <div>No meshes found</div>
            </template>
            <template #default="{ entities }">
                <div class="grid grid-cols-1 gap-1">
                    <div v-for="mesh in entities" :key="mesh.uuid">
                        <div class="flex items-center justify-between gap-3 overflow-hidden p-2 border border-gray-500 rounded-md">
                            <p class="text-xs truncate">{{ mesh.name }}</p>
                            <div class="flex items-center gap-1">
                                <button @click="popups.open('meshes-edit', { ...mesh })"
                                    class="p-1 border border-gray-300 rounded-md hover:bg-gray-300">
                                    <PenIcon fill="white" width="0.8em" />
                                </button>

                                <button @click="destroy(mesh)"
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
import RemoveMesh from '../../../editor/plugins/cache/commands/RemoveMesh.js';
import { usePopups } from '../../../composables/usePopups.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { useToast } from '../../../composables/useToast.js';
import { useEditor } from '../../../composables/useEditor.js';
import { ref } from 'vue';
const { sdk } = useSceneSDK();
const popups = usePopups();
const toastCtrl = useToast();
const editorCtrl = useEditor();
const paginatorRef = ref();

const destroy = async (mesh) => {
    const confirm = window.confirm('Are you sure you want to delete this mesh?');
    if (!confirm) return;
    try {
        await sdk.api.MeshController.destroy({uuid: mesh.uuid});
        await editorCtrl.invoke(new RemoveMesh(mesh.uuid))
        paginatorRef.value.paginator.page=1;
        paginatorRef.value.paginator.refresh();
        toastCtrl.add('Mesh deleted', 5000, 'success');
    } catch (error) {
        console.error(error);
    }
};
</script>
