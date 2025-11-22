const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getHomeDir: () => ipcRenderer.invoke('get-home-dir'),
  checkDirExists: (path) => ipcRenderer.invoke('check-dir-exists', path),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  readDir: (path) => ipcRenderer.invoke('read-dir', path),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', path, content),
  joinPath: (...args) => ipcRenderer.invoke('join-path', ...args),
});
