/**
 * Electron Main Process
 * VibeEngine - Desktop Application with Splash Screen
 */

const { app, BrowserWindow, Menu, shell, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// 🌊 VibeEngine Hot Reload: Auto-restart Main Process on change
if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

let activeProjectPath = '';

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

// ─── FileSystem Operations ───────────────────────────────────────────────────

ipcMain.handle('create-folder', async (event, folderPath) => {
    try {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
            return { success: true };
        }
        return { success: false, error: 'Folder already exists' };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle('create-file', async (event, filePath, content = '') => {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, content);
            return { success: true };
        }
        return { success: false, error: 'File already exists' };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle('rename-asset', async (event, oldPath, newPath) => {
    try {
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            return { success: true };
        }
        return { success: false, error: 'Source not found' };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle('read-file', async (event, filePath) => {
    console.log(`[IPC] read-file: ${filePath}`);
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            console.log(`[IPC] read-file success: ${content.length} chars`);
            return { success: true, content };
        }
        console.error(`[IPC] read-file failed: Not found at ${filePath}`);
        return { success: false, error: 'File not found' };
    } catch (e) {
        console.error(`[IPC] read-file error: ${e.message}`);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('save-file', async (event, filePath, content) => {
    console.log(`[IPC] save-file: ${filePath}`);
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true };
    } catch (e) {
        console.error(`[IPC] save-file failed: ${e.message}`);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('delete-asset', async (event, assetPath) => {
    try {
        if (fs.existsSync(assetPath)) {
            await shell.trashItem(assetPath);
            return { success: true };
        }
        return { success: false, error: 'File not found' };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// ─── Build Services ──────────────────────────────────────────────────────────

ipcMain.handle('copy-folder', async (event, src, dest) => {
    try {
        if (!fs.existsSync(src)) return { success: false, error: 'Source not found' };
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

        const copyRecursive = (source, destination) => {
            const files = fs.readdirSync(source);
            for (const file of files) {
                const curSource = path.join(source, file);
                const curDest = path.join(destination, file);
                if (fs.lstatSync(curSource).isDirectory()) {
                    if (!fs.existsSync(curDest)) fs.mkdirSync(curDest);
                    copyRecursive(curSource, curDest);
                } else {
                    fs.copyFileSync(curSource, curDest);
                }
            }
        };

        copyRecursive(src, dest);
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle('run-command', async (event, command, cwd) => {
    return new Promise((resolve) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, error: error.message, stderr });
                return;
            }
            resolve({ success: true, stdout, stderr });
        });
    });
});

// ─── Project Management ──────────────────────────────────────────────────────

ipcMain.handle('set-active-project', async (event, projectPath) => {
    console.log(`💎 VIBEENGINE: Active Project Workspace set to ${projectPath}`);
    activeProjectPath = projectPath;
    return { success: true };
});

ipcMain.handle('get-app-path', () => {
    return app.getAppPath();
});

ipcMain.handle('pick-project-folder', async (event, options = {}) => {
    const dialogOptions = {
        title: options.title || 'Select a project folder',
        properties: ['openDirectory', 'createDirectory'],
        defaultPath: options.defaultPath || undefined
    };

    const { canceled, filePaths } = await require('electron').dialog.showOpenDialog(dialogOptions);

    if (canceled || filePaths.length === 0) {
        return null;
    }

    return readProjectInfo(filePaths[0]);
});

ipcMain.handle('list-projects', async (event, projectsPath) => {
    try {
        if (!projectsPath) {
            projectsPath = path.join(app.getAppPath(), 'projects');
        }

        if (!fs.existsSync(projectsPath)) {
            fs.mkdirSync(projectsPath, { recursive: true });
            return [];
        }

        const entries = fs.readdirSync(projectsPath, { withFileTypes: true });
        const projects = [];

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const fullPath = path.join(projectsPath, entry.name);
                // Basic validation: must have project-data.json or package.json
                const hasProjectData = fs.existsSync(path.join(fullPath, 'project-data.json'));
                const hasPackageJson = fs.existsSync(path.join(fullPath, 'package.json'));
                const hasDomain = fs.existsSync(path.join(fullPath, 'src', 'domain'));

                if (hasProjectData || hasPackageJson || hasDomain) {
                    projects.push(readProjectInfo(fullPath));
                }
            }
        }

        return projects;
    } catch (e) {
        console.error('List projects error:', e);
        return [];
    }
});

ipcMain.handle('scan-project-assets', async (event, projectPath) => {
    let scanPath = path.join(projectPath, 'src');
    if (!fs.existsSync(scanPath)) {
        scanPath = projectPath;
    }

    const assets = [];
    const scan = (dir, parentId = null) => {
        const skip = ['node_modules', '.git', '.vscode', '.idea', 'dist', 'build', 'electron'];
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            if (skip.includes(file) || file.startsWith('.')) continue;

            const fullPath = path.join(dir, file);
            const stats = fs.statSync(fullPath);
            const id = Math.random().toString(36).substr(2, 9);
            
            if (stats.isDirectory()) {
                assets.push({
                    id,
                    name: file,
                    path: fullPath,
                    type: 'folder',
                    parentId,
                    size: 0
                });
                scan(fullPath, id);
            } else {
                const ext = path.extname(file).toLowerCase();
                let type = 'other';
                if (['.glb', '.gltf', '.obj'].includes(ext)) type = 'model';
                else if (['.ts', '.tsx', '.js'].includes(ext)) type = 'script';
                else if (['.png', '.jpg', '.jpeg'].includes(ext)) type = 'texture';
                else if (['.mp3', '.wav', '.ogg'].includes(ext)) type = 'audio';
                
                if (type === 'other' && !['.json', '.md', '.txt'].includes(ext)) continue;

                assets.push({
                    id,
                    name: file,
                    path: fullPath,
                    type,
                    parentId,
                    size: stats.size,
                    extension: ext
                });
            }
        }
    };

    try {
        console.log(`🔍 Deep scanning assets in: ${scanPath}`);
        scan(scanPath);
        console.log(`✅ Hierarchy built: ${assets.length} items.`);
        return assets;
    } catch (e) {
        console.error('Scan error:', e);
        return [];
    }
});

// ─── Live Scene Capture (Runtime Exporter) ───────────────────────────────────

ipcMain.handle('capture-scene', async (event, url) => {
    console.log(`📸 VIBEENGINE: Capturing scene from ${url}...`);
    
    const captureWin = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false
        }
    });

    try {
        await captureWin.loadURL(url);
        
        // Wait for page to fully load
        await captureWin.webContents.executeJavaScript(`
            new Promise((resolve) => {
                if (document.readyState === 'complete') resolve('ready');
                else window.addEventListener('load', () => resolve('ready'));
            })
        `);
        
        // Additional wait for game init
        await new Promise(r => setTimeout(r, 3000));
        
        const sceneData = await captureWin.webContents.executeJavaScript(`
            new Promise((resolve) => {
                let attempts = 0;
                const maxAttempts = 100;
                const check = () => {
                    attempts++;
                    
                    const scene = window.scene 
                        || window.gameScene 
                        || (window.application && window.application.scene)
                        || (window.game && window.game.scene);
                    
                    if (!scene) {
                        if (attempts < maxAttempts) {
                            setTimeout(check, 300);
                        } else {
                            resolve({ error: 'No scene found after ' + maxAttempts + ' attempts' });
                        }
                        return;
                    }
                    
                    const children = scene.children || [];
                    if (children.length === 0 && attempts < maxAttempts) {
                        setTimeout(check, 300);
                        return;
                    }
                    
                    console.log('✅ Found scene with ' + children.length + ' children');
                    
                    const entities = [];
                    const rootEntityIds = [];
                    let nextId = 1;

                    const processNode = (node, parentId) => {
                        const id = nextId++;
                        const name = node.name || (node.type + '_' + id);
                        
                        if (node.isLight) return;
                        if (node.name === 'grid' || node.name === 'axes') return;
                        if (node.name === 'ambientLight' || node.name === 'directionalLight') return;
                        
                        const isMesh = node.isMesh;
                        const isGroup = node.isGroup || node.type === 'Group';

                        if (!isMesh && !isGroup) {
                            if (node.children) {
                                for (let i = 0; i < node.children.length; i++) {
                                    processNode(node.children[i], id);
                                }
                            }
                            return;
                        }

                        const components = [
                            {
                                type: 'Transform',
                                data: {
                                    position: [
                                        parseFloat(node.position.x.toFixed(3)),
                                        parseFloat(node.position.y.toFixed(3)),
                                        parseFloat(node.position.z.toFixed(3))
                                    ],
                                    rotation: [
                                        parseFloat((node.rotation.x * 180 / Math.PI).toFixed(2)),
                                        parseFloat((node.rotation.y * 180 / Math.PI).toFixed(2)),
                                        parseFloat((node.rotation.z * 180 / Math.PI).toFixed(2))
                                    ],
                                    scale: [
                                        parseFloat(node.scale.x.toFixed(3)),
                                        parseFloat(node.scale.y.toFixed(3)),
                                        parseFloat(node.scale.z.toFixed(3))
                                    ]
                                },
                                enabled: true
                            }
                        ];

                        if (isMesh) {
                            let modelPath = node.userData && node.userData.modelPath;
                            if (!modelPath) {
                                const lowerName = name.toLowerCase();
                                if (lowerName.includes('building')) modelPath = 'assets/models/environment/buildings/' + name.split('_')[0] + '.glb';
                                else if (lowerName.includes('road')) modelPath = 'assets/models/environment/roads/road-straight.glb';
                                else if (lowerName.includes('fence')) modelPath = 'assets/models/environment/fences/fence.glb';
                                else if (lowerName.includes('tree')) modelPath = 'assets/models/environment/trees/tree-small.glb';
                                else if (lowerName.includes('light')) modelPath = 'assets/models/environment/roads/light-square.glb';
                            }

                            components.push({
                                type: 'Render',
                                data: {
                                    meshType: modelPath ? 'model' : 'cube',
                                    modelPath: modelPath || '',
                                    color: '#ffffff'
                                },
                                enabled: true
                            });
                        }

                        const entity = {
                            id,
                            name,
                            parentId: parentId || null,
                            children: [],
                            components,
                            enabled: true,
                            tags: [node.type.toLowerCase()]
                        };

                        entities.push(entity);

                        if (parentId === null || parentId === undefined) {
                            rootEntityIds.push(id);
                        } else {
                            for (let i = 0; i < entities.length; i++) {
                                if (entities[i].id === parentId) {
                                    entities[i].children.push(id);
                                    break;
                                }
                            }
                        }

                        if (node.children) {
                            for (let i = 0; i < node.children.length; i++) {
                                processNode(node.children[i], id);
                            }
                        }
                    };

                    for (let i = 0; i < children.length; i++) {
                        processNode(children[i], null);
                    }
                    
                    resolve({ entities, rootEntityIds, count: entities.length });
                };
                check();
            });
        `);

        captureWin.close();
        if (sceneData.error) {
            console.error('Capture failed:', sceneData.error);
            return { success: false, error: sceneData.error };
        }

        console.log(`✅ Capture SUCCESS: ${sceneData.entities.length} entities found.`);
        return { success: true, data: sceneData };
    } catch (e) {
        console.error('Capture error:', e);
        if (captureWin && !captureWin.isDestroyed()) captureWin.close();
        return { success: false, error: e.message };
    }
});

console.log('💎 VIBEENGINE ANALYTICS: IPC HANDLERS READY');

// ─── Window Management ───────────────────────────────────────────────────────

ipcMain.on('window-minimize', () => { if(mainWindow) mainWindow.minimize() });
ipcMain.on('window-maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
});
ipcMain.on('window-close', () => { if(mainWindow) mainWindow.close() });

