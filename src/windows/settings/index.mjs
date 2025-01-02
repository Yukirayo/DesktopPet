const modes = document.getElementsByName('mode')
const settings = document.getElementById('title')
const selectInput = document.querySelector(".select-input")
const modelSize = document.querySelector(".model-size")
const API = window.api

let store
let modelPath
let mode
let animeList
let animeArr


const main = async () => {
    try {
        store = await window.api.invoke('getStore')
        document.querySelector(".select").addEventListener('click', selectFile)
        document.querySelector('.cancel').addEventListener('click', cancelOptions)
        updateRange()
        validateForm()
        pathType(store.mode)
        checkMode(store.mode)
        await handleModeClick()
        initSelectedAnime()
        modes.forEach(item => {
            item.removeEventListener('click', handleModeClick)
        })
        modes.forEach(item => {
            item.addEventListener('click', handleModeClick)
        })
    } catch (error) {
        console.log(error.message)
    }


}
main()

const updateRange = async () => {
    try {
        const rangeValue = document.getElementById('range-value')
        const modelRange = document.getElementById('model-range')
        rangeValue.innerText = store.modelSize || 0.5
        modelRange.value = +store.modelSize || +0.5
        modelRange.addEventListener('input', e => {
            rangeValue.innerText = e.target.value
        })
    } catch (error) {
        console.log(error.message)
    }

}

const pathType = async (mode) => {
    try {
        if (mode.spine) {
            modelPath = store.spinePath || ''
        }else if (mode.image) {
            modelPath = store.imagePath || ''
        } else {
            modelPath = ''
        }
        selectInput.value = modelPath
    } catch (error) {
        console.log(error.message)
    }

}

const handleModeClick = async () => {
    try {
        const option = getMode()
        switch (option) {
            case "1":
                mode = { spine: true, dragon: false, image: false }
                await updateAnimeList()
                modelSize.style.display = 'block'
                break
            case "2":
                mode = { spine: false, dragon: true, image: false }
                modelSize.style.display = 'none'
                document.querySelectorAll('.spine-animeListDiv').forEach(item => item.style.display = 'none')
                break
            case "3":
                mode = { spine: false, dragon: false, image: true }
                modelSize.style.display = 'none'
                document.querySelectorAll('.spine-animeListDiv').forEach(item => item.style.display = 'none')
                break
            default:
                mode = { spine: true, dragon: false, image: false }
                modelSize.style.display = 'block'
                document.querySelectorAll('.spine-animeListDiv').forEach(item => item.style.display = 'block')
        }
        pathType(mode)
    } catch (error) {
        console.log(error.message)
    }


}

const submitMode = async () => {
    try {
        const modelRange = document.getElementById('model-range')
        window.api.send('setStore', { name: 'modelSize', value: modelRange.value })
        window.api.send('setStore', { name: 'spineSelectedAnime', value: animeArr })
        window.api.send('setStore', { name: "mode", value: mode })
    } catch (error) {
        console.log(error.message)
    }

}

const getMode = () => {
    try {
        for (let i = 0; i < modes.length; i++) {
            if (modes[i].checked) {
                return modes[i].dataset.mode
            }
        }
        return null
    } catch (error) {
        console.log(error.message)
    }

}

const changeMode = async (name) => {
    try {
        const ele = document.getElementById(name)
        ele.checked = true
    } catch (error) {
        console.log(error.message)
    }
}

const checkMode = async (mode, path) => {
    try {
        if (mode.spine) {
            await changeMode("mode1")
        } else if (mode.dragon) {
            await changeMode("mode2")
        } else if (mode.image) {
            await changeMode("mode3")
        } else {
            console.log("error")
        }
    } catch (error) {
        console.log(error.message)
    }

}

const savePath = async () => {
    try {
        if (mode.spine) {
            await window.api.send('setStore', { name: "spinePath", value: modelPath })
        } else if (mode.dragon) {
            await window.api.send('setStore', { name: "dragonPath", value: modelPath })
        } else if (mode.image) {
            await window.api.send('setStore', { name: "imagePath", value: modelPath })
        }
    } catch (error) {
        console.log(error.message)
    }

}

const cancelOptions = async () => {
    try {
        await window.api.send('close-settings')
    } catch (error) {
        console.log(error.message)
    }

}

const selectFile = async () => {
    try {
        const file = await window.api.invoke('select-file')
        if (file) {
            selectInput.value = file
            modelPath = file
            savePath()
            if (mode.spine) {
                await updateAnimeList(true)
            }
        }
    } catch (error) {
        console.log(error.message)
    }


}

const updateAnimeList = async (mustInsert) => {
    try {
        console.log(modelPath)
        await window.tools.getSpineInfo(modelPath)
        const info = await window.api.invoke('getStore', 'spineAnimations')
        animeList = info

        const animeListDiv = document.querySelectorAll('.spine-animeListDiv')
        const animeListSelect = document.querySelectorAll('.animeList')

        animeListDiv.forEach(item => item.style.display = 'block')
        animeListSelect.forEach(select => {
            if (select.children.length === 0 || mustInsert) {
                if (mustInsert) {
                    select.innerHTML = ''
                }
                animeList.forEach(item => {
                    select.insertAdjacentHTML('beforeend', `<option value="${item}">${item}</option>`)
                })
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

const saveSelectedAnime = async () => {
    try {
        const elements = document.querySelectorAll('.animeList')
        elements.forEach(item => {
            let index = item.selectedIndex
            let options = item.options
            if (item.id === "normal-anime") {
                animeArr[0] = options[index].value
            } else if (item.id === "drag-anime") {
                animeArr[1] = options[index].value
            }
        })
    } catch (error) {
        console.log(error.message)
    }

}

const initSelectedAnime = async () => {
    try {
        const animeListSelect = document.querySelectorAll('.animeList')
        animeArr = store.spineSelectedAnime || [null, null]
        animeListSelect.forEach(select => {
            for (const option of select.options) {
                if (option.value === animeArr[0] && select.id === "normal-anime") {
                    option.selected = true
                } else if (option.value === animeArr[1] && select.id === "drag-anime") {
                    option.selected = true
                }
            }
        })
    } catch (error) {
        console.log(error.message)
    }

}

const validateForm = () => {
    const form = document.querySelector(".needs-validation")

    form.addEventListener('submit', event => {
        if(!form.checkValidity()){
            event.preventDefault()
            event.stopPropagation()
        } else {
            applyOptions()
        }
        
        form.classList.add('was-validated')

    },false)
}

const applyOptions = async () => {
    try {
        await saveSelectedAnime()
        submitMode()
        await window.api.send('close-settings')
        await window.api.send('reload-main')
    } catch (error) {
        console.log(error.message)
    }
}
