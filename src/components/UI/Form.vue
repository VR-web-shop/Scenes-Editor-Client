<template>
    <form @submit.prevent="submit" ref="formRef" class="p-3 text-white">
        <div v-for="(field, key) in record" :key="key">
            <input 
                v-if="[ 'text', 'number', 'email', 'password', 'number' ].includes(field.type)"
                :type="field.type"
                :name="key"
                :placeholder="field.placeholder || key" 
                v-model="data[key]"
                class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]" 
            />

            <div v-else-if="field.type === 'color'">
                <label class="text-sm text-white">{{ field.placeholder || key }}</label>
                <input 
                    type="color"
                    :name="key"
                    v-model="data[key]"
                    class="w-full text-sm p-2 h-12 mb-1 rounded-md bg-white/[.10]" 
                />
            </div>

            <div v-else-if="field.type === 'vector3d'">
                <VectorInput
                    :title="field.placeholder || key"
                    :name="key"
                    :x="data[key].x"
                    :y="data[key].y"
                    :z="data[key].z"
                    @change="v => data[key] = v"
                    class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]"
                />
            </div>

            <input 
                v-else-if="field.type === 'file'"
                type="file"
                :name="key"
                :placeholder="field.placeholder || key"
                :accept="field.accept || '*/*'" 
                class="w-full text-sm p-2 mb-1 rounded-md bg-white/[.10]" 
            />

            <select 
                v-else-if="field.type === 'select'"
                v-model="data[key]" 
                :name="key" 
                class="w-full p-2 text-sm mb-3 bg-white/[.10] rounded-md"
            >
                <option value="" class="text-black">{{ field.placeholder || key }}</option>
                <option v-for="option in field.options" :key="option" :value="option" class="text-black">
                    {{ option }}
                </option>
            </select>

            <Paginator v-else-if="field.type === 'select-paginator'" :findAllMethod="field.paginator.findMethod" :limit="field.paginator.limit" class="mb-3">
                <template #empty>
                    <div class="text-center">{{ field.emptyMessage || 'No items found' }}</div>
                </template>

                <template #default="{ entities }">
                    <div v-if="field.paginator.disabledMsg" class="text-xs mb-1">
                        {{ field.paginator.disabledMsg }}
                    </div>

                    <select v-model="data[key]" :name="key" class="w-full p-2 text-sm bg-white/[.10] rounded-md" :disabled="field.paginator.disabled">
                        <option value="" class="text-black">{{ field.paginator.placeholder || key }}</option>
                        <option v-for="entity in entities" :key="entity[field.paginator.foreignKey]" :value="entity[field.paginator.valueKey]"
                            class="text-black">
                            {{ entity[field.paginator.displayKey] }}
                        </option>
                    </select>
                </template>
            </Paginator>

            <div v-else-if="field.type === 'select-paginator-multiple'">
                <p class="mb-3 text-white">{{ field.paginator.placeholder }}</p>
                <div class="mb-3 pb-3 border-b border-gray-500 max-h-[200px] overflow-y-auto">
                    <p v-if="data[key].length === 0" class="text-gray-500">None selected</p>
                    <div v-else>
                        <div v-for="selected in data[key]" :key="selected"
                            class="p-2 bg-white/[.10] rounded-md mb-1">
                            <div class="flex justify-between gap-3">
                                <div class="w-full">
                                    <div class="flex gap-1 text-white text-sm">
                                        <span class="font-bold">{{ field.paginator.displayKey }}:</span>
                                        <span>{{ selected.datum[field.paginator.displayKey] }}</span>
                                    </div>
                                </div>

                                <button type="button" @click="removeMultipleSelectItem(selected.UIid, key)"
                                    class="bg-red-500 text-white px-1 py-1 rounded-md">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>

                <Paginator :findAllMethod="field.paginator.findMethod" :limit="field.paginator.limit">
                    <template #empty>
                        <div class="text-center">{{ field.emptyMessage || 'No items found' }}</div>
                    </template>

                    <template #default="{ entities }">
                        <div class="w-full p-2 text-sm mb-1 bg-white/[.10] rounded-md mb-3">
                            <div v-for="entity in entities" :key="entity[field.paginator.foreignKey]"
                                class="text-white flex items-center justify-between gap-3">
                                <p>{{ entity[field.paginator.displayKey] }}</p>

                                <div v-if="field.paginator.unique && isItemInMultipleSelect(entity[field.paginator.foreignKey], field.paginator.foreignKey, key)"
                                    class="flex items-center justify-start gap-2">
                                    <span class="bg-red-500 px-1 py-1 rounded-md text-white">
                                        Already added
                                    </span>
                                </div>
                                <button v-else type="button" @click="addMultipleSelectItem(entity, key)"
                                    class="bg-emerald-500 text-white px-1 py-1 rounded-md">Add</button>
                            </div>
                        </div>
                    </template>
                </Paginator>
            </div>
            
        </div>

        <slot />
        
        <button type="submit" class="border border-gray-300 px-3 py-1 rounded mt-3">
            {{ buttonText }}
        </button>
    </form>  
