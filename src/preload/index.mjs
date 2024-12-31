import { contextBridge, ipcRenderer } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSpineInfo, loadSpine, setModelAnime } from './spine.mjs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const store = await ipcRenderer.invoke('getStore')

let spineModel

contextBridge.exposeInMainWorld('api', {
    invokeMethod: (channel, method_) => ipcRenderer.send(channel, method_),
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
    invoke: (channel, args) => ipcRenderer.invoke(channel, args),
    on: (channel, callback) => ipcRenderer.on(channel, callback)
})

contextBridge.exposeInMainWorld('tools', {
    ignoreClick: (app) => ignoreClick(app),
    loadSpine: async path => {
        spineModel = await loadSpine(path,store)
    },
    getSpineInfo: async path => await getSpineInfo(path),
    setModelAnime: (index, name, isLoop) => setModelAnime(index, name, isLoop),
})

