export const getRenderMode = () => {
  if (typeof window === 'undefined') return { useFallback: false, prefersReducedMotion: false };
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const isWebGLAvailable = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  };

  const useFallback = prefersReducedMotion || !isWebGLAvailable();

  return {
    useFallback,
    prefersReducedMotion,
  };
};
