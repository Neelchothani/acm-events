import * as THREE from 'three';

export const lerpColor = (color1, color2, alpha) => {
  const c1 = new THREE.Color(color1);
  const c2 = new THREE.Color(color2);
  return c1.lerp(c2, alpha);
};
