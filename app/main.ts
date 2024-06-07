import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let setupWindow: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

function createSetupWindow(): BrowserWindow {
  setupWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
    frame: true,
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    setupWindow.loadURL('http://localhost:4200/#/home');
  } else {
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex + '#/home'));
    setupWindow.loadURL(url.href);
  }

  setupWindow.on('closed', () => {
    setupWindow = null;
  });

  return setupWindow;
}

function createMainWindow(): BrowserWindow {
  const size = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
    frame: true,
  });

  if (serve) {
    mainWindow.loadURL('http://localhost:4200/#/detail');
  } else {
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex + '#/detail'));
    mainWindow.loadURL(url.href);
  }

  // Set the window to the bottom right corner
  mainWindow.setPosition(size.width - 400, size.height - 500);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

app.on('ready', () => createSetupWindow());

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null && setupWindow === null) {
    createSetupWindow();
  }
});

ipcMain.on('setup-complete', (event) => {
  if (setupWindow) {
    setupWindow.close();
  }
  createMainWindow();
});
