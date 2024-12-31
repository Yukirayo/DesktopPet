let pos
const listener = () => {
    setInterval(async ()=>{
        pos = await window.api.invoke('mousePosition')
    },500)
}

const main = async () => {
    listener()
}

export default main