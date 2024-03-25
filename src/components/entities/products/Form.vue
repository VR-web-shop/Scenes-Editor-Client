<template>
    <form @submit.prevent="submit" class="p-3 text-white">

        <div class="mb-3">
            <Paginator :findAllMethod="sdk.api.ProductController.findAll" :limit="10">
                <template #empty>
                    <div class="text-center">No products found</div>
                </template>

                <template #default="{ entities }">
                    <p class="text-xs mb-1">
                        The product cannot be changed after creation
                    </p>
                    <select disabled v-model="product" class="w-full p-2 text-sm bg-white/[.10] rounded-md">
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

        <button type="submit" class="border border-gray-300 px-3 py-1 rounded">
            {{ uuid ? 'Update' : 'Create' }}
        </button>
    </form>
</template>

<script setup>
import Paginator from '../../UI/Paginator.vue';
import CreateObject from '../../../editor/plugins/object/commands/CreateObject.js';
import UpdateObject from '../../../editor/plugins/object/commands/UpdateObject.js';
import { useEditor } from '../../../composables/useEditor.js';
import { router } from '../../../router.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { useToast } from '../../../composables/useToast.js';
import { useNotifications } from '../../../composables/useNotifications.js';
import { ref } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const { sdk } = useSceneSDK();
const editorCtrl = useEditor();
const toastCtrl = useToast();
const notificationCtrl = useNotifications();
const sceneUUID = router.currentRoute.value.params.sceneUUID;

const product = ref(props.data ? props.data.recordData.product_uuid : '');
const uuid = ref(props.data ? props.data.recordData.uuid : '');
const mesh = ref(props.data && props.data.recordData.Mesh ? {
    uuid: props.data.recordData.Mesh.uuid,
    name: props.data.recordData.Mesh.name
} : '');

const submit = async () => {
    if (!product.value) {
        toastCtrl.add('Product is required', 5000, 'error');
        return
    }

    if (!mesh.value) {
        toastCtrl.add('Mesh is required', 5000, 'error');
        return
    }

    if (uuid.value) {
        await sdk.api.SceneProductController.update({
            uuid: uuid.value,
            product_uuid: product.value,
            mesh_uuid: mesh.value.uuid
        });

        const { rows } = await sdk.api.SceneProductController.findAll({
            limit: 1,
            where: { uuid: uuid.value },
            include: [
                { model: 'Position' },
                { model: 'Rotation' },
                { model: 'Scale' },
                { model: 'Mesh' },
                { model: 'Product' }
            ]     
        })

        await editorCtrl.invoke(new UpdateObject(
            uuid.value,
            rows[0].Product.name,
            mesh.value.uuid,
            rows[0]
        ));

        toastCtrl.add('Product updated', 5000, 'success');
        await notificationCtrl.sync();
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
