export interface ProjectInfo {
  name: string;
  path: string;
  version: string;
  engine: string;
  description: string;
  author: string;
  mainScene: string;
  hasPackageJson: boolean;
  hasDomain: boolean;
}

declare global {
  interface Window {
    ProjectScanner: {
      pickProjectFolder: () => Promise<ProjectInfo | null>;
      scanProjectAssets: (path: string) => Promise<any[]>;
      createFolder: (path: string) => Promise<{ success: boolean; error?: string }>;
      createFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>;
      readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>;
      renameAsset: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>;
      deleteAsset: (path: string) => Promise<{ success: boolean; error?: string }>;
      saveFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>;
    };
  }
}

export class ProjectScanner {
  static async readFile(filePath: string): Promise<{ success: boolean; content?: string; error?: string }> {
    if (typeof window !== 'undefined' && 'ProjectScanner' in window) {
      return await window.ProjectScanner.readFile(filePath);
    }
    return { success: false, error: 'Bridge not available' };
  }

  static async pickProjectFolder(): Promise<ProjectInfo | null> {
    if (typeof window !== 'undefined' && 'ProjectScanner' in window) {
      const bridge = window.ProjectScanner;
      return await bridge.pickProjectFolder();
    }
    
    throw new Error('Project picker bridge not available');
  }

  static async scanProjectAssets(projectPath: string): Promise<any[]> {
    if (typeof window !== 'undefined' && 'ProjectScanner' in window) {
      const bridge = window.ProjectScanner;
      return await bridge.scanProjectAssets(projectPath);
    }
    
    return [];
  }

  static async createFolder(folderPath: string): Promise<{ success: boolean; error?: string }> {
    if (typeof window !== 'undefined' && 'ProjectScanner' in window) {
      return await window.ProjectScanner.createFolder(folderPath);
    }
    return { success: false, error: 'Bridge not available' };
  }

  static async createFile(filePath: string, content: string = ''): Promise<{ success: boolean; error?: string }> {
    if (typeof window !== 'undefined' && 'ProjectScanner' in window) {
      return await window.ProjectScanner.createFile(filePath, content);
    }
    return { success: false, error: 'Bridge not available' };
  }

  static async renameAsset(oldPath: string, newPath: string): Promise<{ success: boolean; error?: string }> {
    if (typeof window !== 'undefined' && 'ProjectScanner' in window) {
      return await window.ProjectScanner.renameAsset(oldPath, newPath);
    }
    return { success: false, error: 'Bridge not available' };
  }

  static async deleteAsset(assetPath: string): Promise<{ success: boolean; error?: string }> {
    if (typeof window !== 'undefined' && 'ProjectScanner' in window) {
      return await window.ProjectScanner.deleteAsset(assetPath);
    }
    return { success: false, error: 'Bridge not available' };
  }

  static async saveFile(filePath: string, content: string): Promise<{ success: boolean; error?: string }> {
    if (typeof window !== 'undefined' && 'ProjectScanner' in window) {
      return await window.ProjectScanner.saveFile(filePath, content);
    }
    return { success: false, error: 'Bridge not available' };
  }
}
