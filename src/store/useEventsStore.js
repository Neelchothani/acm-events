import { create } from 'zustand';

export const useEventsStore = create((set) => ({
  stageProgress: [0, 0, 0, 0, 0, 0],
  unlockedFaces: [false, false, false, false, false, false],
  activeEventId: null,
  isLowPerformance: false,

  setStageProgress: (index, progress) => set((state) => {
    const newProgress = [...state.stageProgress];
    newProgress[index] = progress;
    return { stageProgress: newProgress };
  }),

  unlockFace: (index) => set((state) => {
    if (state.unlockedFaces[index]) return state; // Already unlocked
    const newUnlocked = [...state.unlockedFaces];
    newUnlocked[index] = true;
    return { unlockedFaces: newUnlocked };
  }),

  lockFace: (index) => set((state) => {
    if (!state.unlockedFaces[index]) return state; // Already locked
    const newUnlocked = [...state.unlockedFaces];
    newUnlocked[index] = false;
    return { unlockedFaces: newUnlocked };
  }),

  setActiveEventId: (id) => set({ activeEventId: id }),
  setIsLowPerformance: (isLow) => set({ isLowPerformance: isLow }),
  focusingFaceIdx: null,
  setFocusingFaceIdx: (idx) => set({ focusingFaceIdx: idx }),
}));
