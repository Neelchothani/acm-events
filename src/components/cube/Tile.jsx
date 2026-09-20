import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { generateTileScrambleState } from '../../utils/scramble';

const TILE_SIZE = 0.95;
const TILE_GEOMETRY = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, 0.1);

export const Tile = ({ index, x, y, stageIndex, accentColor }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const scroll = useScroll();
  
  // Base position in the 3x3 grid
  const basePosition = useMemo(() => new THREE.Vector3(x, y, 0), [x, y]);
  
  // Pre-generate the scrambled state
  const scrambleState = useMemo(() => generateTileScrambleState(), []);

  // Target values
  const targetColor = useMemo(() => new THREE.Color(accentColor), [accentColor]);
  const scrambledColorObj = useMemo(() => new THREE.Color(scrambleState.color), [scrambleState.color]);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;
    
    const currentOffset = scroll.offset;
    const currentStageProgress = (currentOffset * 6) - stageIndex;

    const p = THREE.MathUtils.clamp(currentStageProgress, 0, 1);
    
    // Ease the interpolation
    const easeProgress = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

    // Interpolate Position
    const currentPos = new THREE.Vector3().copy(basePosition).add(scrambleState.offset);
    meshRef.current.position.lerpVectors(currentPos, basePosition, easeProgress);
    
    // Interpolate Rotation
    const currentRot = new THREE.Quaternion().setFromEuler(scrambleState.rotation);
    const targetRot = new THREE.Quaternion().identity();
    meshRef.current.quaternion.slerpQuaternions(currentRot, targetRot, easeProgress);

    // Interpolate Color
    materialRef.current.color.lerpColors(scrambledColorObj, targetColor, easeProgress);
    
    // Increase emissive intensity as it solves (glow effect)
    materialRef.current.emissive.copy(materialRef.current.color);
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(0, 1.5, Math.pow(easeProgress, 2));
  });

  return (
    <mesh ref={meshRef} geometry={TILE_GEOMETRY}>
      <meshStandardMaterial 
        ref={materialRef} 
        roughness={0.2} 
        metalness={0.8}
        toneMapped={false}
      />
    </mesh>
  );
};
