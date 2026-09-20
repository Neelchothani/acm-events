import React from 'react';
import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Tile } from './Tile';
import { useEventsStore } from '../../store/useEventsStore';
import * as THREE from 'three';

export const Face = ({ stageIndex, accentColor, position, rotation }) => {
  const scroll = useScroll();
  const unlockFace = useEventsStore(state => state.unlockFace);
  const setStageProgress = useEventsStore(state => state.setStageProgress);

  const tiles = [];
  for (let y = 1; y >= -1; y--) {
    for (let x = -1; x <= 1; x++) {
      tiles.push({ x, y });
    }
  }

  useFrame(() => {
    const currentOffset = scroll.offset;
    const currentStageProgress = (currentOffset * 6) - stageIndex;
    const p = THREE.MathUtils.clamp(currentStageProgress, 0, 1);
    
    if (p >= 0.98) {
      unlockFace(stageIndex);
    }
    
    // Prevent updating state on every frame if it's out of bounds of current scroll
    if (currentStageProgress >= 0 && currentStageProgress <= 1) {
      setStageProgress(stageIndex, p);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[2.9, 2.9]} />
        <meshBasicMaterial color="#04060B" />
      </mesh>
      
      {tiles.map((tile, i) => (
        <Tile 
          key={i} 
          index={i} 
          x={tile.x} 
          y={tile.y} 
          stageIndex={stageIndex} 
          accentColor={accentColor} 
        />
      ))}
    </group>
  );
};
