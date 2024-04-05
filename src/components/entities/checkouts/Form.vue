<template>
    <FormComponent 
        :submitMethod="submit" 
        :buttonText="uuid ? 'Update' : 'Create'" 
        :record="{
            name: { value: name, required: true, type: 'text' },
            surface_offset: { value: surfaceOffset, required: true, type: 'vector3d', placeholder: 'Surface Offset' },
            surface_size: { value: surfaceSize, required: true, type: 'vector3d', placeholder: 'Surface Size' },
            ui_offset_position: { value: uiOffset, required: true, type: 'vector3d', placeholder: 'UI Offset Position' },
            ui_offset_rotation: { value: uiRotation, required: true, type: 'vector3d', placeholder: 'UI Offset Rotation' },
            ui_scale: { value: uiScale, required: true, type: 'vector3d', placeholder: 'UI Scale' },
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
const uiOffset = ref(props.data ? props.data.recordData.UIOffsetPosition : { x: 0, y: 0, z: 0 });
const uiRotation = ref(props.data ? props.data.recordData.UIOffsetRotation : { x: 0, y: 0, z: 0 });
const uiScale = ref(props.data ? props.data.recordData.UIScale : { x: 0, y: 0, z: 0 });

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
        responseInclude: [
            { model: 'Position' },
            { model: 'Rotation' },
            { model: 'Scale' },
            { model: 'SurfaceOffset' },
            { model: 'SurfaceSize' },
            { model: 'UIOffsetPosition' },
            { model: 'UIOffsetRotation' },
            { model: 'UIScale' },
            { model: 'Mesh' }
        ]
    };
    
    const surfaceOffsetValues = {x: params['surface_offset[x]'], y: params['surface_offset[y]'], z: params['surface_offset[z]']};
    const surfaceSizeValues = {x: params['surface_size[x]'], y: params['surface_size[y]'], z: params['surface_size[z]']};
    const uiOffsetValues = {x: params['ui_offset_position[x]'], y: params['ui_offset_position[y]'], z: params['ui_offset_position[z]']};
    const uiRotationValues = {x: params['ui_offset_rotation[x]'], y: params['ui_offset_rotation[y]'], z: params['ui_offset_rotation[z]']};
    const uiScaleValues = {x: params['ui_scale[x]'], y: params['ui_scale[y]'], z: params['ui_scale[z]']};

    if (uuid.value) {
        surfaceOffsetValues.uuid = props.data.recordData.SurfaceOffset.uuid;
        surfaceSizeValues.uuid = props.data.recordData.SurfaceSize.uuid;
        uiOffsetValues.uuid = props.data.recordData.UIOffsetPosition.uuid;
        uiRotationValues.uuid = props.data.recordData.UIOffsetRotation.uuid;
        uiScaleValues.uuid = props.data.recordData.UIScale.uuid;

        await sdk.api.Vector3DController.update(surfaceOffsetValues);
        await sdk.api.Vector3DController.update(surfaceSizeValues);
        await sdk.api.Vector3DController.update(uiOffsetValues);
        await sdk.api.Vector3DController.update(uiRotationValues);
        await sdk.api.Vector3DController.update(uiScaleValues);

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
        const uiScale = await sdk.api.Vector3DController.create(uiScaleValues);
        params.position_uuid = position.uuid;
        params.rotation_uuid = rotation.uuid;
        params.scale_uuid = scale.uuid;
        params.surface_offset_uuid = surfaceOffset.uuid;
        params.surface_size_uuid = surfaceSize.uuid;
        params.ui_offset_position_uuid = uiOffset.uuid;
        params.ui_offset_rotation_uuid = uiRotation.uuid;
        params.ui_scale_uuid = uiScale.uuid;

        const checkout = await sdk.api.SceneCheckoutController.create(params);
        await editorEntityCtrl.createCheckout(checkout);
        clearData();
        toastCtrl.add('Checkout created', 5000, 'success');
    }
}
</script>
