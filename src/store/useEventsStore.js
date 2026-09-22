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

  focusingFaceIdx: null,
  setFocusingFaceIdx: (idx) => set({ focusingFaceIdx: idx }),
  isSolved: false,

  setIsSolved: (isSolved) => set((state) => {
    if (state.isSolved === isSolved) return state;
    return {
      isSolved,
      unlockedFaces: isSolved ? [true, true, true, true, true, true] : state.unlockedFaces,
    };
  }),

  lockFace: (index) => set((state) => {
    if (state.isSolved) return state; // Never lock once solved!
    if (!state.unlockedFaces[index]) return state; // Already locked
    const newUnlocked = [...state.unlockedFaces];
    newUnlocked[index] = false;
    return { unlockedFaces: newUnlocked };
  }),

  setActiveEventId: (id) => set({ activeEventId: id }),
  setIsLowPerformance: (isLow) => set({ isLowPerformance: isLow }),
}));
