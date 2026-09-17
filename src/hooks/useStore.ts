"use client";

import { create } from "zustand";

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  image: string;
  liveUrl?: string;
  repoUrl?: string;
  videoUrl?: string;
  color: string;
}

interface PortfolioState {
  activeSection: string;
  setActiveSection: (section: string) => void;

  selectedProject: Project | null;
  isModalOpen: boolean;
  selectProject: (project: Project) => void;
  closeModal: () => void;

  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<PortfolioState>((set) => ({
  activeSection: "hero",
  setActiveSection: (section) => set({ activeSection: section }),

  selectedProject: null,
  isModalOpen: false,
  selectProject: (project) =>
    set({ selectedProject: project, isModalOpen: true }),
  closeModal: () => set({ selectedProject: null, isModalOpen: false }),

  isMobileMenuOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  isLoading: true,
  setLoading: (loading) => set({ isLoading: loading }),
}));
