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

const showCreateSceneModal = ref(false)

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

    const client_side_uuid = v4()
    await sdk.Scene.create({
        client_side_uuid,
        name: name.value,
        description: description.value,
        active: active.value
    })
    name.value = ''
    description.value = ''
    // reload scenes
    location.reload()
}

const toggleActivate = async (scene) => {
    await sdk.Scene.update(scene.client_side_uuid, {
        name: scene.name,
        description: scene.description,
        active: scene.active ? 'false' : true
    })
    toastCtrl.add(`Scene ${scene.active ? 'deactivated' : 'activated'}`, 5000, 'success')
    setTimeout(async () => {
        location.reload()
    }, 1000)
}

const destroy = async (scene) => {
    const confirm = window.confirm('Are you sure you want to delete this scene?')
    if (!confirm) return
    await sdk.Scene.remove(scene.client_side_uuid)
    toastCtrl.add('Scene deleted', 5000, 'success')
    location.reload()
}

const toggleCreateSceneModal = () => {
    showCreateSceneModal.value = !showCreateSceneModal.value
}

</script>

<template>
    <div>
        <div v-if="showCreateSceneModal"
            class="bg-gray-500/50 fixed top-0 bottom-0 left-0 right-0 flex flex-col items-center justify-center">
            <div class="bg-white border border-gray-300 rounded-md p-6">
                <h3 class="text-3xl text-center mb-1">
                    Create A New Scene
                </h3>

                <p class="text-center mb-6">
                    Fill in the form below to create a new scene.
                </p>

                <div class="border border-gray-300 rounded-md p-3 w-full mb-3">
                    <label class="block mb-1">Scene Name</label>
                    <small class="block mb-3">
                        Used to identify the scene. Must be unique.
                    </small>
                    <input v-model="name" class="border border-gray-300 rounded-md p-3 w-full mb-1"
                        placeholder="Name" />
                </div>

                <div class="border border-gray-300 rounded-md p-3 w-full mb-3">
                    <label class="block mb-1">Scene Description</label>
                    <small class="block mb-3">
                        A brief description of the scene.
                    </small>
                    <input v-model="description" class="border border-gray-300 rounded-md p-3 w-full mb-1"
                        placeholder="Description" />
                </div>

                <div class="border border-gray-300 rounded-md p-3 w-full flex flex-col items-start gap-1 mb-3">
                    <label class="flex items-center gap-1">
                        <input v-model="active" type="checkbox" value="false" class="mr-1" />
                        <span>Set Active</span>
                    </label>
                    <small>
                        If checked, the scene will be visible on the customer website.
                    </small>
                </div>

                <div class="flex flex-col justify-center justify-between gap-1">
                    <button @click="create"
                        class="w-full px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-300">
                        Create
                    </button>

                    <button @click="toggleCreateSceneModal"
                        class="w-full px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-300">
                        Close
                    </button>
                </div>
            </div>
        </div>

        <div class="p-3 border-b border-slate-800 bg-slate-800 text-white flex items-center justify-between gap-3">
            <h3 class="text-3xl">
                Scene 3D Editor
            </h3>

            <div class="flex items-center gap-3">
                <button @click="toggleCreateSceneModal"
                    class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-600">
                    Create Scene
                </button>
            </div>
        </div>

        <div class="min-h-screen bg-slate-100 flex flex-col justify-start gap-6 p-6">

            <div class="bg-white border border-gray-300 rounded-md p-6">
                <h3 class="text-3xl mb-3">
                    Scenes
                </h3>

                <p class="mb-6">
                    Find all the scenes you have created below. You can activate, deactivate, edit or delete them.
                </p>

                <Paginator ref="paginatorRef" :findAllMethod="sdk.Scene.findAll" :limit="5">
                    <template #default="{ entities }">
                        <div class="mb-6">
                            <div v-for="scene in entities" :key="scene.client_side_uuid">
                                <div
                                    class="flex justify-between items-center gap-3 rounded-md border border-gray-300 p-3 mb-1">
                                    <div class="flex flex-col justify-start items-start gap-1">
                                        <span class="text-xs font-bold font-semibold p-1 rounded-md"
                                            :class="scene.active 
                                                ? 'bg-green-100 text-green-500' 
                                                : 'bg-red-100 text-red-500'">
                                            {{ scene.active ? 'Active' : 'Inactive' }}
                                        </span>
                                        <span class="capitalize">
                                            {{ scene.name }}
                                        </span>
                                    </div>

                                    <div class="flex items-center gap-1">
                                        <button @click="toggleActivate(scene)"
                                            class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-300">
                                            {{ scene.active ? 'Deactivate' : 'Activate' }}
                                        </button>

                                        <div v-if="scene.active">
                                            <router-link
                                                :to="{ name: 'Editor', params: { client_side_uuid: scene.client_side_uuid } }"
                                                class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-300">Edit</router-link>
                                        </div>
                                        

                                        <button @click="destroy(scene)"
                                            class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-300">Delete</button>
                                    </div>
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
