<template>
    <FormComponent 
        :submitMethod="submit" 
        :buttonText="uuid ? 'Update' : 'Create'" 
        :record="{
            name: { value: name, required: true, type: 'text' },
            surface_offset: { value: surfaceOffset, required: true, type: 'vector3d', placeholder: 'Surface Offset' },
            surface_size: { value: surfaceSize, required: true, type: 'vector3d', placeholder: 'Surface Size' },
            ui_offset: { value: uiOffset, required: true, type: 'vector3d', placeholder: 'UI Offset' },
            ui_rotation: { value: uiRotation, required: true, type: 'vector3d', placeholder: 'UI Rotation' },
            mesh_uuid: { value: mesh, required: true, type: 'select-paginator', paginator: {
                    findMethod: sdk.api.MeshController.findAll,
                    limit: 10,
                    emptyMessage: 'No meshes found',
                    foreignKey: 'uuid',
                    displayKey: 'name',
                    valueKey: 'uuid', 
                    placeholder: 'Select Mesh'
            }}
    }">
        <input type="hidden" name="scene_uuid" :value="sceneUUID" />
        <input v-if="uuid" type="hidden" name="uuid" :value="uuid" />
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

const { sdk } = useSceneSDK();
const editorEntityCtrl = useEditorEntity();
const sceneUUID = router.currentRoute.value.params.sceneUUID;
const name = ref(props.data ? props.data.recordData.name : '');
const uuid = ref(props.data ? props.data.recordData.uuid : '');
const mesh = ref(props.data ? props.data.recordData.Mesh.uuid : '');
const surfaceOffset = ref(props.data ? props.data.recordData.SurfaceOffset : { x: 0, y: 0, z: 0 });
const surfaceSize = ref(props.data ? props.data.recordData.SurfaceSize : { x: 0, y: 0, z: 0 });
const uiOffset = ref(props.data ? props.data.recordData.UIOffset : { x: 0, y: 0, z: 0 });
const uiRotation = ref(props.data ? props.data.recordData.UIRotation : { x: 0, y: 0, z: 0 });

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
        responseInclude: [
            { model: 'Position' },
            { model: 'Rotation' },
            { model: 'Scale' },
            { model: 'SurfaceOffset' },
            { model: 'SurfaceSize' },
            { model: 'UIOffset' },
            { model: 'UIRotation' },
            { model: 'Mesh' }
        ]
    };
    
    const surfaceOffsetValues = {x: params['surface_offset[x]'], y: params['surface_offset[y]'], z: params['surface_offset[z]']};
    const surfaceSizeValues = {x: params['surface_size[x]'], y: params['surface_size[y]'], z: params['surface_size[z]']};
    const uiOffsetValues = {x: params['ui_offset[x]'], y: params['ui_offset[y]'], z: params['ui_offset[z]']};
    const uiRotationValues = {x: params['ui_rotation[x]'], y: params['ui_rotation[y]'], z: params['ui_rotation[z]']};
    
    if (uuid.value) {
        surfaceOffsetValues.uuid = props.data.recordData.SurfaceOffset.uuid;
        surfaceSizeValues.uuid = props.data.recordData.SurfaceSize.uuid;
        uiOffsetValues.uuid = props.data.recordData.UIOffset.uuid;
        uiRotationValues.uuid = props.data.recordData.UIRotation.uuid;

        await sdk.api.Vector3DController.update(surfaceOffsetValues);
        await sdk.api.Vector3DController.update(surfaceSizeValues);
        await sdk.api.Vector3DController.update(uiOffsetValues);
        await sdk.api.Vector3DController.update(uiRotationValues);

        const sceneCheckout = await sdk.api.SceneCheckoutController.update(params);
        await editorEntityCtrl.updateCheckout(sceneCheckout);
        toastCtrl.add('Checkout updated', 5000, 'success');
    } else {
        const position = await sdk.api.Vector3DController.create(surfaceOffsetValues);
        const rotation = await sdk.api.Vector3DController.create(uiRotationValues);
        const scale = await sdk.api.Vector3DController.create(uiOffsetValues);
        const surfaceOffset = await sdk.api.Vector3DController.create(surfaceOffsetValues);
        const surfaceSize = await sdk.api.Vector3DController.create(surfaceSizeValues);
        const uiOffset = await sdk.api.Vector3DController.create(uiOffsetValues);
        const uiRotation = await sdk.api.Vector3DController.create(uiRotationValues);
        params.position_uuid = position.uuid;
        params.rotation_uuid = rotation.uuid;
        params.scale_uuid = scale.uuid;
        params.surface_offset_uuid = surfaceOffset.uuid;
        params.surface_size_uuid = surfaceSize.uuid;
        params.ui_offset_uuid = uiOffset.uuid;
        params.ui_rotation_uuid = uiRotation.uuid;

        const checkout = await sdk.api.SceneCheckoutController.create(params);
        await editorEntityCtrl.createCheckout(checkout);
        clearData();
        toastCtrl.add('Checkout created', 5000, 'success');
    }
}
</script>
