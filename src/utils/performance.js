export const shouldEnablePostProcessing = () => {
  if (typeof navigator === 'undefined') return true;
  
  // Upfront heuristics
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
    return false;
  }
  if (navigator.deviceMemory && navigator.deviceMemory <= 4) {
    return false;
  }
  
  return true;
};
