<template>
    <FormComponent 
        :submitMethod="submit" 
        :buttonText="uuid ? 'Update' : 'Create'" 
        :record="{
            name: { value: name, required: true, type: 'text' },
            object_offset: { value: objectOffset, required: true, type: 'vector3d', placeholder: 'Object Offset (relative to hand)' },
            placeholder_offset: { value: placeholderOffset, required: true, type: 'vector3d', placeholder: 'Placeholder Offset (relative to basket mesh)' },
            pocket_offset: { value: pocketOffset, required: true, type: 'vector3d', placeholder: 'Pocket Offset (relative to VR character)' },
            insert_area_offset: { value: insertAreaOffset, required: true, type: 'vector3d', placeholder: 'Insert Area Offset (relative to basket mesh)' },
            insert_area_size: { value: insertAreaSize, required: true, type: 'vector3d', placeholder: 'Insert Area Size' },
            object_uuid: { value: objectMesh, required: true, type: 'select-paginator', paginator: {
                    findMethod: sdk.api.MeshController.findAll,
                    limit: 10,
                    emptyMessage: 'No meshes found',
                    foreignKey: 'uuid',
                    displayKey: 'name',
                    valueKey: 'uuid', 
                    placeholder: 'Select Basket Mesh'
            }},
            placeholder_uuid: { value: placeholderMesh, required: true, type: 'select-paginator', paginator: {
                    findMethod: sdk.api.MeshController.findAll,
                    limit: 10,
                    emptyMessage: 'No meshes found',
                    foreignKey: 'uuid',
                    displayKey: 'name',
                    valueKey: 'uuid', 
                    placeholder: 'Select Placeholder Mesh'
            }},
            pocket_uuid: { value: pocketMesh, required: true, type: 'select-paginator', paginator: {
                    findMethod: sdk.api.MeshController.findAll,
                    limit: 10,
                    emptyMessage: 'No meshes found',
                    foreignKey: 'uuid',
                    displayKey: 'name',
                    valueKey: 'uuid', 
                    placeholder: 'Select Pocket Mesh'
            }}
    }">
        <input v-if="uuid" type="hidden" name="uuid" :value="uuid" />
    </FormComponent>
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
const uuid = ref(props.data ? props.data.recordData.uuid : '');
const objectMesh = ref(props.data && props.data.recordData.Object ? props.data.recordData.Object.uuid : '');
const placeholderMesh = ref(props.data && props.data.recordData.Placeholder ? props.data.recordData.Placeholder.uuid : '');
const pocketMesh = ref(props.data && props.data.recordData.Pocket ? props.data.recordData.Pocket.uuid : '');
const objectOffset = ref(props.data ? props.data.recordData.ObjectOffset : { x: 0, y: 0, z: 0 });
const placeholderOffset = ref(props.data ? props.data.recordData.PlaceholderOffset : { x: 0, y: 0, z: 0 });
const pocketOffset = ref(props.data ? props.data.recordData.PocketOffset : { x: 0, y: 0, z: 0 });
const insertAreaOffset = ref(props.data ? props.data.recordData.InsertAreaOffset : { x: 0, y: 0, z: 0 });
const insertAreaSize = ref(props.data ? props.data.recordData.InsertAreaSize : { x: 0, y: 0, z: 0 });

const submit = async (formData, toJson, clearData, toastCtrl) => {
    const params = {
        ...toJson(),
        responseInclude: [
            { model: 'Position' },
            { model: 'Rotation' },
            { model: 'Scale' },
            { model: 'Object' },
            { model: 'Placeholder' },
            { model: 'Pocket' },
            { model: 'ObjectOffset' },
            { model: 'PlaceholderOffset' },
            { model: 'PocketOffset' },
            { model: 'InsertAreaOffset' },
            { model: 'InsertAreaSize' }
        ]    
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

        await sdk.api.Vector3DController.update(objectOffsetValues);
        await sdk.api.Vector3DController.update(placeholderOffsetValues);
        await sdk.api.Vector3DController.update(pocketOffsetValues);
        await sdk.api.Vector3DController.update(insertAreaOffsetValues);
        await sdk.api.Vector3DController.update(insertAreaSizeValues);

        const sceneBasket = await sdk.api.SceneBasketController.update(params);

        if (props.data && props.data.recordData.object_uuid === null) {
            await editorEntityCtrl.createBasket(sceneBasket);
        } else {
            await editorEntityCtrl.updateBasket(sceneBasket);
        }

        await notificationCtrl.sync();
        toastCtrl.add('Basket updated', 5000, 'success');
    }
}
</script>
