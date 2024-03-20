import { ref, toRaw } from 'vue'

import Editor, { ViewConfiguration } from '../editor/editor.js'
import LoadMesh, { SubMeshConfiguration } from '../editor/plugins/cache/commands/LoadMesh.js'
import LoadMaterial from '../editor/plugins/cache/commands/LoadMaterial.js'
import LoadTexture from '../editor/plugins/cache/commands/LoadTexture.js'
import CreateObject from '../editor/plugins/object/commands/CreateObject.js'
import SetSceneCubeMap from '../editor/src/view/commands/SetSceneCubeMap.js'

import IsState from '../editor/src/readers/IsState.js'

const editor = ref(null)
const stateReader = ref(null)

export const useEditor = () => {

    const init = (canvas, viewConfiguration = new ViewConfiguration(),  frameRate = 1000 / 60) => {
        editor.value = new Editor(canvas, viewConfiguration, frameRate)
        stateReader.value = new IsState(editor.value)
    }

    const start = async () => {
        editor.value.start()        
    }

    const pause = () => {
        editor.value.pause()
    }

    const resume = () => {
        editor.value.resume()
    }

    const stop = () => {
        editor.value.stop()
    }

    const isState = (stateType) => {
        if (!editor.value) return false
        return stateReader.value.compare(stateType)
    }

    const invoke = async (command) => {
        await editor.value.invoke(command)
    }

    const newReader = (ReaderType, ...args) => {
        return new ReaderType(toRaw(editor.value), ...args)
    }

    return {
        init,
        start,
        stop,
        pause,
        resume,
        isState,
        invoke,
        newReader
    }
}
