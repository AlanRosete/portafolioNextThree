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
  // Navigation
  activeSection: string;
  setActiveSection: (section: string) => void;

  // Project Modal
  selectedProject: Project | null;
  isModalOpen: boolean;
  selectProject: (project: Project) => void;
  closeModal: () => void;

  // Mobile Menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<PortfolioState>((set) => ({
  // Navigation
  activeSection: "hero",
  setActiveSection: (section) => set({ activeSection: section }),

  // Project Modal
  selectedProject: null,
  isModalOpen: false,
  selectProject: (project) =>
    set({ selectedProject: project, isModalOpen: true }),
  closeModal: () => set({ selectedProject: null, isModalOpen: false }),

  // Mobile Menu
  isMobileMenuOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  // Loading
  isLoading: true,
  setLoading: (loading) => set({ isLoading: loading }),
}));
