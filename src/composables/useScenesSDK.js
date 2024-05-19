import SceneSDK from '@vr-web-shop/scenes'

const SERVER_URL = import.meta.env.VITE_SCENES_SERVER_URL
const sdk = SceneSDK(SERVER_URL, {
    authTokenKey: 'auth'
})

export function useSceneSDK() {
    return {
        sdk
    }
}
