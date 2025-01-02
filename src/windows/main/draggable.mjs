import { elementStyleById } from '../../tools/elementHandler.mjs'
let store
let isLock
let isFollow

const main = async () => {
    try {
        const pet = document.querySelector('#pet')
        const API = window.api
        ipcMethod(API)
        store = await window.api.invoke('getStore')
        isLock = store.isLock
        isFollow = store.isFollow
        initPosition(store)
        modeToggle()
        eventListener(API)

    } catch (error) {
        API.send('log', error.message)
    }

}

const ipcMethod = async (API) => {
    try {
        await API.on('option-lock', async (event, bool) => {
            isLock = bool
            await API.send('setStore', {
                name: 'isLock',
                value: bool
            })
        })
        
        await API.on('option-follow', async (event, bool) => {
            isFollow = bool
            await API.send('setStore', {
                name: 'isFollow',
                value: bool
            })
        })
    } catch (error) {
        console.log(error.message)
    }
}

const modeToggle =() => {
    if (store.mode.image) {
        elementStyleById([
            ["pet", "display", "block"],
            ["spine", "display", "none"]
        ])
        pet.src = store.imagePath
    } else if (store.mode.spine || store.mode.dragon) {
        elementStyleById([
            ["pet", "display", "none"],
            ["spine", "display", "block"]
        ])
    }
}

const eventListener = async (API) => {
    try {
        const [taskBarX, taskBarHeight] = await API.invoke('get-taskbar')
        let isDrag = false
        let isMove = false
        let [startX, startY, originWidth, originHeight, newX, newY] = [0, 0, 0, 0]

        API.invoke('get-bounds').then(bounds => {
            [originWidth, originHeight] = [bounds.width, bounds.height]
        })

        const handleMouseDown = (event) => {
            if (event.button === 0 && !isLock) {
                API.send('close-options')
                isDrag = true
                API.invoke('get-bounds').then(bounds => {
                    [startX, startY] = [event.screenX - bounds.x, event.screenY - bounds.y]
                })
                window.addEventListener('mousemove', handleMouseMove)
                isMove = true
            }
        }

        const handleMouseMove = (event) => {
            if (isDrag) {
                [newX, newY] = [event.screenX - startX, event.screenY - startY]
                API.send('set-bounds', {
                    x: newX,
                    y: newY,
                    width: originWidth,
                    height: originHeight,
                })
                if (isMove && store.mode.spine) {
                    window.tools.setModelAnime(0, store.spineSelectedAnime[1], true)
                    isMove = false
                }
            }

        }

        const handelMouseUp = (event) => {
            if (event.button === 0 && !isLock) {
                isDrag = false
                let bounds = {
                    x: newX,
                    y: newY
                }
                if (newY + originHeight > taskBarX) {
                    newY = taskBarX - originHeight
                    bounds = {
                        x: newX,
                        y: newY
                    }
                    API.send('set-bounds', bounds)
                }
                API.send('setStore', { name: 'lastPosition', value: bounds })
                if (store.mode.spine) {
                    isMove = false
                    window.tools.setModelAnime(0, store.spineSelectedAnime[0], true)
                }
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseleave', handelMouseLeave)
            } else if (event.button === 2) {
                API.send('open-options')
            }
        }

        const handelMouseLeave = (event) => {
            if (isDrag && store.mode.spine) {
                window.tools.setModelAnime(0, store.spineSelectedAnime[0], true)
                isMove = false
            }
            isDrag = false
        }

        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseleave', handelMouseLeave)
        window.addEventListener('mouseup', handelMouseUp)
    } catch (error) {
        console.log(error.message)
    }
}

const initPosition = async (store) => {
    try {
        window.api.send('set-bounds', store.lastPosition)
    } catch (error) {
        console.log(error.message)
    }
}

export default main



