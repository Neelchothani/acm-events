import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getCubieFaceAssignments } from '../../utils/faceGeometry';
import { getStickerUV, getScrambleRotation } from '../../utils/stickerTexture';
import { useEventsStore } from '../../store/useEventsStore';
import { events } from '../../data/events';

const CUBIE_SIZE = 0.94; // slightly larger now that the cubie gap is the only seam

const cubieGeo = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);

// Shared, reused for every interior-facing (never-visible-content) side of every
// cubie — cheap, one instance for the whole scene.
const plasticMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#0c1420'),
  roughness: 0.55,
  metalness: 0.3,
});

/**
 * A single cubie. Its exterior faces ARE the stickers — real BoxGeometry faces,
 * each with its own lit MeshStandardMaterial carrying the event texture and an
 * emissive "coming online" glow. No separate decal planes, no separate glow
 * overlay — sticker content and glow both live on the same material system as
 * the plastic body, so there is only ever one visual layer.
 *
 * Position/rotation of the whole mesh is still driven externally each frame by
 * CubeRig via `meshRef` (unchanged from before). What's new here is entirely
 * about what's painted on the mesh's own faces.
 */
export const Cubie = ({ ix, iy, iz, solvedIx, solvedIy, solvedIz, meshRef, faceTextures, faceProgressRef, accentColors }) => {
  const assignments = useMemo(() => getCubieFaceAssignments(solvedIx, solvedIy, solvedIz), [solvedIx, solvedIy, solvedIz]);

  const { materials, tileMeta } = useMemo(() => {
    const mats = [];
    const meta = [];

    assignments.forEach(a => {
      if (!a.exterior) {
        mats.push(plasticMat);
        meta.push(null);
        return;
      }

      const { repeat, offset } = getStickerUV(a.slot);
      const tex = faceTextures[a.faceIdx].clone();
      tex.needsUpdate = true;
      tex.repeat.set(repeat[0], repeat[1]);
      // To rotate around the center of the geometry face, center must be [0.5, 0.5].
      // But setting center changes the origin of the scale (repeat) transform too, 
      // so we must adjust the offset to compensate: new_offset = base_offset - 0.5 + repeat/2
      tex.offset.set(offset[0] - 0.5 + repeat[0] / 2, offset[1] - 0.5 + repeat[1] / 2);
      tex.center.set(0.5, 0.5);
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;

      // GOTCHA: if text reads mirrored on a particular face once you test this
      // (BoxGeometry's default UV orientation isn't guaranteed symmetric between
      // opposite faces across three.js versions), fix it right here for that
      // face's axis key by flipping the sign:
      //   if (a.faceIdx === /* the mirrored one */) {
      //     tex.repeat.x = -repeat[0];
      //     tex.offset.x = offset[0] + repeat[0];
      //   }

      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        color: new THREE.Color(0.4, 0.4, 0.4), // scrambled-state dim tint; eases to white
        roughness: 0.5,
        metalness: 0.15,
        emissiveMap: tex,
        emissive: new THREE.Color(accentColors[a.faceIdx]),
        emissiveIntensity: 0,
      });

      mats.push(mat);
      meta.push({
        faceIdx: a.faceIdx,
        scrambleRot: getScrambleRotation(a.faceIdx, a.slot),
        texture: tex,
      });
    });

    return { materials: mats, tileMeta: meta };
  }, [assignments, faceTextures, accentColors]);

  useFrame(() => {
    tileMeta.forEach((meta, i) => {
      if (!meta) return;
      const p = faceProgressRef.current[meta.faceIdx];
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

      // Jitter → 0° as this face solves (replaces the old plane-rotation animation)
      meta.texture.rotation = meta.scrambleRot * (1 - eased);

      // Dim/desaturated → full brightness, plus emissive ramps up for the
      // "coming online" payoff in the back half of the reveal.
      const mat = materials[i];
      mat.color.setScalar(0.3 + eased * 0.7);
      mat.emissiveIntensity = Math.max(0, (eased - 0.5) * 2) * 0.5;
    });
  });

  const unlockedFaces = useEventsStore(state => state.unlockedFaces);
  const setFocusingFaceIdx = useEventsStore(state => state.setFocusingFaceIdx);

  return (
    <mesh
      ref={meshRef}
      geometry={cubieGeo}
      material={materials}
      position={[ix, iy, iz]}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        const matIndex = e.face?.materialIndex;
        if (matIndex !== undefined) {
          const meta = tileMeta[matIndex];
          if (meta && unlockedFaces[meta.faceIdx]) {
            setFocusingFaceIdx(meta.faceIdx);
          }
        }
      }}
      onPointerOver={(e) => {
        const matIndex = e.face?.materialIndex;
        if (matIndex !== undefined) {
          const meta = tileMeta[matIndex];
          if (meta && unlockedFaces[meta.faceIdx]) {
            document.body.style.cursor = 'pointer';
          }
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    />
  );
};
