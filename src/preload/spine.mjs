import { ipcRenderer } from 'electron'
import { Assets, Application } from 'pixi.js'
import { Spine } from 'pixi-spine'

let app = null
let spineModel = null
let modelData = null

export const loadSpine = async (path, store) => {
    try {
        const anime = await ipcRenderer.invoke('getStore', 'spineSelectedAnime')
        const { modelSize: size } = store

        if (!app) {
            app = new Application({
                view: document.getElementById("spine"),
                transparent: true,
                backgroundAlpha: 0,
                resizeTo: window
            })
        }

        if (spineModel) spineModel.destroy(true)

        const manifest = {
            bundles: [
                {
                    name: "model",
                    assets: [
                        {
                            name: "model",
                            srcs: path,
                        }
                    ]
                }
            ]
        }
        await Assets.init({ manifest })

        await Assets.loadBundle(["model"])
        modelData = await Assets.get("model")

        spineModel = new Spine(modelData.spineData)
        spineModel.scale.set(size)
        const modelInfo = spineModel.getBounds()
        await ipcRenderer.send('set-bounds', {
            width: modelInfo.width + 20,
            height: modelInfo.height + 20
        })
        const [stageWidth, stageHeight] = [modelInfo.width + 20, modelInfo.height + 20]
        spineModel.position.set(stageWidth / 2, stageHeight)
        spineModel.state.setAnimation(0, anime[0], true)
        app.stage.addChild(spineModel)

    } catch (error) {
        console.log(error.message)
    }

}

export const getSpineInfo = async (path) => {
    try {
        const manifest = {
            bundles: [
                {
                    name: "model",
                    assets: [
                        {
                            name: "model",
                            srcs: path,
                        }
                    ]
                }
            ]
        }
        await Assets.reset()
        await Assets.init({ manifest })
        await Assets.loadBundle(["model"])
        const data = await Assets.get("model")
        ipcRenderer.send('setStore', { name: "spineAnimations", value: data.spineData.animations.map(item => item.name) })
    } catch (error) {
        console.log(error.message)
    }
}

export const setModelAnime = async (index, name, isLoop) => {
    try {
        spineModel.state.setAnimation(index, name, isLoop)
    } catch (error) {
        console.log(error.message)
    }
}