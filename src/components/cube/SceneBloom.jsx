import React, { useEffect, useState } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useEventsStore } from '../../store/useEventsStore';
import { useFrame } from '@react-three/fiber';
import { shouldEnablePostProcessing } from '../../utils/performance';

export const SceneBloom = () => {
  const setIsLowPerformance = useEventsStore(state => state.setIsLowPerformance);
  const isLowPerformance = useEventsStore(state => state.isLowPerformance);
  
  const [frameCount, setFrameCount] = useState(0);
  const [totalDelta, setTotalDelta] = useState(0);
  const [isSampling, setIsSampling] = useState(true);

  useEffect(() => {
    if (!shouldEnablePostProcessing()) {
      setIsLowPerformance(true);
      setIsSampling(false);
    }
  }, [setIsLowPerformance]);

  useFrame((state, delta) => {
    if (!isSampling) return;
    
    setFrameCount(c => c + 1);
    setTotalDelta(d => d + delta);
    
    if (totalDelta > 2.0) {
      const avgFps = frameCount / totalDelta;
      if (avgFps < 45) {
        setIsLowPerformance(true);
      }
      setIsSampling(false);
    }
  });

  if (isLowPerformance) return null;

  return (
    <EffectComposer disableNormalPass>
      <Bloom 
        luminanceThreshold={0.7} 
        mipmapBlur 
        intensity={3.5}
      />
    </EffectComposer>
  );
};
