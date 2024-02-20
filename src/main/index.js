import { app, shell, BrowserWindow, ipcMain, nativeImage, Tray, MenuItem, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let tray

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '.../preload/index.js'),
      sandbox: false
    }
  })

  setInterVal( () => {
    const cpuUsage = process.getCPUUsage()
    mainWindow.webContents.send('cpu-usage', cpuUsage)
  }, 1000)
}

mainWindow.webContents.openDevTools()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  const icon = nativeImage.createFromDataURL();
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate( [
	  {
	    label: 'electron 공식사이트 이동',
	    type: 'normal',
	    click: async (): Promise<void> => {
	      const { shell } = require('electron')
	      await shell.openExternal('https://electronjs.org')
	    }
	  },
	  { label: 'item2', type: 'normal' },
	  { label: 'item3', type: 'normal' }
	])

	tray.setToolTip('이것은 나의 electron입니다.')
	tray.setContextMenu(contextMenu)

  const menu = new Menu()
  menu.append(
    new MenuItem({
      label: app.name, 
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
        ]
    })
  )

  menu.append(
    new MenuItem({
    label: '수정', 
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteAndMathchStyle' },
      { role: 'delete' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
         label: 'Speech',
         submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
      }
    ]
  })
)
  menu.append(
    new MenuItem({
      label: 'help',
      submenu: [
        {
	label: 'electron 공식 사이트 이동',
	click: async (): Promise<void> => {
	  const { shell } = require('electron')
	  await shell.openExternal('https://electronjs.org')
	}
        }
      ]
    })
  )
  Menu.setApplicationMenu(menu)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
