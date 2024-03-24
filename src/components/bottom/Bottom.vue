<template>
    <div class="fixed bottom-0 right-0 px-3">
        <div class="flex items-end justify-between gap-1 z-10">
            <Popup title="Texture" class="bg-black">
                <TextureForm class="w-48" />
            </Popup>

            <Popup title="Material" class="bg-black">
                <MaterialForm class="w-72" />
            </Popup>

            <Popup title="Mesh" class="bg-black">
                <MeshForm class="w-72" />
            </Popup>

            <Popup title="Light" class="bg-black">
                <LightForm class="w-48" />
            </Popup>

            <Popup title="Static Object" class="bg-black">
                <StaticObjectForm class="w-80" />
            </Popup>

            <Popup title="Scene Product" class="bg-black">
                <ProductForm class="w-80" />
            </Popup>

            <Popup title="Floor" class="bg-black">
                <FloorForm class="w-80" />
            </Popup>

            <Popup title="Checkout" class="bg-black">
                <CheckoutForm class="w-80" />
            </Popup>
        </div>

        
    </div>
</template>

<script setup>
import Popup from './Popup.vue';
import StaticObjectForm from '../entities/static_objects/Form.vue';
import ProductForm from '../entities/products/Form.vue';
import FloorForm from '../entities/floors/Form.vue';
import CheckoutForm from '../entities/checkouts/Form.vue';
import LightForm from '../entities/lights/Form.vue';
import TextureForm from '../entities/textures/Form.vue';
import MaterialForm from '../entities/materials/Form.vue';
import MeshForm from '../entities/meshes/Form.vue';
</script>
