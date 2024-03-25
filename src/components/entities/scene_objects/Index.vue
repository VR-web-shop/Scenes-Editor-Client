<template>
    <div class="p-3 flex flex-col gap-1">
        <Paginator ref="paginatorRef" :findAllMethod="findAll" :limit="5">

            <template #empty>
                <div>No objects found</div>
            </template>

            <template #default="{ entities }">
                <div class="grid grid-cols-1 gap-1">
                    <div v-for="object in entities" :key="object.name">
                        <div class="flex items-center justify-between gap-3 p-2 border border-gray-500 rounded-md">
                            <div class="flex items-center gap-3 overflow-hidden text-xs">
                                <div v-if="object.options.objectType">
                                    <component :is="icons[object.options.objectType]" fill="white" width="1.3em" />
                                </div>
                                <div v-else>
                                    <CubeIcon fill="white" width="1.3em" />
                                </div>
                                <p class="truncate">{{ object.options.labelName || object.object.name || 'No name' }}
                                </p>
                            </div>

                            <div class="flex items-center gap-1">
                                <button @click="openPopup(object)"
                                    class="p-1 border border-gray-300 rounded-md hover:bg-gray-300">
                                    <PenIcon fill="white" width="0.8em" />
                                </button>

                                <button v-if="isDeleteable(object)" @click="destroy(object)"
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
import ReadObjects from '../../../editor/plugins/object/readers/ReadObjects.js';
import RemoveObject from '../../../editor/plugins/object/commands/RemoveObject.js';
import LightBulbIcon from '../../Icons/LightBulbIcon.vue';
import CubesIcon from '../../Icons/CubesIcon.vue';
import SquareIcon from '../../Icons/SquareIcon.vue';
import CheckoutIcon from '../../Icons/CheckoutIcon.vue';
import BasketIcon from '../../Icons/BasketIcon.vue';
import TagIcon from '../../Icons/TagIcon.vue';
import CubeIcon from '../../Icons/CubeIcon.vue';
import PenIcon from '../../Icons/PenIcon.vue';
import TimesIcon from '../../Icons/TimesIcon.vue';
import Paginator from '../../UI/Paginator.vue';
import { usePopups } from '../../../composables/usePopups';
import { useEditor } from '../../../composables/useEditor.js';
import { useToast } from '../../../composables/useToast.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { ref } from 'vue';

const { sdk } = useSceneSDK();
const paginatorRef = ref();
const toastCtrl = useToast();
const editorCtrl = useEditor();
const icons = {
    'Light': LightBulbIcon,
    'StaticObject': CubesIcon,
    'Floor': SquareIcon,
    'Checkout': CheckoutIcon,
    'Product': TagIcon,
    'Basket': BasketIcon,
    'BasketPlaceholder': BasketIcon
}

const popups = usePopups();
const types = {
    'Light': 'objects-edit-light',
    'StaticObject': 'objects-edit-static-object',
    'Floor': 'objects-edit-floor',
    'Checkout': 'objects-edit-checkout',
    'Product': 'objects-edit-scene-product',
    'Basket': 'objects-edit-basket',
    'BasketPlaceholder': 'objects-edit-basket'
}
const openPopup = (object) => {
    const type = types[object.options.objectType];
    popups.open(type, { ...object.options });
}

const readObjects = editorCtrl.newReader(ReadObjects);
async function findAll(params) {
    const { limit, page } = params;
    const objects = readObjects.read();
    const offset = (page - 1) * limit;
    const pages = Math.ceil(objects.length / limit);
    return {
        pages,
        rows: objects.slice(offset, offset + limit),
        count: objects.length
    }
}

const notDeleteableTypes = ['Basket', 'BasketPlaceholder', 'Product'];
const isDeleteable = (object) => !notDeleteableTypes.includes(object.options.objectType);

const destroy = async (object) => {
    if (notDeleteableTypes.includes(object.options.objectType)) {
        toastCtrl.add('This object cannot be deleted', 5000, 'error');
        return;
    }

    const confirm = window.confirm('Are you sure you want to delete this object?');
    if (!confirm) return;
    try {
        switch (object.options.objectType) {
            case 'Light':
                await sdk.api.SceneLightController.destroy({ uuid: object.options.recordData.uuid });
                break;
            case 'StaticObject':
                await sdk.api.SceneStaticObjectController.destroy({ uuid: object.options.recordData.uuid });
                break;
            case 'Floor':
                await sdk.api.SceneFloorController.destroy({ uuid: object.options.recordData.uuid });
                break;
            case 'Checkout':
                await sdk.api.SceneCheckoutController.destroy({ uuid: object.options.recordData.uuid });
                break;
            default:
                break;
        }

        editorCtrl.invoke(new RemoveObject(object.options.recordData.uuid));
        paginatorRef.value.paginator.page=1;
        paginatorRef.value.paginator.refresh();
        toastCtrl.add(`${object.options.objectType} deleted`, 5000, 'success');
    } catch (error) {
        console.error(error);
    }
};

</script>
