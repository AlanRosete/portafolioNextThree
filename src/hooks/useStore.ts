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

  // Game
  gameTokens: number;
  maxTokens: number;
  collectToken: () => void;
  resetGame: () => void;
  isGameComplete: boolean;
}

export const useStore = create<PortfolioState>((set, get) => ({
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

  // Game
  gameTokens: 0,
  maxTokens: 5,
  collectToken: () => {
    const current = get().gameTokens;
    const max = get().maxTokens;
    if (current < max) {
      set({
        gameTokens: current + 1,
        isGameComplete: current + 1 >= max,
      });
    }
  },
  resetGame: () => set({ gameTokens: 0, isGameComplete: false }),
  isGameComplete: false,
}));
