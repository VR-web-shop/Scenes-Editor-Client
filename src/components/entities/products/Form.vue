<template>
    <FormComponent 
        :submitMethod="submit" 
        :buttonText="uuid ? 'Update' : 'Create'" 
        :record="{
            ui_offset_position: { value: uiOffset, required: true, type: 'vector3d', placeholder: 'UI Offset Position' },
            ui_offset_rotation: { value: uiRotation, required: true, type: 'vector3d', placeholder: 'UI Offset Rotation' },
            ui_scale: { value: uiScale, required: true, type: 'vector3d', placeholder: 'UI Scale' },
            product_uuid: { value: product, required: true, type: 'select-paginator', paginator: {
                findMethod: sdk.api.ProductController.findAll,
                limit: 10,
                emptyMessage: 'No products found',
                foreignKey: 'uuid',
                displayKey: 'name',
                valueKey: 'uuid', 
                placeholder: 'Select Product',
                disabledMsg: 'The product cannot be changed after creation',
                disabled: true
            }},
            mesh_uuid: { value: mesh, required: true, type: 'select-paginator', paginator: {
                findMethod: sdk.api.MeshController.findAll,
                limit: 10,
                emptyMessage: 'No meshes found',
                foreignKey: 'uuid',
                displayKey: 'name',
                valueKey: 'uuid', 
                placeholder: 'Select Mesh',
            }}
    }">
        <input v-if="uuid" type="hidden" name="uuid" :value="uuid" />
    </FormComponent>
</template>

<script setup>
import FormComponent from '../../UI/Form.vue';
import { useNotifications } from '../../../composables/useNotifications.js';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { ref } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const { sdk } = useSceneSDK();
const editorEntityCtrl = useEditorEntity();
const notificationCtrl = useNotifications();
const uuid = ref(props.data ? props.data.recordData.uuid : '');
const product = ref(props.data ? props.data.recordData.product_uuid : '');
const mesh = ref(props.data && props.data.recordData.Mesh ? props.data.recordData.Mesh.uuid : '');
const uiOffset = ref(props.data ? props.data.recordData.UIOffsetPosition : { x: 0, y: 0, z: 0 });
const uiRotation = ref(props.data ? props.data.recordData.UIOffsetRotation : { x: 0, y: 0, z: 0 });
const uiScale = ref(props.data ? props.data.recordData.UIScale : { x: 0, y: 0, z: 0 });
console.log(props.data.recordData);
const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
        responseInclude: [
            { model: 'Position' },
            { model: 'Rotation' },
            { model: 'Scale' },
            { model: 'Mesh' },
            { model: 'Product' },
            { model: 'UIOffsetPosition' },
            { model: 'UIOffsetRotation' },
            { model: 'UIScale' },
        ]
    };

    const uiOffsetValues = {x: params['ui_offset_position[x]'], y: params['ui_offset_position[y]'], z: params['ui_offset_position[z]']};
    const uiRotationValues = {x: params['ui_offset_rotation[x]'], y: params['ui_offset_rotation[y]'], z: params['ui_offset_rotation[z]']};
    const uiScaleValues = {x: params['ui_scale[x]'], y: params['ui_scale[y]'], z: params['ui_scale[z]']};
    
    if (params.uuid) {
        uiOffsetValues.uuid = props.data.recordData.UIOffsetPosition.uuid;
        uiRotationValues.uuid = props.data.recordData.UIOffsetRotation.uuid;
        uiScaleValues.uuid = props.data.recordData.UIScale.uuid;

        await sdk.api.Vector3DController.update(uiOffsetValues);
        await sdk.api.Vector3DController.update(uiRotationValues);
        await sdk.api.Vector3DController.update(uiScaleValues);

        const sceneProduct = await sdk.api.SceneProductController.update(params);

        if (props.data.recordData.mesh_uuid === null) {
            await editorEntityCtrl.createProduct(sceneProduct);
            props.data.recordData.mesh_uuid = mesh.value.uuid;
        } else {
            await editorEntityCtrl.updateProduct(sceneProduct);
        }

        toastCtrl.add('Product updated', 5000, 'success');
        await notificationCtrl.sync();
    }
}
</script>
