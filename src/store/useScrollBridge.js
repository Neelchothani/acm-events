import { create } from 'zustand';

/**
 * Bridges live scroll progress out of the R3F/drei tree (where useScroll() works)
 * to plain DOM components rendered as siblings of <Canvas> (where it doesn't).
 * Written every frame by <ScrollSync/> inside the Canvas; read by HUDOverlay outside it.
 */
export const useScrollBridge = create(() => ({ offset: 0 }));
