import drag from './draggable.mjs'
import spines from '../../dragonbones/index.js'
let store

const main = async () => {
    store = await window.api.invoke('getStore')
    await checkMode()
}

const checkMode = async () => {
    try {
        if (store.isInit) {
            if (store.mode.dragon) {
                // window.api.receive('reload-drag', async () => {
                //     await spines(true)
                //     await drag()
                // })
                await spines(true)
                await drag()
            } else if (store.mode.spine) {
                // window.api.receive('reload-drag', async () => {
                //     await window.tools.loadSpine(store.spinePath)
                //     await drag()
                // })
                await window.tools.loadSpine(store.spinePath)
                await drag()
            } else {
                await drag()
            }
            window.api.send('show-main')
        } else {
            window.api.send('open-settings')
            window.api.send('hide-main')
        }

    } catch (error) {
        window.api.send('open-settings')
        window.api.send('hide-main')
        console.log(error.message)
    }


}

main()