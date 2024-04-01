<template>
    <FormComponent 
        :submitMethod="submit" 
        :buttonText="uuid ? 'Update' : 'Create'" 
        :record="{
            name: { value: name, required: true, type: 'text' },
            mesh_uuid: { value: mesh, required: true, type: 'select-paginator', paginator: {
                findMethod: sdk.api.MeshController.findAll,
                limit: 10,
                emptyMessage: 'No meshes found',
                foreignKey: 'uuid',
                displayKey: 'name',
                valueKey: 'uuid', 
                placeholder: 'Select Mesh'
            }
        }
    }">
        <input v-if="uuid" type="hidden" name="uuid" :value="uuid" />
        <input type="hidden" name="scene_uuid" :value="sceneUUID" />
    </FormComponent>
</template>

<script setup>
import FormComponent from '../../UI/Form.vue';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { router } from '../../../router.js';
import { ref } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const editorEntityCtrl = useEditorEntity();
const { sdk } = useSceneSDK();
const sceneUUID = router.currentRoute.value.params.sceneUUID;
const name = ref(props.data ? props.data.recordData.name : '');
const uuid = ref(props.data ? props.data.recordData.uuid : '');
const mesh = ref(props.data ? props.data.recordData.Mesh.uuid : '');

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
        responseInclude: [
            { model: 'Position' },
            { model: 'Rotation' },
            { model: 'Scale' },
            { model: 'Mesh' }
        ]
    };

    if (params.uuid) {
        const staticObject = await sdk.api.SceneStaticObjectController.update(params);
        editorEntityCtrl.updateStaticObject(staticObject);
        toastCtrl.add('Static object updated', 5000, 'success');
    } else {
        const staticObject = await sdk.api.SceneStaticObjectController.create(params);
        editorEntityCtrl.createStaticObject(staticObject);
        toastCtrl.add('Static object created', 5000, 'success');
        clearData();
    }
}
</script>
