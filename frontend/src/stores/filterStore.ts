import { create } from "zustand";
import type { TripFilters } from "@/types/trip";

interface FilterState {
  filters: TripFilters;
  setFilters: (filters: Partial<TripFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: TripFilters = {};

export const useFilterStore = create<FilterState>()((set) => ({
  filters: defaultFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
