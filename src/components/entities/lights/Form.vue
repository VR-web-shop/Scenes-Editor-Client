<template>
    <form @submit.prevent="submit" class="p-3 text-white">
        <input type="text" placeholder="Name" v-model="name" class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]" />

        <div class="flex items-center justify-between gap-3">
            <label for="color" class="text-white">Color</label>    
            <input type="color" placeholder="Color" v-model="color" class="w-full text-sm h-8 mb-1 rounded-md bg-white/[.10]" />
        </div>
        
        <div class="flex items-center justify-between gap-3">
            <label for="intensity" class="text-white">Intensity</label>    
            <input type="number" placeholder="Intensity" v-model="intensity" class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]" />
        </div>
        
        <select v-model="type" class="w-full p-2 text-sm mb-3 bg-white/[.10] rounded-md">
            <option value="" class="text-black">Select Type</option>
            <option v-for="lightType in lightTypes" :key="lightType.name" :value="lightType.name" class="text-black">
                {{ lightType.name }}
            </option>
        </select>

        <button type="submit" class="border border-gray-300 px-3 py-1 rounded">
            {{ uuid ? 'Update' : 'Create' }}
        </button>
    </form>
</template>

<script setup>
import CreateLight from '../../../editor/plugins/object/commands/CreateLight.js';
import UpdateLight from '../../../editor/plugins/object/commands/UpdateLight.js';
import { useEditor } from '../../../composables/useEditor.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { useToast } from '../../../composables/useToast.js';
import { ref, onBeforeMount } from 'vue';
import { router } from '../../../router.js';

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const { sdk } = useSceneSDK();
const editorCtrl = useEditor();
const toastCtrl = useToast();
const lightTypes = ref([]);
const sceneUUID = router.currentRoute.value.params.sceneUUID;
const name = ref(props.data ? props.data.recordData.name : '');
const type = ref(props.data ? props.data.recordData.scene_light_type_name : '');
const color = ref(props.data ? props.data.recordData.hexColor : '');
const intensity = ref(props.data ? props.data.recordData.intensity : 1);
const uuid = ref(props.data ? props.data.recordData.uuid : '');

const submit = async () => {
    if (!name.value) {
        toastCtrl.add('Name is required', 5000, 'error');
        return
    }

    if (!type.value) {
        toastCtrl.add('Type is required', 5000, 'error');
        return        
    }

    if (!intensity.value) {
        toastCtrl.add('Intensity is required', 5000, 'error');
        return        
    }

    if (!color.value) {
        toastCtrl.add('Color is required', 5000, 'error');
        return        
    }

    if (uuid.value) {
        await sdk.api.SceneLightController.update({
            uuid: uuid.value,
            name: name.value,
            scene_light_type_name: type.value,
            intensity: intensity.value,
            hexColor: color.value
        });UpdateLight

        const { rows } = await sdk.api.SceneLightController.findAll({
            limit: 1,
            where: { uuid: uuid.value },
            include: [
                { model: 'Position' },
                { model: 'Rotation' },
            ]     
        })

        await editorCtrl.invoke(new UpdateLight(
            uuid.value,
            name.value,
            type.value,
            intensity.value,
            color.value,
            rows[0]
        ));
        
        toastCtrl.add('Light updated', 5000, 'success');
    } else {
        const light = await sdk.api.SceneLightController.create({
            name: name.value,
            scene_light_type_name: type.value,
            intensity: intensity.value,
            hexColor: color.value,
            scene_uuid: sceneUUID
        });

        await editorCtrl.invoke(new CreateLight(
            name.value,
            light.uuid,
            type.value,
            intensity.value,
            color.value
        ));
        
        name.value = '';
        type.value = '';
        intensity.value = 1;
        toastCtrl.add('Light created', 5000, 'success');
    }
}

onBeforeMount(async () => {
    const { rows } = await sdk.api.SceneLightTypeController.findAll({ limit: 100 });
    lightTypes.value = rows
});
</script>
