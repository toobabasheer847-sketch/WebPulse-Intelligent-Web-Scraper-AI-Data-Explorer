import { create } from 'zustand';
import { projectsApi } from '@/lib/api';

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  runs: [],
  scrapedData: [],
  changes: [],
  analytics: null,
  priceHistory: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await projectsApi.list();
      set({ projects: data.projects, loading: false });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.error?.message || 'Failed to load projects' });
    }
  },

  fetchProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await projectsApi.get(id);
      set({ currentProject: data.project, loading: false });
      return data.project;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.error?.message || 'Failed to load project' });
      throw err;
    }
  },

  createProject: async (projectData) => {
    try {
      const { data } = await projectsApi.create(projectData);
      set((s) => ({ projects: [data.project, ...s.projects] }));
      return data.project;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to create project';
      throw new Error(message);
    }
  },

  updateProject: async (id, projectData) => {
    const { data } = await projectsApi.update(id, projectData);
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? data.project : p)),
      currentProject: s.currentProject?.id === id ? data.project : s.currentProject,
    }));
    return data.project;
  },

  deleteProject: async (id) => {
    await projectsApi.delete(id);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      currentProject: s.currentProject?.id === id ? null : s.currentProject,
    }));
  },

  triggerScrape: async (id) => {
    const { data } = await projectsApi.scrape(id);
    return data.run;
  },

  fetchRuns: async (id) => {
    const { data } = await projectsApi.runs(id);
    set({ runs: data.runs });
    return data.runs;
  },

  fetchData: async (id, params) => {
    const { data } = await projectsApi.data(id, params);
    set({ scrapedData: data.data });
    return data.data;
  },

  fetchChanges: async (id) => {
    const { data } = await projectsApi.changes(id);
    set({ changes: data.changes });
    return data.changes;
  },

  fetchAnalytics: async (id) => {
    const { data } = await projectsApi.analytics(id);
    set({ analytics: data });
    return data;
  },

  fetchPriceHistory: async (id) => {
    const { data } = await projectsApi.history(id);
    set({ priceHistory: data });
    return data;
  },
}));
