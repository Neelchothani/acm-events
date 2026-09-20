import * as THREE from 'three';

// Random offsets and rotations for the tiles when scrambled
export const generateTileScrambleState = () => {
  const random = () => Math.random(); 
  
  return {
    offset: new THREE.Vector3(
      (random() - 0.5) * 4,
      (random() - 0.5) * 4,
      (random() - 0.5) * 4
    ),
    rotation: new THREE.Euler(
      random() * Math.PI * 2,
      random() * Math.PI * 2,
      random() * Math.PI * 2
    ),
    // Mixed scramble colors from our palette
    color: ['#38E8F5', '#D84FE0', '#FFCE54', '#04060B', '#546069'][Math.floor(random() * 5)]
  };
};
