<script setup>
import Toast from '../components/top/Toast.vue';
import { useToast } from '../composables/useToast.js';
import { useAuthSDK } from '../composables/useAuthSDK.js';
import { usePermission } from '../composables/usePermission.js';
import { ref, onMounted } from 'vue'
import Login from '../components/Login.vue'

const toastCtrl = useToast()

const loginRef = ref()

const { sdk, authenticated } = useAuthSDK()

function checkAccess() {
  const access = usePermission('scenes-editor:client:access');
  if (!access) {
    authenticated.value = false
    sdk.token.remove();
    toastCtrl.add('You do not have access to the admin client', 5000, 'error')
  } else {
    authenticated.value = true
    toastCtrl.add('Login successful', 5000, 'success')
  }
}

onMounted(async () => {
    try { 
      await sdk.api.users.findMe()
      checkAccess();
    } catch (e) { 
      authenticated.value = false
    }
})

async function loginComplete() {
    checkAccess();
}
</script>

<template>
  <div>
    <Toast />
    
    <div v-if="!authenticated">
      <Login ref="loginRef" @complete="loginComplete" />
    </div>

    <div v-else>
      <router-view></router-view>
    </div>
  </div>
</template>
