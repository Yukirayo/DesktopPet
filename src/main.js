import { app, BrowserWindow, ipcMain, screen, Tray, Menu, dialog } from 'electron'
import path from 'path'
import Store from 'electron-store'
import { isNil } from 'lodash'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const iconPath = path.join(__dirname, "../data/icon.png")
const store = new Store()
if (!store.get('isInit')) store.set('isInit', false)

const checkInitStore = () => {
    const valStore = store.get()
    const isInitialized = Boolean(valStore.mode && valStore.modelSize && valStore.spineSelectedAnime && valStore.spinePath)

    return isInitialized
}

if (!checkInitStore()) {
    store.set('isInit', false)
}

let tray
let mainWindow
let selectWin
let optionWin
app.whenReady().then(() => {
    initMainWindow()
    loadMenu()
    ipcList()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            initMainWindow()
        }
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('before-quit', async () => {
        if (checkInitStore()) {
            store.set('isInit', true)
        }
    })
})

const initMainWindow = async () => {
    mainWindow = new BrowserWindow({
        // width: 220,
        // height: 220,
        icon: iconPath,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        show: false,
        webPreferences: {
            sandbox: false,
            preload: path.resolve(__dirname, 'preload/index.mjs'),
            nodeIntegration: false,
            contextIsolation: true
        },
    })

    mainWindow.loadFile(path.join(__dirname, 'windows/main/index.html'))
    mainWindow.setSkipTaskbar(true)
    // mainWindow.webContents.openDevTools()
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

const initSettingsWindow = async () => {
    selectWin = new BrowserWindow({
        width: 400,
        height: 600,
        resizable: false,
        parent: mainWindow,
        icon: iconPath,
        frame: false,
        // modal: true,
        modal: true,
        show: false,
        webPreferences: {
            sandbox: false,
            preload: path.join(__dirname, "preload/index.mjs"),
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    selectWin.center()

    selectWin.loadFile(path.join(__dirname, 'windows/settings/index.html'))
    // selectWin.webContents.openDevTools()
    selectWin.on('closed', () => {
        selectWin = null
    })
    selectWin.once('ready-to-show', () => {
        selectWin.show()
    })
}

const initOptionsWindow = () => {
    optionWin = new BrowserWindow({
        width: 200,
        height: 300,
        resizable: false,
        transparent: true,
        parent: mainWindow,
        icon: iconPath,
        frame: false,
        show: false,
        webPreferences: {
            sandbox: false,
            preload: path.join(__dirname, "preload/index.mjs"),
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    optionWin.loadFile(path.join(__dirname, 'windows/options/index.html'))
    optionWin.on('closed', () => {
        optionWin = null
    })
    optionWin.on('blur',() => {
        optionWin.close()
    })
    optionWin.once('ready-to-show', () => {
        optionWin.show()
    })
}

const ipcList = () => {
    ipcMain.on('quit', () => {
        quit()
    })

    ipcMain.on('log', (event, message) => {
        console.log(`[RendererLog] => ${message}`)
    })

    ipcMain.handle('get-bounds', () => {
        return mainWindow.getBounds()
    })

    ipcMain.on('set-bounds', (event, bounds) => {
        mainWindow.setBounds(bounds)
        if(optionWin) optionWin.setBounds(bounds)
    })

    ipcMain.on('open-option-dev',() => {
        optionWin.webContents.openDevTools()
    })

    ipcMain.handle('get-settings-bounds', () => {
        return selectWin.getBounds()
    })

    ipcMain.on('set-settings-bounds', (event, bounds) => {
        selectWin.setBounds(bounds)
    })

    ipcMain.handle('get-options-bounds', () => {
        return optionWin.getBounds()
    })

    ipcMain.on('set-options-bounds', (event, bounds) => {
        optionWin.setBounds(bounds)
    })

    ipcMain.handle('mousePosition', () => {
        return screen.getCursorScreenPoint()
    })

    ipcMain.on('send-to-main',(event,message) => {
        if(mainWindow){
            mainWindow.webContents.send(message[0],message[1])
        }
    })

    ipcMain.handle('get-taskbar', () => {
        const display = screen.getPrimaryDisplay()

        return [display.workAreaSize.height, display.size.height - display.workAreaSize.height]
    })

    ipcMain.handle('get-window', () => {
        return mainWindow
    })

    ipcMain.on('setStore', (event, options) => {
        if (isNil(options.value)) return
        store.set(options.name, options.value)
    })

    ipcMain.handle('getStore', (event, key) => {
        if (key) {
            return store.get(key)
        }
        return store.get()
    })

    ipcMain.on('close-settings', () => selectWin.close())
    ipcMain.on('close-options', () => {
        
    if (optionWin) {
        optionWin.hide()
        optionWin.close()
    }
    })

    ipcMain.on('show-main', () => {
        if (mainWindow) mainWindow.show()
    })

    ipcMain.on('hide-main', () => {
        if (mainWindow) mainWindow.hide()
    })

    ipcMain.on('reload-main', async () => {
        reloadMain()
    })

    ipcMain.on('open-settings', openSettings)
    ipcMain.on('open-options', openOptions)

    // ipcMain.on('option-lock', () => {
    //     console.log(1)
    // })
    ipcMain.on('option-follow', () => {
        console.log(1)
    })
    ipcMain.on('option-side', () => {
        console.log(1)
    })
    ipcMain.on('option-hide', () => {
        console.log(1)
    })
    ipcMain.on('option-quit', () => {
        quit()
    })

    ipcMain.on('mouse-ignore', (event, bool) => {
        optionWin.setIgnoreMouseEvents(bool,{ forward: true })
    })

    ipcMain.handle('select-file', async () => {
        const result = await dialog.showOpenDialog({
            title: '选择模型',
            buttonLabel: '选择',
            properties: ['openFile'],
            filters: [
                { name: '模型/图片文件', extensions: ['json', 'png', 'jpg', 'webp', 'gif', 'jpeg', 'skel'] }
            ],
        })

        if (!result.canceled) {
            return result.filePaths[0]
        }

        return null
    })
}

const reloadMain = () => {
    if (checkInitStore()) {
        store.set('isInit', true)
    }
    mainWindow.hide()
    mainWindow.webContents.reload()
}

const openSettings = () => {
    if (!selectWin) {
        initSettingsWindow()
    } else {
        selectWin.focus()
    }
}

const openOptions = () => {
    if (!optionWin) {
        initOptionsWindow()
    } else {
        optionWin.focus()
    }
}

const loadMenu = async () => {
    tray = new Tray(iconPath)

    const menu = Menu.buildFromTemplate([
        {
            label: "设置",
            click: () => {
                openSettings()
            }
        },
        // {
        //     label: "重载main",
        //     click: () => {
        //         reloadMain()
        //     }
        // },
        {
            type: "separator"
        },
        {
            label: "退出",
            click: () => {
                quit()
            }
        }
    ])

    tray.setContextMenu(menu)

    tray.setToolTip("我的桌宠")

    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide()
        } else {
            mainWindow.show()
        }
    })
}



const checkWindow = (win, html) => {
    try {
        if (win && !win.closed) {
            win.focus()
        } else {
            win.loadFile(html)
            win.webContents.openDevTools()
            win.show()
        }
    } catch (error) {
        console.log(error.message)
    }

}

const quit = () => {
    if (selectWin) {
        selectWin.close()
    }
    mainWindow.close()
}
