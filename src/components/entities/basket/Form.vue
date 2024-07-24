<template>
    <div>
        <p class="text-sm text-left p-3">
            Baskets defines the object the VR player use to collect items. The object refer to basket mesh. Pocket mesh refer to the marker the VR player use to spawn the basket. The placeholder mesh refer to the visual displaying items is inserted into the basket. The basket requires an object offset, a placeholder offset, a pocket offset, an insert area offset, an insert area size and a basket mesh, a placeholder mesh and a pocket mesh.
        </p>
        <FormComponent 
            :submitMethod="submit" 
            :buttonText="client_side_uuid ? 'Update' : 'Create'" 
            :record="{
                object_offset: { value: objectOffset, required: true, type: 'vector3d', placeholder: 'Object Offset (relative to hand)' },
                placeholder_offset: { value: placeholderOffset, required: true, type: 'vector3d', placeholder: 'Placeholder Offset (relative to basket mesh)' },
                pocket_offset: { value: pocketOffset, required: true, type: 'vector3d', placeholder: 'Pocket Offset (relative to VR character)' },
                insert_area_offset: { value: insertAreaOffset, required: true, type: 'vector3d', placeholder: 'Insert Area Offset (relative to basket mesh)' },
                insert_area_size: { value: insertAreaSize, required: true, type: 'vector3d', placeholder: 'Insert Area Size' },
                object_client_side_uuid: { value: objectMesh, required: true, type: 'select-paginator', paginator: {
                        findMethod: sdk.Mesh.findAll,
                        limit: 10,
                        emptyMessage: 'No meshes found',
                        foreignKey: 'uuid',
                        displayKey: 'name',
                        valueKey: 'client_side_uuid', 
                        placeholder: 'Select Basket Mesh'
                }},
                placeholder_client_side_uuid: { value: placeholderMesh, required: true, type: 'select-paginator', paginator: {
                        findMethod: sdk.Mesh.findAll,
                        limit: 10,
                        emptyMessage: 'No meshes found',
                        foreignKey: 'uuid',
                        displayKey: 'name',
                        valueKey: 'client_side_uuid', 
                        placeholder: 'Select Placeholder Mesh'
                }},
                pocket_client_side_uuid: { value: pocketMesh, required: true, type: 'select-paginator', paginator: {
                        findMethod: sdk.Mesh.findAll,
                        limit: 10,
                        emptyMessage: 'No meshes found',
                        foreignKey: 'uuid',
                        displayKey: 'name',
                        valueKey: 'client_side_uuid', 
                        placeholder: 'Select Pocket Mesh'
                }}
        }">
            <input v-if="client_side_uuid" type="hidden" name="client_side_uuid" :value="client_side_uuid" />
        </FormComponent>
    </div>
</template>

<script setup>
import FormComponent from '../../UI/Form.vue';
import { useEditorEntity } from '../../../composables/useEditorEntity.js';
import { useNotifications } from '../../../composables/useNotifications';
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
const client_side_uuid = ref(props.data ? props.data.recordData.client_side_uuid : '');
const objectMesh = ref(props.data && props.data.recordData.object_client_side_uuid ? props.data.recordData.object_client_side_uuid : '');
const placeholderMesh = ref(props.data && props.data.recordData.placeholder_client_side_uuid ? props.data.recordData.placeholder_client_side_uuid : '');
const pocketMesh = ref(props.data && props.data.recordData.pocket_client_side_uuid ? props.data.recordData.pocket_client_side_uuid : '');
const objectOffset = ref(props.data ? props.data.recordData.object_offset_client_side_uuid : { x: 0, y: 0, z: 0 });
const placeholderOffset = ref(props.data ? props.data.recordData.placeholder_offset_client_side_uuid : { x: 0, y: 0, z: 0 });
const pocketOffset = ref(props.data ? props.data.recordData.pocket_offset_client_side_uuid : { x: 0, y: 0, z: 0 });
const insertAreaOffset = ref(props.data ? props.data.recordData.insert_area_offset_client_side_uuid : { x: 0, y: 0, z: 0 });
const insertAreaSize = ref(props.data ? props.data.recordData.insert_area_size_client_side_uuid : { x: 0, y: 0, z: 0 });

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
    };

    const objectOffsetValues = {x: params['object_offset[x]'], y: params['object_offset[y]'], z: params['object_offset[z]']};
    const placeholderOffsetValues = {x: params['placeholder_offset[x]'], y: params['placeholder_offset[y]'], z: params['placeholder_offset[z]']};
    const pocketOffsetValues = {x: params['pocket_offset[x]'], y: params['pocket_offset[y]'], z: params['pocket_offset[z]']};
    const insertAreaOffsetValues = {x: params['insert_area_offset[x]'], y: params['insert_area_offset[y]'], z: params['insert_area_offset[z]']};
    const insertAreaSizeValues = {x: params['insert_area_size[x]'], y: params['insert_area_size[y]'], z: params['insert_area_size[z]']};
    
    if (params.uuid) {
        objectOffsetValues.uuid = props.data.recordData.ObjectOffset.uuid;
        placeholderOffsetValues.uuid = props.data.recordData.PlaceholderOffset.uuid;
        pocketOffsetValues.uuid = props.data.recordData.PocketOffset.uuid;
        insertAreaOffsetValues.uuid = props.data.recordData.InsertAreaOffset.uuid;
        insertAreaSizeValues.uuid = props.data.recordData.InsertAreaSize.uuid;

        await sdk.Vector3D.update(objectOffsetValues);
        await sdk.Vector3D.update(placeholderOffsetValues);
        await sdk.Vector3D.update(pocketOffsetValues);
        await sdk.Vector3D.update(insertAreaOffsetValues);
        await sdk.Vector3D.update(insertAreaSizeValues);

        await sdk.SceneBasketController.update(params);

        if (props.data && props.data.recordData.object_uuid === null) {
            await editorEntityCtrl.createBasket(params);
        } else {
            await editorEntityCtrl.updateBasket(params);
        }

        await notificationCtrl.sync();
        toastCtrl.add('Basket updated', 5000, 'success');
    }
}
</script>
