const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ProjectScanner', {
    pickProjectFolder: () => ipcRenderer.invoke('pick-project-folder'),
    scanProjectAssets: (path) => ipcRenderer.invoke('scan-project-assets', path)
});

contextBridge.exposeInMainWorld('windowControls', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close')
});
