<template>
    <div class="h-screen flex items-center justify-center bg-slate-200">
        <div v-if="!showIntro" class="bg-white p-6 rounded border border-gray-300 shadow-md">
            <h1 class="text-3xl mb-1 text-center">
                Scene 3D Editor
            </h1>
            <p class="mb-6 text-sm text-center">
                Enter your credentials to continue
            </p>

            <form @submit.prevent="submit" class="mb-6">

                <div class="mb-3 p-3 border border-gray-300 rounded-md">
                    <label for="email" class="block mb-1">E-mail</label>
                    <input class="w-full p-3 border border-gray-300 rounded-md" type="email" placeholder="E-mail" v-model="email" />
                </div>

                <div class="mb-3 p-3 border border-gray-300 rounded-md">
                    <label for="password" class="block mb-1">Password</label>
                    <input class="w-full p-3 border border-gray-300 rounded-md" type="password" placeholder="Password" v-model="password" />
                </div>

                <button class="w-full p-1 border border-gray-300 rounded-md" type="submit">Login</button>
            </form>

            <div class="text-center mt-4 flex flex-col gap-3">
                <a :href="scenesVrClientURL" target="_blank" class="text-blue-500">Customer Website</a>
                <a :href="adminClientURL" target="_blank" class="text-blue-500">Admin Client</a>
            </div>
        </div>

        <Transition name="fade-in">
            <div v-if="showIntro" class="w-45">
                <div class="uppercase">
                    <div>Welcome back</div>
                </div>

                <p class="uppercase text-xs">Message of the day:</p>
                <p class="italic">{{ introMsg }}</p>
            </div>
        </Transition>
    </div>
</template>

<script setup>

import { ref, defineEmits } from 'vue';
import { useToast } from '../composables/useToast.js';
import { useAuthSDK } from '../composables/useAuthSDK.js';

const emits = defineEmits(['complete']);
const email = ref('');
const password = ref('');
const showIntro = ref(null);
const introMsg = ref('')
const introShowTime = 6000;

const scenesVrClientURL = import.meta.env.VITE_SCENES_VR_CLIENT_URL;
const adminClientURL = import.meta.env.VITE_ADMIN_CLIENT_URL;

const { add } = useToast();
const { sdk } = useAuthSDK();

async function submit() {
    if (!email.value) {
        add('Email is required', 5000, 'error');
        return;
    }

    if (!password.value) {
        add('Password is required', 5000, 'error');
        return;
    }

    try {
        await sdk.api.authentication.login({
            email: email.value,
            password: password.value,
        })
        introMsg.value = await msgOfTheDay();
        showIntro.value = true;
        setTimeout(() => {
            emits('complete')
        }, introShowTime);
    } catch (e) {
        add('Invalid credentials', 5000, 'error');
        return;
    }
}

async function msgOfTheDay() {
    return "Hello world!"
}

</script>

<style>

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.fade-in-enter-active {
    animation: fadeIn 2.5s;
}

.fade-in-leave-active {
    animation: fadeIn 0.5s reverse;
}


</style>
