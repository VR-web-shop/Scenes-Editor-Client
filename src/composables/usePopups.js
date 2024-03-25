import { ref } from 'vue'

const popups = ref([])
const openPopup = ref(null)
const STATE = {
    OPEN: 'open',
    MINIMIZED: 'minimized',
    CLOSED: 'closed'
}

export const usePopups = () => {

    const getPopup = (name) => {
        return popups.value.find(popup => popup.name === name)
    }

    const addPopup = (name, state=STATE.CLOSED) => {
        if (getPopup(name)) throw new Error(`Popup with name ${name} already exists`)
        if (!Object.values(STATE).includes(state)) throw new Error(`Invalid state ${state}`)
        popups.value.push({ name, state})
    }

    const removePopup = (name) => {
        popups.value = popups.value.filter(popup => popup.name !== name)
    }

    const setState = (name, state) => {
        const popup = getPopup(name)
        if (!popup) throw new Error(`Popup with name ${name} does not exist`)
        if (!Object.values(STATE).includes(state)) throw new Error(`Invalid state ${state}`)
        
        if (openPopup.value) {
            const isTheOpenPopup = openPopup.value.name === name
            if (state !== STATE.OPEN && isTheOpenPopup) 
                openPopup.value = null
            else if (state === STATE.OPEN && !isTheOpenPopup)
                openPopup.value.state = STATE.MINIMIZED
        }

        if (state === STATE.OPEN) openPopup.value = popup

        popup.state = state
    }

    const hasState = (name, state) => {
        const popup = getPopup(name)
        if (!popup) throw new Error(`Popup with name ${name} does not exist`)
        return popup.state === state
    }

    const open = (name, data=null) => {
        const popup = getPopup(name)
        if (!popup) throw new Error(`Popup with name ${name} does not exist`)
        if (data) popup.data = data
        setState(name, STATE.OPEN)
    }
    const minimize = (name) => {
        if (hasState(name, STATE.OPEN)) setState(name, STATE.MINIMIZED)
        else setState(name, STATE.OPEN)
    }

    const close = (name) => setState(name, STATE.CLOSED)
    const toggle = (name) => {
        if (isOpen(name)) open(name)
        else minimize(name)
    }

    const isOpen = (name) => hasState(name, STATE.OPEN)
    const isMinimized = (name) => hasState(name, STATE.MINIMIZED)
    const isClosed = (name) => hasState(name, STATE.CLOSED)

    return {
        popups,
        getPopup,
        addPopup,
        removePopup,
        open,
        toggle,
        minimize,
        close,
        isOpen,
        isMinimized,
        isClosed
    }
}
