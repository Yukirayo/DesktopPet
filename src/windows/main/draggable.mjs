import { elementStyleById } from '../../tools/elementHandler.mjs'

let isLock = false
let isFollow = false

window.api.on('option-lock', (event,bool) => {
    isLock = bool
    console.log('lock')
    window.api.send('setStore',{
        name: 'isLock',
        value: bool
    })
})

window.api.on('option-follow', (event,bool) => {
    isFollow = bool
    console.log('follow')
    window.api.send('setStore',{
        name: 'isFollow',
        value: bool
    })
})

const main = async () => {
    const pet = document.querySelector('#pet')
    const API = window.api
    const store = await API.invoke('getStore')
    initPosition(store)
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
                    y: newY,
                    width: originWidth,
                    height: originHeight,
                }
                if (newY + originHeight > taskBarX) {
                    newY = taskBarX - originHeight
                    bounds = {
                        x: newX,
                        y: newY,
                        width: originWidth,
                        height: originHeight,
                    }
                    API.send('set-bounds', bounds)
                }
                API.send('setStore',{ name: 'lastPosition', value: bounds })
                if (store.mode.spine) {
                    isMove = false
                    window.tools.setModelAnime(0, store.spineSelectedAnime[0], true)
                }
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseleave', handelMouseLeave)
            } else {
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
        API.send('log', error.message)
    }

}

const initPosition = async (store) => {
    window.api.send('set-bounds', store.lastPosition)
}

export default main



