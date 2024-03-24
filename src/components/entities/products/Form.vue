<template>
    <form @submit.prevent="submit" class="p-3 text-white">

        <div class="mb-3">
            <Paginator :findAllMethod="sdk.api.ProductController.findAll" :limit="10">
                <template #empty>
                    <div class="text-center">No products found</div>
                </template>

                <template #default="{ entities }">
                    <select v-model="product" class="w-full p-2 text-sm bg-white/[.10] rounded-md">
                        <option value="" class="text-black">Select Product</option>
                        <option v-for="product in entities" :key="product.uuid" :value="product.uuid" class="text-black">
                            {{ product.name }}
                        </option>
                    </select>
                </template>
            </Paginator>
        </div>

        <div class="mb-3">
            <Paginator :findAllMethod="sdk.api.MeshController.findAll" :limit="10">
                <template #empty>
                    <div class="text-center">No meshes found</div>
                </template>

                <template #default="{ entities }">
                    <select v-model="mesh" class="w-full p-2 text-sm bg-white/[.10] rounded-md">
                        <option value="" class="text-black">Select Mesh</option>
                        <option v-for="mesh in entities" :key="mesh.uuid" :value="{uuid: mesh.uuid, name: mesh.name}" class="text-black">
                            {{ mesh.name }}
                        </option>
                    </select>
                </template>
            </Paginator>
        </div>

        <button type="submit" class="border border-gray-300 px-3 py-1 rounded">Create</button>
    </form>
</template>

<script setup>
import Paginator from '../../UI/Paginator.vue';
import CreateObject from '../../../editor/plugins/object/commands/CreateObject.js';
import { useEditor } from '../../../composables/useEditor.js';
import { router } from '../../../router.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { useToast } from '../../../composables/useToast.js';
import { ref } from 'vue';

const { sdk } = useSceneSDK();
const editorCtrl = useEditor();
const toastCtrl = useToast();
const sceneUUID = router.currentRoute.value.params.sceneUUID;
const product = ref('');
const mesh = ref(null);

const submit = async () => {
    if (!product.value) {
        toastCtrl.add('Product is required', 5000, 'error');
        return
    }

    if (!mesh.value) {
        toastCtrl.add('Mesh is required', 5000, 'error');
        return
    }

    await sdk.api.SceneProductController.create({
        product_uuid: product.value,
        mesh_uuid: mesh.value.uuid,
        scene_uuid: sceneUUID
    });

    product.value = '';
    mesh.value = '';

    toastCtrl.add('Product created', 5000, 'success');
}
</script>
