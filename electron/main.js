const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const serve = require('electron-serve');
const fs = require('fs');

const appServe = app.isPackaged ? serve({ directory: path.join(__dirname, '../out') }) : null;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL('app://-');
    });
  } else {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
    win.webContents.on('did-fail-load', (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }
};

app.on('ready', () => {
  createWindow();

  ipcMain.handle('get-home-dir', () => {
    return app.getPath('home');
  });

  ipcMain.handle('check-dir-exists', async (event, dirPath) => {
    try {
      await fs.promises.access(dirPath);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (result.canceled) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('read-dir', async (event, dirPath) => {
    try {
      return await fs.promises.readdir(dirPath);
    } catch (error) {
      console.error('Error reading directory:', error);
      return [];
    }
  });

  ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
      await fs.promises.writeFile(filePath, content, 'utf-8');
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      return false;
    }
  });

  ipcMain.handle('join-path', async (event, ...args) => {
    return path.join(...args);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
