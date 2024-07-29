<template>
    <div>
        <p class="text-sm text-left p-3">
            Scene products are used to display products in the scene. A scene product requires a product, a mesh, a UI offset position, a UI offset rotation and a UI scale.
        </p>
        <FormComponent 
            :submitMethod="submit" 
            :buttonText="client_side_uuid ? 'Update' : 'Create'" 
            :record="{
                ui_offset_position: { value: uiOffset, required: true, type: 'vector3d', placeholder: 'UI Offset Position' },
                ui_offset_rotation: { value: uiRotation, required: true, type: 'vector3d', placeholder: 'UI Offset Rotation' },
                ui_scale: { value: uiScale, required: true, type: 'vector3d', placeholder: 'UI Scale' },
                product_client_side_uuid: { value: product, required: true, type: 'select-paginator', paginator: {
                    findMethod: sdk.Product.findAll,
                    limit: 10,
                    emptyMessage: 'No products found',
                    foreignKey: 'uuid',
                    displayKey: 'name',
                    valueKey: 'client_side_uuid', 
                    placeholder: 'Select Product',
                    disabledMsg: 'The product cannot be changed after creation',
                    disabled: true
                }},
                mesh_client_side_uuid: { value: mesh, required: true, type: 'select-paginator', paginator: {
                    findMethod: sdk.Mesh.findAll,
                    limit: 10,
                    emptyMessage: 'No meshes found',
                    foreignKey: 'uuid',
                    displayKey: 'name',
                    valueKey: 'client_side_uuid', 
                    placeholder: 'Select Mesh',
                }}
        }">
            <input v-if="client_side_uuid" type="hidden" name="client_side_uuid" :value="client_side_uuid" />
        </FormComponent>
    </div>
</template>

<script setup>
import FormComponent from '../../UI/Form.vue';
import { useNotifications } from '../../../composables/useNotifications.js';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { ref } from 'vue';

const toast = useToast();
const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const { sdk } = useSceneSDK();
const editorEntityCtrl = useEditorEntity();
const notificationCtrl = useNotifications();
const client_side_uuid = ref(props.data ? props.data.recordData.client_side_uuid : '');
const product = ref(props.data ? props.data.recordData.product_client_side_uuid : '');
const mesh = ref(props.data && props.data.recordData.mesh_client_side_uuid ? props.data.recordData.mesh_client_side_uuid : '');
const uiOffset = ref(props.data ? props.data.recordData.ui_offset_position_client_side_uuid : { x: 0, y: 0, z: 0 });
const uiRotation = ref(props.data ? props.data.recordData.ui_offset_rotation_client_side_uuid : { x: 0, y: 0, z: 0 });
const uiScale = ref(props.data ? props.data.recordData.ui_scale_client_side_uuid : { x: 0, y: 0, z: 0 });
console.log(props.data);
const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
    };

    const uiOffsetValues = {x: params['ui_offset_position[x]'], y: params['ui_offset_position[y]'], z: params['ui_offset_position[z]']};
    const uiRotationValues = {x: params['ui_offset_rotation[x]'], y: params['ui_offset_rotation[y]'], z: params['ui_offset_rotation[z]']};
    const uiScaleValues = {x: params['ui_scale[x]'], y: params['ui_scale[y]'], z: params['ui_scale[z]']};
    
    if (params.client_side_uuid) {
        const position_client_side_uuid = props.data.recordData.position_client_side_uuid.client_side_uuid;
        const rotation_client_side_uuid = props.data.recordData.rotation_client_side_uuid.client_side_uuid;
        const scale_client_side_uuid = props.data.recordData.ui_scale_client_side_uuid.client_side_uuid;
        const ui_offset_position_client_side_uuid = props.data.recordData.ui_offset_position_client_side_uuid.client_side_uuid;
        const ui_offset_rotation_client_side_uuid = props.data.recordData.ui_offset_rotation_client_side_uuid.client_side_uuid;
        const ui_scale_client_side_uuid = props.data.recordData.ui_scale_client_side_uuid.client_side_uuid;
        const product_client_side_uuid = props.data.recordData.product_client_side_uuid;
        const scene_client_side_uuid = props.data.recordData.scene_client_side_uuid;

        await sdk.Vector3D.update(ui_offset_position_client_side_uuid, uiOffsetValues);
        await sdk.Vector3D.update(ui_offset_rotation_client_side_uuid, uiRotationValues);
        await sdk.Vector3D.update(ui_scale_client_side_uuid, uiScaleValues);

        params.ui_offset_position_client_side_uuid = ui_offset_position_client_side_uuid;
        params.ui_offset_rotation_client_side_uuid = ui_offset_rotation_client_side_uuid;
        params.ui_scale_client_side_uuid = ui_scale_client_side_uuid;
        params.position_client_side_uuid = position_client_side_uuid;
        params.rotation_client_side_uuid = rotation_client_side_uuid;
        params.scale_client_side_uuid = scale_client_side_uuid;
        params.product_client_side_uuid = product_client_side_uuid;
        params.scene_client_side_uuid = scene_client_side_uuid;
        params.scene_product_state_name = 'ReadyForSale';

        await sdk.SceneProduct.update(params.client_side_uuid, params);

        /*
        if (props.data.recordData.mesh_client_side_uuid === null) {
            await editorEntityCtrl.createProduct(params);
            props.data.recordData.mesh_client_side_uuid = mesh.value.uuid;
        } else {
            await editorEntityCtrl.updateProduct(params);
        }
        */
        toastCtrl.add('Real-time update disabled', 5000, 'warning');

        toastCtrl.add('Product updated', 5000, 'success');
        setTimeout(() => {
            toastCtrl.add('Synchronize notifications', 5000, 'info');
            notificationCtrl.sync();
        }, 1000);
    }
}
</script>
