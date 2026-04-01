const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ProjectScanner', {
    pickProjectFolder: () => ipcRenderer.invoke('pick-project-folder')
});

contextBridge.exposeInMainWorld('windowControls', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close')
});
