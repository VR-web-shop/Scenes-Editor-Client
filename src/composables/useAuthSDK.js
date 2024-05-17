import { ref } from 'vue'
import AuthSDK from '@vr-web-shop/auth'

const SERVER_URL = import.meta.env.VITE_AUTH_SERVER_URL
const sdk = new AuthSDK(SERVER_URL)
const authenticated = ref(false)

export function useAuthSDK() {
    return {
        authenticated,
        sdk
    }
}
