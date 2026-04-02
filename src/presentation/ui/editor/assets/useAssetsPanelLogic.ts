import { useState, useCallback } from 'react';
import { useSceneStore, useEditorStore, type AssetData } from '@infrastructure/store';
import { useProjectStore } from '@infrastructure/store/useProjectStore';
import { ProjectScanner } from '@infrastructure/services/ProjectScanner';

export const useAssetsPanelLogic = () => {
    const { assets, setAssets } = useSceneStore();
    const { launchedProject } = useProjectStore();
    const { 
        setActivePanel,
        setScriptFullScreen,
        openFile,
    } = useEditorStore();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | AssetData['type']>('all');
    const [isScanning, setIsScanning] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; assetId: string } | null>(null);
    const [renamingAssetId, setRenamingAssetId] = useState<string | null>(null);

    const handleScan = useCallback(async () => {
        if (!launchedProject) return;
        setIsScanning(true);
        try {
            const scanned = await ProjectScanner.scanProjectAssets(launchedProject.path);
            if (scanned && scanned.length >= 0) {
                setAssets(scanned);
                console.log(`Manual scan found ${scanned.length} assets.`);
            }
        } catch (e) {
            console.error('Manual scan failed:', e);
        } finally {
            setIsScanning(false);
        }
    }, [launchedProject, setAssets]);

    const filteredAssets = assets
        .filter((asset: any) => {
            const assetParentId = (asset.parentId || null) as string | null;
            const inFolder = assetParentId === currentFolderId;
            const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === 'all' || asset.type === activeFilter;
            return inFolder && matchesSearch && matchesFilter;
        })
        .sort((a: any, b: any) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });

    const createNewScript = async () => {
        if (!launchedProject) return;
        const parentFolder = currentFolderId ? assets.find((a: any) => a.id === currentFolderId) : null;
        let basePath = parentFolder ? parentFolder.path : (launchedProject.path + (launchedProject.hasDomain ? '/src' : ''));
        basePath = basePath.replace(/\\/g, '/');
        const scriptName = `NewScript.ts`;
        const scriptPath = `${basePath}/${scriptName}`;
        const content = `/**\n * ${scriptName} - VibeEngine Script\n */\n\nexport class NewScript {\n    start() {\n        // Code starts here\n    }\n}\n`;
        const result = await ProjectScanner.createFile(scriptPath, content);
        if (result.success) {
            await handleScan();
            setTimeout(() => {
                const newAsset = (window as any).VibeAssets?.find((a: any) => a.path === scriptPath);
                if (newAsset) setRenamingAssetId(newAsset.id);
            }, 300);
        }
    };

    const createNewFolder = async () => {
        if (!launchedProject) return;
        const parentFolder = currentFolderId ? assets.find((a: any) => a.id === currentFolderId) : null;
        let basePath = parentFolder ? parentFolder.path : (launchedProject.path + (launchedProject.hasDomain ? '/src' : ''));
        basePath = basePath.replace(/\\/g, '/');
        const folderName = `New Folder`;
        const folderPath = `${basePath}/${folderName}`;
        const result = await ProjectScanner.createFolder(folderPath);
        if (result.success) {
            await handleScan();
        } else {
            console.error('Failed to create folder:', result.error);
        }
    };

    const handleRename = async (assetId: string, newName: string) => {
        setRenamingAssetId(null);
        const asset = assets.find((a: any) => a.id === assetId);
        if (!asset || asset.name === newName) return;
        const oldPath = asset.path;
        const newPath = oldPath.replace(asset.name, newName);
        const result = await ProjectScanner.renameAsset(oldPath, newPath);
        if (result.success) {
            handleScan();
        } else {
            console.error('Rename failed:', result.error);
        }
    };

    const handleDelete = async (assetId: string) => {
        const asset = assets.find((a: any) => a.id === assetId);
        if (!asset) return;
        const result = await ProjectScanner.deleteAsset(asset.path);
        if (result.success) {
            handleScan();
        } else {
            console.error('Delete failed:', result.error);
        }
    };

    const handleMoveAsset = async (draggedId: string, targetId: string | null) => {
        const dragged = assets.find((a: any) => a.id === draggedId);
        const target = targetId ? assets.find((a: any) => a.id === targetId) : null;
        if (!dragged) return;
        const targetPath = target ? target.path : (launchedProject!.path + (launchedProject!.hasDomain ? '/src' : ''));
        const newPath = `${targetPath}/${dragged.name}`;
        if (dragged.path === newPath) return;
        const result = await ProjectScanner.renameAsset(dragged.path, newPath);
        if (result.success) {
            handleScan();
        } else {
            console.error('Move failed:', result.error);
        }
    };

    const handleAssetClick = async (asset: any) => {
        if (asset.type === 'folder') setCurrentFolderId(asset.id);
        else if (asset.type === 'script') {
            const result = await ProjectScanner.readFile(asset.path);
            if (result.success) {
                openFile({ 
                    id: asset.id, 
                    name: asset.name, 
                    path: asset.path, 
                    content: result.content 
                });
                setScriptFullScreen(true);
            }
        }
    };

    const getBreadcrumbs = () => {
        const path = [];
        let currId = currentFolderId;
        while (currId) {
            const folder = assets.find((a: any) => a.id === currId);
            if (folder) {
                path.unshift(folder);
                currId = folder.parentId || null;
            } else break;
        }
        return path;
    };

    return {
        assets,
        filteredAssets,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        isScanning,
        handleScan,
        currentFolderId,
        setCurrentFolderId,
        contextMenu,
        setContextMenu,
        renamingAssetId,
        setRenamingAssetId,
        createNewScript,
        createNewFolder,
        handleRename,
        handleDelete,
        handleMoveAsset,
        handleAssetClick,
        getBreadcrumbs,
        setActivePanel,
        setScriptFullScreen,
    };
};
