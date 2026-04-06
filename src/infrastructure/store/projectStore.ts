

import { create } from 'zustand';

export interface ProjectInfo {
    name: string;
    version: string;
    engine: string;
    description?: string;
    author?: string;
    mainScene: string;
    path: string; 
}

interface ProjectState {
    currentProject: ProjectInfo | null;
    recentProjects: string[];

    openProject: (projectPath: string) => Promise<boolean>;
    closeProject: () => void;
    addRecentProject: (path: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    currentProject: null,
    recentProjects: [],

    openProject: async (projectPath: string) => {
        try {

            const projectJsonPath = `${projectPath}/project-data.json`;

            const response = await fetch(projectJsonPath);
            if (!response.ok) {
                console.error('Failed to load project configuration');
                return false;
            }

            const projectData = await response.json();

            const project: ProjectInfo = {
                ...projectData,
                path: projectPath
            };

            set({ currentProject: project });
            get().addRecentProject(projectPath);

            console.log(`✅ Opened project: ${project.name}`);
            return true;
        } catch (error) {
            console.error('Error opening project:', error);
            return false;
        }
    },

    closeProject: () => {
        set({ currentProject: null });
    },

    addRecentProject: (path: string) => {
        set((state) => {
            const recent = [path, ...state.recentProjects.filter(p => p !== path)].slice(0, 5);
            return { recentProjects: recent };
        });
    }
}));
