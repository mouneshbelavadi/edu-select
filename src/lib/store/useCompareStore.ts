import { create } from 'zustand';

export interface CompareState {
  selectedColleges: { id: string; name: string }[];
  addCollege: (college: { id: string; name: string }) => boolean;
  removeCollege: (id: string) => void;
  clearColleges: () => void;
  setSelectedColleges: (colleges: { id: string; name: string }[]) => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  selectedColleges: [],
  addCollege: (college) => {
    const { selectedColleges } = get();
    if (selectedColleges.some((c) => c.id === college.id)) {
      return false; // Already present
    }
    if (selectedColleges.length >= 3) {
      return false; // At cap
    }
    set({ selectedColleges: [...selectedColleges, college] });
    return true;
  },
  removeCollege: (id) => {
    set((state) => ({
      selectedColleges: state.selectedColleges.filter((c) => c.id !== id),
    }));
  },
  clearColleges: () => set({ selectedColleges: [] }),
  setSelectedColleges: (colleges) => set({ selectedColleges: colleges }),
}));
