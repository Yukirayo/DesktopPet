
export default async function main(isRun) {
    try {
        const app = new PIXI.Application(200, 200, {
            view: document.getElementById("spine"),
            transparent: true
        })

        if (isRun) {
            PIXI.loader.resources = {}
        }

        await loadModel(app, 0.9)

    } catch (error) {
        window.api.send('log', error.message)
    }
}

const loadModel = async (app, size) => {
    try {
        PIXI.loader
            .add("../data/spines/Kanade_Ver3/Kanade_Ver3_ske.json")
            .add("../data/spines/Kanade_Ver3/Kanade_Ver3_tex.json")
            .add("../data/spines/Kanade_Ver3/Kanade_Ver3_tex.png")
            .load((loader, resource) => {
                const fac = new dragonBones.PixiFactory()
                const Skeleton = resource["../data/spines/Kanade_Ver3/Kanade_Ver3_ske.json"].data
                fac.parseDragonBonesData(Skeleton)
                fac.parseTextureAtlasData(
                    resource["../data/spines/Kanade_Ver3/Kanade_Ver3_tex.json"].data,
                    resource["../data/spines/Kanade_Ver3/Kanade_Ver3_tex.png"].texture
                )

                const display = fac.buildArmatureDisplay(Skeleton.armature[0].name)
                display.scale.set(size, size)

                const stageWidth = app.view.width
                const stageHeight = app.view.height
                display.x = stageWidth / 2
                display.y = stageHeight

                display.animation.play('standing', 0)
                app.stage.addChild(display)
                showOrigin(app, [display.x, display.y],false)
            })
    } catch (error) {
        window.api.send('log', error.message)
    }

}

const showOrigin = (app, position, isShow) => {
    if (isShow) {
        let anchorPoint = new PIXI.Graphics()
        anchorPoint.beginFill(0xFFFFFF)
        anchorPoint.drawCircle(0, 0, 2)
        anchorPoint.endFill()
        anchorPoint.x = position[0], anchorPoint.y = position[1]
        app.stage.addChild(anchorPoint)
    }
}
