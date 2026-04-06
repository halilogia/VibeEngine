import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface ProjectState {
  projects: ProjectInfo[];
  selectedProject: ProjectInfo | null;
  launchedProject: ProjectInfo | null;
  showLauncher: boolean;
  isLoading: boolean;
  error: string | null;

  setProjects: (projects: ProjectInfo[]) => void;
  selectProject: (project: ProjectInfo | null) => void;
  launchProject: (project: ProjectInfo | null) => void;
  setShowLauncher: (show: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addProject: (project: ProjectInfo) => void;
  removeProject: (path: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      selectedProject: null,
      launchedProject: null,
      showLauncher: false,
      isLoading: false,
      error: null,

      setProjects: (projects) => set({ projects }),
      selectProject: (project) => set({ selectedProject: project }),
      launchProject: (project) => set({ launchedProject: project, showLauncher: false }),
      setShowLauncher: (show) => set({ showLauncher: show }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      addProject: (project) => set((state) => ({ projects: [project, ...state.projects.filter((item) => item.path !== project.path)] })),
      removeProject: (path) => set((state) => ({ 
        projects: state.projects.filter((p) => p.path !== path),
        selectedProject: state.selectedProject?.path === path ? null : state.selectedProject
      })),
    }),
    {
      name: 'vibe-engine-project-store',
      partialize: (state) => ({
        projects: state.projects,
        selectedProject: state.selectedProject,
        launchedProject: state.launchedProject,
      }),
    }
  )
);
