/**
 * Electron Main Process
 * VibeEngine - Desktop Application with Splash Screen
 */

const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function readProjectInfo(projectPath) {
    const projectDataPath = path.join(projectPath, 'project-data.json');
    const packageJsonPath = path.join(projectPath, 'package.json');
    const hasProjectData = fs.existsSync(projectDataPath);
    const hasPackageJson = fs.existsSync(packageJsonPath);
    const hasDomain = fs.existsSync(path.join(projectPath, 'src', 'domain'));
    const name = path.basename(projectPath);

    if (hasProjectData) {
        try {
            const raw = fs.readFileSync(projectDataPath, 'utf-8');
            const projectData = JSON.parse(raw);
            return {
                name: projectData.name || name,
                version: projectData.version || '0.0.0',
                engine: projectData.engine || 'vibe-engine',
                description: projectData.description || '',
                author: projectData.author || '',
                mainScene: projectData.mainScene || 'index',
                path: projectPath,
                hasPackageJson,
                hasDomain
            };
        } catch (error) {
            console.error('Project data parse error:', error);
        }
    }

    return {
        name,
        version: hasPackageJson ? 'package.json' : '0.0.0',
        engine: hasDomain ? 'vibe-engine' : 'unknown',
        description: '',
        author: '',
        mainScene: 'index',
        path: projectPath,
        hasPackageJson,
        hasDomain
    };
}

ipcMain.handle('pick-project-folder', async () => {
    const { canceled, filePaths } = await require('electron').dialog.showOpenDialog({
        title: 'Select a project folder',
        properties: ['openDirectory']
    });

    if (canceled || filePaths.length === 0) {
        return null;
    }

    return readProjectInfo(filePaths[0]);
});

// Determine if in development
const isDev = !app.isPackaged;

let splashWindow = null;
let mainWindow = null;

// Create splash screen first
function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 300,
        height: 300,
        frame: false,           // No window frame
        transparent: true,      // Transparent background
        alwaysOnTop: true,
        center: true,
        resizable: false,
        skipTaskbar: true,      // Don't show in taskbar
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Load splash HTML
    if (isDev) {
        splashWindow.loadURL('http://localhost:5173/splash.html');
    } else {
        splashWindow.loadFile(path.join(__dirname, '../dist/splash.html'));
    }

    splashWindow.once('ready-to-show', () => {
        splashWindow.show();
    });
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        title: 'VibeEngine',
        icon: path.join(__dirname, '../assets/icon1.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
        backgroundColor: '#1a1a2e',
        show: false
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173/editor.html');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/editor.html'));
    }

    // Show main window when ready, close splash
    mainWindow.once('ready-to-show', () => {
        // Wait for splash animation to complete (10 seconds)
        setTimeout(() => {
            if (splashWindow) {
                splashWindow.close();
                splashWindow = null;
            }
            mainWindow.show();
            mainWindow.focus();
        }, 10000);
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
                            message: 'VibeEngine',
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

// App events - Start with splash, then main window
app.whenReady().then(() => {
    createSplashWindow();
    createMainWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