// ─── App Lifecycle ───────────────────────────────────────────────────────────

const isDev = !app.isPackaged;

let splashWindow = null;
let mainWindow = null;

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 300,
        height: 300,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        center: true,
        resizable: false,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

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
        frame: false,
        icon: path.join(__dirname, '../assets/icon1.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
        backgroundColor: '#050508',
        show: false
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173/editor.html');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/editor.html'));
    }

    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            if (splashWindow) {
                splashWindow.close();
                splashWindow = null;
            }
            mainWindow.show();
            mainWindow.focus();
        }, 10000);
    });

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

    Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(null);
    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function sendToRenderer(channel, data) {
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send(channel, data);
    }
}

app.whenReady().then(() => {
    protocol.registerFileProtocol('vibe-asset', (request, callback) => {
        const url = request.url.replace('vibe-asset://', '');
        const decodedUrl = decodeURI(url);
        
        try {
            if (fs.existsSync(decodedUrl)) {
                return callback({ path: decodedUrl });
            }
            
            if (activeProjectPath) {
                const publicPath = path.join(activeProjectPath, 'public', 'assets', decodedUrl);
                if (fs.existsSync(publicPath)) {
                    return callback({ path: publicPath });
                }
                
                const rootPath = path.join(activeProjectPath, decodedUrl);
                if (fs.existsSync(rootPath)) {
                    return callback({ path: rootPath });
                }
            }
        } catch (e) {
            console.error('Protocol error:', e);
        }
        
        callback({ error: -6 });
    });

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
