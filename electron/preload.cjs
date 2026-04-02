const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ProjectScanner', {
    pickProjectFolder: () => ipcRenderer.invoke('pick-project-folder'),
    scanProjectAssets: (path) => ipcRenderer.invoke('scan-project-assets', path),
    createFolder: (path) => ipcRenderer.invoke('create-folder', path),
    createFile: (path, content) => ipcRenderer.invoke('create-file', path, content),
    readFile: (path) => ipcRenderer.invoke('read-file', path),
    renameAsset: (oldPath, newPath) => ipcRenderer.invoke('rename-asset', oldPath, newPath),
    deleteAsset: (path) => ipcRenderer.invoke('delete-asset', path),
    saveFile: (path, content) => ipcRenderer.invoke('save-file', path, content)
});

contextBridge.exposeInMainWorld('windowControls', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close')
});
