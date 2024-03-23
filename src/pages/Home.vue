<script setup>
import Paginator from '../components/Paginator.vue';
import { router } from '../router.js';
import { useToast } from '../composables/useToast.js';
import { useSceneSDK } from '../composables/useScenesSDK.js';
import { ref, onMounted } from 'vue';

const paginatorRef = ref()
const scenes = ref([]);
const toastCtrl = useToast()
const { sdk } = useSceneSDK()

const name = ref('')
const description = ref('')
const create = async () => {
    if (!name.value) {
        toastCtrl.add('Please enter a name for the scene', 5000, 'error')
        return
    }

    if (!description.value) {
        toastCtrl.add('Please enter a description for the scene', 5000, 'error')
        return
    }

    const scene = await sdk.api.SceneController.create({
        name: name.value,
        description: description.value
    })
    name.value = ''
    description.value = ''
    router.push({ name: 'Editor', params: { sceneUUID: scene.uuid } })
}

const destroy = async (scene) => {
    const confirm = window.confirm('Are you sure you want to delete this scene?')
    if (!confirm) return
    await sdk.api.SceneController.destroy({ uuid: scene.uuid })
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

                <textarea v-model="description" class="border border-gray-300 rounded-md p-1 h-72 w-full"
                        placeholder="Scene Description" />
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

                <Paginator ref="paginatorRef" :findAllMethod="sdk.api.SceneController.findAll" :limit="5">
                    <template #default="{ entities }">
                        <div v-for="scene in entities" :key="scene.id">
                            <div class="flex justify-between items-center rounded-md border border-gray-300 p-3 mb-1">
                                <div class="capitalize">
                                    {{ scene.name }}
                                </div>
                                
                                <div class="flex items-center gap-1">
                                    <router-link :to="{ name: 'Editor', params: { sceneUUID: scene.uuid } }"
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