</template>

<script setup>
import Paginator from './Paginator.vue';
import VectorInput from './VectorInput.vue';
import { useToast } from '../../composables/useToast.js';
import { ref } from 'vue';

const formRef = ref(null);
const toastCtrl = useToast();
const props = defineProps({
    submitMethod: Function,
    buttonText: {
        type: String,
        default: 'Create'
    },
    record: {
        type: Object,
        default: {
            name: { value: '', required: true, type: 'text'},
            source: { value: '', required: true, type: 'text'},
            type: { 
                value: '', 
                required: true, 
                type: 'select', 
                paginator: {
                    findMethod: () => {},
                    limit: 10,
                    emptyMessage: 'No items found',
                    foreignKey: 'uuid',
                    displayKey: 'name',
                    valueKey: 'name',
                }
            },
        }
    }
})

const UIid = ref(0)
const data = ref({});
for (const key in props.record) {
    data.value[key] = ref(props.record[key].value);
}

const isItemInMultipleSelect = (foreignKey, foreignKeyName, key) => {
    return data.value[key].some(item => item.datum[foreignKeyName] === foreignKey);
}

const removeMultipleSelectItem = (UIid, key) => {
    data.value[key] = data.value[key].filter(item => item.UIid !== UIid);
}

const addMultipleSelectItem = (datum, key) => {
    data.value[key].push({ datum, UIid: UIid.value++ });
}

const toJson = () => {
    const formData = new FormData(formRef.value);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

const clearData = () => {
    for (const key in props.record) {
        data.value[key] = '';
    }
}

const submit = async () => {
    const formData = new FormData(formRef.value);
    for (const field of Object.keys(props.record)) {
        if (props.record[field].type === 'file') {
            const size = formData.get(field).size;
            if (size <= 0) {
                toastCtrl.add(`${field} is required`, 5000, 'error');
                return
            }
            
            continue;
        }

        if (props.record[field].type === 'select-paginator') {
            if (props.record[field].paginator.disabled) {
                formData.append(field, props.record[field].value);
                continue;
            }
        }

        if (props.record[field].type === 'vector3d') {
            formData.append(`${field}[x]`, data.value[field].x);
            formData.append(`${field}[y]`, data.value[field].y);
            formData.append(`${field}[z]`, data.value[field].z);
            continue
        }
        
        if (props.record[field].required && !formData.get(field)) {
            toastCtrl.add(`${field} is required`, 5000, 'error');
            return
        }
    }

    const response = await props.submitMethod(formData, toJson, clearData, toastCtrl);
    if (response) {
        for (const field of Object.keys(props.record)) {
            data.value[field] = '';
        }
    }
}
</script>
