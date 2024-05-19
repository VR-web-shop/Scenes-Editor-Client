<script setup>
import Paginator from '../components/UI/Paginator.vue';
import { router } from '../router.js';
import { useToast } from '../composables/useToast.js';
import { useSceneSDK } from '../composables/useScenesSDK.js';
import { ref, onMounted } from 'vue';
import { v4 } from 'uuid';

const paginatorRef = ref()
const scenes = ref([]);
const toastCtrl = useToast()
const { sdk } = useSceneSDK()

const name = ref('')
const description = ref('')
const active = ref('false')
const create = async () => {
    if (!name.value) {
        toastCtrl.add('Please enter a name for the scene', 5000, 'error')
        return
    }

    if (!description.value) {
        toastCtrl.add('Please enter a description for the scene', 5000, 'error')
        return
    }

    const scene = await sdk.Scene.create({
        client_side_uuid: v4(),
        name: name.value,
        description: description.value,
        active: active.value
    })
    name.value = ''
    description.value = ''
    router.push({ name: 'Editor', params: { sceneUUID: scene.uuid } })
}

const toggleActivate = async (scene) => {
    await sdk.Scene.update(scene.client_side_uuid, {
        active: scene.active ? 'false' : true
    })
    setTimeout(async () => {
        await paginatorRef.value.paginator.refresh()
        toastCtrl.add(`Scene ${scene.active ? 'deactivated' : 'activated'}`, 5000, 'success')
    }, 100)
}

const destroy = async (scene) => {
    const confirm = window.confirm('Are you sure you want to delete this scene?')
    if (!confirm) return
    await sdk.Scene.remove(scene.client_side_uuid)
    await paginatorRef.value.paginator.refresh()
    toastCtrl.add('Scene deleted', 5000, 'success')
}


</script>

<template>
    <div class="">
        <div class="p-3 border-b border-gray-800 bg-gray-600 text-white">
            <h3 class="text-4xl text-center mb-3">
                Scene Editor
            </h3>

            <p class="text-center">
                Welcome to the scene editor. Here you can create new scenes or edit existing ones.
            </p>
        </div>

        <div class="flex items-start justify-center gap-6 mt-6">
            <div>
                <h3 class="text-2xl text-center mb-3">
                    Create A New Scene
                </h3>

                <input v-model="name" class="border border-gray-300 rounded-md p-1 w-full mb-1"
                    placeholder="Scene Name" />

                <input v-model="description" class="border border-gray-300 rounded-md p-1 w-full mb-1" 
                    placeholder="Scene Description" />

                <div class="flex items-center gap-3 mb-3">
                    <label class="flex items-center gap-1">
                        <input v-model="active" type="checkbox" value="false" class="mr-1" />
                        <span>Active</span>
                    </label>
                </div>

                <div class="flex justify-center justify-between gap-1 mb-6">
                    <button @click="create" class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-300">
                        Create
                    </button>
                </div>
            </div>

            <div>
                <h3 class="text-2xl text-center mb-3">
                    Select An Exisiting Scene
                </h3>

                <Paginator ref="paginatorRef" :findAllMethod="sdk.Scene.findAll" :limit="5">
                    <template #default="{ entities }">
                        <div v-for="scene in entities" :key="scene.client_side_uuid">
                            <div
                                class="flex justify-between items-center gap-3 rounded-md border border-gray-300 p-3 mb-1">
                                <div class="flex justify-start items-center gap-3">
                                    <span class="capitalize">{{ scene.name }}</span>
                                    <span class="text-xs font-semibold"
                                        :class="scene.active ? 'text-green-500' : 'text-red-500'">
                                        {{ scene.active ? 'Active' : 'Inactive' }}
                                    </span>
                                </div>

                                <div class="flex items-center gap-1">
                                    <button @click="toggleActivate(scene)"
                                        class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-300">
                                        {{ scene.active ? 'Deactivate' : 'Activate' }}
                                    </button>

                                    <router-link :to="{ name: 'Editor', params: { client_side_uuid: scene.client_side_uuid } }"
                                        class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-300">Edit</router-link>

                                    <button @click="destroy(scene)"
                                        class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-300">Delete</button>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #empty>
                        <div>No scenes found</div>
                    </template>
                </Paginator>
            </div>
        </div>
    </div>
</template>
