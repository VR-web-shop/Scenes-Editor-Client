<template>
    <div class="fixed bottom-0 right-0 px-3">
        <div class="flex items-end justify-between gap-1 z-10">
            <Popup v-for="popup in popups" :key="popup.title" :title="popup.title" :id="popup.id" class="bg-black text-white">
                <template #default="{ data }">
                    <component v-if="data" :is="popup.component" :data="data" />
                    <component v-else :is="popup.component" />
                </template>
            </Popup>
        </div>
    </div>
</template>

<script setup>
import Popup from './Popup.vue';

import IndexTextures from '../entities/textures/Index.vue';
import FormTexture from '../entities/textures/Form.vue';

import IndexMaterials from '../entities/materials/Index.vue';
import MaterialForm from '../entities/materials/Form.vue';

import IndexMeshes from '../entities/meshes/Index.vue';
import MeshForm from '../entities/meshes/Form.vue';

import IndexObjects from '../entities/scene_objects/Index.vue';
import StaticObjectForm from '../entities/static_objects/Form.vue';
import ProductForm from '../entities/products/Form.vue';
import FloorForm from '../entities/floors/Form.vue';
import CheckoutForm from '../entities/checkouts/Form.vue';
import LightForm from '../entities/lights/Form.vue';
import BasketForm from '../entities/basket/Form.vue';

import ShowScene from '../entities/scenes/Show.vue';

const popups = [
    { title: 'Create Texture', id: 'textures-create', component: FormTexture },
    { title: 'Edit Texture', id: 'textures-edit', component: FormTexture },
    { title: 'Textures', id: 'textures-index', component: IndexTextures },

    { title: 'Create Material', id: 'materials-create', component: MaterialForm },
    { title: 'Edit Material', id: 'materials-edit', component: MaterialForm },
    { title: 'Materials', id: 'materials-index', component: IndexMaterials },

    { title: 'Create Mesh', id: 'meshes-create', component: MeshForm },
    { title: 'Edit Mesh', id: 'meshes-edit', component: MeshForm },
    { title: 'Meshes', id: 'meshes-index', component: IndexMeshes },

    { title: 'Objects', id: 'objects-index', component: IndexObjects },

    { title: 'Create Light', id: 'objects-create-light', component: LightForm },
    { title: 'Edit Light', id: 'objects-edit-light', component: LightForm },

    { title: 'Create Static Object', id: 'objects-create-static-object', component: StaticObjectForm },
    { title: 'Edit Static Object', id: 'objects-edit-static-object', component: StaticObjectForm },

    { title: 'Create Scene Product', id: 'objects-create-scene-product', component: ProductForm },
    { title: 'Edit Scene Product', id: 'objects-edit-scene-product', component: ProductForm },

    { title: 'Create Floor', id: 'objects-create-floor', component: FloorForm },
    { title: 'Edit Floor', id: 'objects-edit-floor', component: FloorForm },

    { title: 'Create Checkout', id: 'objects-create-checkout', component: CheckoutForm },
    { title: 'Edit Checkout', id: 'objects-edit-checkout', component: CheckoutForm },

    { title: 'Edit Scene', id: 'scene-edit', component: ShowScene },
    { title: 'Edit Basket', id: 'objects-edit-basket', component: BasketForm },
];

</script>
