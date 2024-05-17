import W3CWebSocket from 'websocket';
import * as THREE from 'three';
const URL = import.meta.env.VITE_SCENES_WEBSOCKET_URL
const PROTOCOL = 'echo-protocol';
const client = new W3CWebSocket.w3cwebsocket(URL, PROTOCOL);
const eventDispatcher = new THREE.EventDispatcher();

client.onerror = function() {
    console.log('Connection Error');
};

client.onopen = function() {
    console.log('WebSocket Client Connected');
};

client.onclose = function() {
    console.log('echo-protocol Client Closed');
};

client.onmessage = function(e) {
    if (typeof e.data === 'string') {
        const data = JSON.parse(e.data);
        const { type, payload } = data;
        eventDispatcher.dispatchEvent({ type: type, payload: payload });
    }
};

export const useWebsocket = () => {

    const EVENTS = {        
        SCENES_NEW_SCENE_PRODUCT: 'scenes_new_scene_product',
        SCENES_DELETE_SCENE_PRODUCT: 'scenes_delete_scene_product',
    }

    const addEventListener = (type, listener) => {
        if (!Object.values(EVENTS).includes(type)) {
            throw new Error('Invalid event type');
        }

        eventDispatcher.addEventListener(type, listener);
    }

    const removeEventListener = (type, listener) => {
        if (!Object.values(EVENTS).includes(type)) {
            throw new Error('Invalid event type');
        }

        eventDispatcher.removeEventListener(type, listener);
    }

    return { 
        addEventListener, 
        removeEventListener,
        EVENTS
    }
}
