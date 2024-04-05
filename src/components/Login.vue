<template>
    <div class="h-screen flex items-center justify-center">
        <div v-if="!showIntro" class="bg-white p-3 rounded border border-gray-300 shadow-md text-center">
            <h1 class="text-xl font-bold mb-1">Scenes Editor</h1>
            <p class="mb-3">
                Login to continue
            </p>

            <form @submit.prevent="submit">

                <div class="mb-1">
                    <input class="w-full p-1 border border-gray-300 rounded-md" type="email" placeholder="E-mail" v-model="email" />
                </div>

                <div class="mb-1">
                    <input class="w-full p-1 border border-gray-300 rounded-md" type="password" placeholder="Password" v-model="password" />
                </div>

                <button class="w-full p-1 border border-gray-300 rounded-md" type="submit">Login</button>
            </form>
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
const email = ref('admin@example.com');
const password = ref('12345678');
const showIntro = ref(null);
const introMsg = ref('')
const introShowTime = 6000;

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

    const { api, requests } = sdk
    const { authentication } = api
    const req = new requests.AuthRequest.CreateRequest({
        email: email.value,
        password: password.value,
    })

    try {
        await authentication.login(req)
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
