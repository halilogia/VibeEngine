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
    };
  }
}

export class ProjectScanner {
  static async pickProjectFolder(): Promise<ProjectInfo | null> {
    if (typeof window !== 'undefined' && 'ProjectScanner' in window) {
      const bridge = window.ProjectScanner;
      return await bridge.pickProjectFolder();
    }
    
    throw new Error('Project picker bridge not available');
  }
}
