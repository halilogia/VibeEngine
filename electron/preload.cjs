const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ProjectScanner', {
    pickProjectFolder: () => ipcRenderer.invoke('pick-project-folder')
});
