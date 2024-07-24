<template>
    <div>
        <p class="text-sm text-left p-3">
            Checkouts are used to define the areas where the VR player can place their shopping basket. A checkout requires a name, a mesh, a surface offset, a surface size, a UI offset position, a UI offset rotation and a UI scale.
        </p>
        <FormComponent 
            :submitMethod="submit" 
            :buttonText="client_side_uuid ? 'Update' : 'Create'" 
            :record="{
                name: { value: name, required: true, type: 'text' },
                surface_offset: { value: surfaceOffset, required: true, type: 'vector3d', placeholder: 'Surface Offset' },
                surface_size: { value: surfaceSize, required: true, type: 'vector3d', placeholder: 'Surface Size' },
                ui_offset_position: { value: uiOffset, required: true, type: 'vector3d', placeholder: 'UI Offset Position' },
                ui_offset_rotation: { value: uiRotation, required: true, type: 'vector3d', placeholder: 'UI Offset Rotation' },
                ui_scale: { value: uiScale, required: true, type: 'vector3d', placeholder: 'UI Scale' },
                mesh_client_side_uuid: { value: mesh, required: true, type: 'select-paginator', paginator: {
                        findMethod: sdk.Mesh.findAll,
                        limit: 10,
                        emptyMessage: 'No meshes found',
                        foreignKey: 'uuid',
                        displayKey: 'name',
                        valueKey: 'client_side_uuid', 
                        placeholder: 'Select Mesh'
                }}
        }">
            <input type="hidden" name="scene_client_side_uuid" :value="sceneUUID" />
            <input v-if="client_side_uuid" type="hidden" name="client_side_uuid" :value="client_side_uuid" />
        </FormComponent>
    </div>
</template>

<script setup>
import FormComponent from '../../UI/Form.vue';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
import { useSceneSDK } from '../../../composables/useScenesSDK.js';
import { router } from '../../../router.js';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})

const { sdk } = useSceneSDK();
const editorEntityCtrl = useEditorEntity();
const sceneUUID = router.currentRoute.value.params.client_side_uuid;
const name = ref(props.data ? props.data.recordData.name : '');
const client_side_uuid = ref(props.data ? props.data.recordData.client_side_uuid : '');
const mesh = ref(props.data ? props.data.recordData.mesh_client_side_uuid : '');
const surfaceOffset = ref(props.data ? props.data.recordData.surface_offset_client_side_uuid : { x: 0, y: 0, z: 0 });
const surfaceSize = ref(props.data ? props.data.recordData.surface_size_client_side_uuid : { x: 0, y: 0, z: 0 });
const uiOffset = ref(props.data ? props.data.recordData.ui_offset_position_client_side_uuid : { x: 0, y: 0, z: 0 });
const uiRotation = ref(props.data ? props.data.recordData.ui_offset_rotation_client_side_uuid : { x: 0, y: 0, z: 0 });
const uiScale = ref(props.data ? props.data.recordData.ui_scale_client_side_uuid : { x: 0, y: 0, z: 0 });

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
    };
    
    const surfaceOffsetValues = {x: params['surface_offset[x]'], y: params['surface_offset[y]'], z: params['surface_offset[z]']};
    const surfaceSizeValues = {x: params['surface_size[x]'], y: params['surface_size[y]'], z: params['surface_size[z]']};
    const uiOffsetValues = {x: params['ui_offset_position[x]'], y: params['ui_offset_position[y]'], z: params['ui_offset_position[z]']};
    const uiRotationValues = {x: params['ui_offset_rotation[x]'], y: params['ui_offset_rotation[y]'], z: params['ui_offset_rotation[z]']};
    const uiScaleValues = {x: params['ui_scale[x]'], y: params['ui_scale[y]'], z: params['ui_scale[z]']};

    if (client_side_uuid.value) {
        params.surface_offset_client_side_uuid = props.data.recordData.surface_offset_client_side_uuid.client_side_uuid;
        params.surface_size_client_side_uuid = props.data.recordData.surface_size_client_side_uuid.client_side_uuid;
        params.ui_offset_position_client_side_uuid = props.data.recordData.ui_offset_position_client_side_uuid.client_side_uuid;
        params.ui_offset_rotation_client_side_uuid = props.data.recordData.ui_offset_rotation_client_side_uuid.client_side_uuid;
        params.ui_scale_client_side_uuid = props.data.recordData.ui_scale_client_side_uuid.client_side_uuid;

        await sdk.Vector3D.update(params.surface_offset_client_side_uuid, surfaceOffsetValues);
        await sdk.Vector3D.update(params.surface_size_client_side_uuid, surfaceSizeValues);
        await sdk.Vector3D.update(params.ui_offset_position_client_side_uuid, uiOffsetValues);
        await sdk.Vector3D.update(params.ui_offset_rotation_client_side_uuid, uiRotationValues);
        await sdk.Vector3D.update(params.ui_scale_client_side_uuid, uiScaleValues);

        await sdk.SceneCheckout.update(params);
        await editorEntityCtrl.updateCheckout(params);
        toastCtrl.add('Checkout updated', 5000, 'success');
    } else {
        const position_client_side_uuid = uuidv4();
        const rotation_client_side_uuid = uuidv4();
        const scale_client_side_uuid = uuidv4();
        const surface_offset_client_side_uuid = uuidv4();
        const surface_size_client_side_uuid = uuidv4();
        const ui_offset_position_client_side_uuid = uuidv4();
        const ui_offset_rotation_client_side_uuid = uuidv4();
        const ui_scale_client_side_uuid = uuidv4();

        await sdk.Vector3D.create({ client_side_uuid: position_client_side_uuid, ...surfaceOffsetValues });
        await sdk.Vector3D.create({ client_side_uuid: rotation_client_side_uuid, ...uiRotationValues });
        await sdk.Vector3D.create({ client_side_uuid: scale_client_side_uuid, ...uiOffsetValues });
        await sdk.Vector3D.create({ client_side_uuid: surface_offset_client_side_uuid, ...surfaceOffsetValues });
        await sdk.Vector3D.create({ client_side_uuid: surface_size_client_side_uuid, ...surfaceSizeValues });
        await sdk.Vector3D.create({ client_side_uuid: ui_offset_position_client_side_uuid, ...uiOffsetValues });
        await sdk.Vector3D.create({ client_side_uuid: ui_offset_rotation_client_side_uuid, ...uiRotationValues });
        await sdk.Vector3D.create({ client_side_uuid: ui_scale_client_side_uuid, ...uiScaleValues });

        params.position_client_side_uuid = position_client_side_uuid;
        params.rotation_client_side_uuid = rotation_client_side_uuid;
        params.scale_client_side_uuid = scale_client_side_uuid;
        params.surface_offset_client_side_uuid = surface_offset_client_side_uuid;
        params.surface_size_client_side_uuid = surface_size_client_side_uuid;
        params.ui_offset_position_client_side_uuid = ui_offset_position_client_side_uuid;
        params.ui_offset_rotation_client_side_uuid = ui_offset_rotation_client_side_uuid;
        params.ui_scale_client_side_uuid = ui_scale_client_side_uuid;

        await sdk.SceneCheckout.create(params);
        await editorEntityCtrl.createCheckout(params);
        clearData();
        toastCtrl.add('Checkout created', 5000, 'success');
    }
}
</script>
