/**
 * Electron Main Process
 * VibeEngine 🌊 - Desktop Application
 */

const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// Determine if in development
const isDev = !app.isPackaged;

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        title: 'VibeEngine 🌊',
        icon: path.join(__dirname, '../assets/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        backgroundColor: '#1a1a2e',
        show: false
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173/editor.html');
        mainWindow.webContents.openDevTools();
    } else {
        // Load build
        mainWindow.loadFile(path.join(__dirname, '../dist/editor.html'));
    }

    // Show when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Create menu
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                { label: 'New Scene', accelerator: 'CmdOrCtrl+N', click: () => sendToRenderer('new-scene') },
                { label: 'Open...', accelerator: 'CmdOrCtrl+O', click: () => sendToRenderer('open-scene') },
                { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => sendToRenderer('save-scene') },
                { type: 'separator' },
                { label: 'Exit', accelerator: 'Alt+F4', click: () => app.quit() }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', click: () => sendToRenderer('undo') },
                { label: 'Redo', accelerator: 'CmdOrCtrl+Y', click: () => sendToRenderer('redo') },
                { type: 'separator' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Delete', accelerator: 'Delete', click: () => sendToRenderer('delete') }
            ]
        },
        {
            label: 'View',
            submenu: [
                { label: 'Toggle Grid', click: () => sendToRenderer('toggle-grid') },
                { label: 'Toggle Axes', click: () => sendToRenderer('toggle-axes') },
                { type: 'separator' },
                { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: 'Toggle DevTools', accelerator: 'F12', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Documentation',
                    click: () => shell.openExternal('https://github.com/halilogia/vibe-engine')
                },
                { type: 'separator' },
                {
                    label: 'About VibeEngine',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About VibeEngine',
                            message: 'VibeEngine 🌊',
                            detail: 'Version 1.0.0\n\nA TypeScript ECS Game Engine with Visual Editor.\n\nBuilt with Three.js, React, and ❤️'
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function sendToRenderer(channel, data) {
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send(channel, data);
    }
}

// App events
app.whenReady().then(createWindow);

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
