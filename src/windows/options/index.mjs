const API = window.api

const main = async () => {
    try {
        ignoreMouse()
        initOptionStatus()
        setOptionStatus()
        const { x: mouseX, y: mouseY } = await API.invoke('mousePosition')
        const { width, height } = await API.invoke('get-options-bounds')
        const [computedX, computedY] = [mouseX, mouseY - height]
        API.send('set-options-bounds', {
            x: computedX,
            y: computedY
        })
        API.send('mouse-ignore', true)
    } catch (error) {
        console.log(error.message)
    }
}

const ignoreMouse = () => {
    const ignoreElements = document.querySelectorAll('.ignore')
    Array.from(ignoreElements).forEach(item => {
        item.addEventListener('mousemove', () => { API.send('mouse-ignore', false) })
        item.addEventListener('mouseleave', () => { API.send('mouse-ignore', true) })
    })
}

const setOptionStatus = () => {
    const options = document.querySelectorAll('.option')
    Array.from(options).forEach(item => {
        item.addEventListener('click', function () {
            if (this.dataset.select === "1") {
                if (this.children[0].style.color === 'black') {
                    API.send('send-to-main', [this.id, false])
                    this.children[0].style.color = 'transparent'
                } else {
                    API.send('send-to-main', [this.id, true])
                    this.children[0].style.color = 'black'
                }
            }
            if(this.id === 'option-dev'){
                API.send('open-option-dev')
            }


        })

    })
}

const initOptionStatus = async () => {
    const options = document.querySelectorAll('.option')
    const store = await window.api.invoke('getStore')
    Array.from(options).forEach(item => {
        if (item.dataset.select === "1") {
            switch (item.id) {
                case "option-lock":
                    if (store.isLock) {
                        item.children[0].style.color = 'black'
                    }
                    break
                case "option-follow":
                    if (store.isFollow) {
                        item.children[0].style.color = 'black'
                    }
                    break
            }
        }
    })
}

main()