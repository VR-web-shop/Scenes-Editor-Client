import { ref } from 'vue'
import AuthSDK from '@vr-web-shop/auth'

const SERVER_URL = 'http://localhost:3000'
const sdk = new AuthSDK(SERVER_URL)
const authenticated = ref(false)

export function useAuthSDK() {
    return {
        authenticated,
        sdk
    }
}
