import SceneSDK from '@vr-web-shop/scenes'

const SERVER_URL = import.meta.env.VITE_SCENES_SERVER_URL
const sdk = new SceneSDK(SERVER_URL)

export function useSceneSDK() {
    return {
        sdk
    }
}
