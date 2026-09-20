import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SOLVE_SEQUENCE, FACE_UNLOCK_AT_MOVE } from '../../data/moves';
import { initCubeSnapshots, buildLayerQuaternion } from '../../utils/cubeState';
import { getFaceCanvases } from '../../utils/stickerTexture';
import { useEventsStore } from '../../store/useEventsStore';
import { useScrollBridge } from '../../store/useScrollBridge';
import { events } from '../../data/events';
import { Cubie } from './Cubie';

const TOTAL_MOVES = SOLVE_SEQUENCE.length; // 12

/**
 * Face normals in the cube's LOCAL space (before any group rotation).
 *   0 = +Z (front)   1 = +X (right)   2 = -Z (back)
 *   3 = -X (left)    4 = +Y (top)     5 = -Y (bottom)
 */
const FACE_NORMALS = [
  new THREE.Vector3( 0,  0,  1),  // 0 front
  new THREE.Vector3( 1,  0,  0),  // 1 right
  new THREE.Vector3( 0,  0, -1),  // 2 back
  new THREE.Vector3(-1,  0,  0),  // 3 left
  new THREE.Vector3( 0,  1,  0),  // 4 top
  new THREE.Vector3( 0, -1,  0),  // 5 bottom
];

export const CubeRig = () => {
  const snapshots = useMemo(() => initCubeSnapshots(SOLVE_SEQUENCE), []);
  const idleRotY = useRef(0);

  return <CubeRigInner snapshots={snapshots} idleRotY={idleRotY} />;
};

const CubeRigInner = ({ snapshots, idleRotY }) => {
  const groupRef = useRef();
  const meshRefs = useRef({});

  const unlockFace         = useEventsStore(s => s.unlockFace);
  const focusingFaceIdx    = useEventsStore(s => s.focusingFaceIdx);
  const setFocusingFaceIdx = useEventsStore(s => s.setFocusingFaceIdx);
  const setActiveEventId   = useEventsStore(s => s.setActiveEventId);

  const highWaterRef    = useRef(-1);
  const faceProgressRef = useRef([0, 0, 0, 0, 0, 0]);
  const lockFace        = useEventsStore(s => s.lockFace);

  /**
   * Focus animation state lives entirely in a ref (no re-renders).
   * We set `pending` when focusingFaceIdx changes; the target quaternion
   * is computed INSIDE useFrame where we have access to the live camera
   * position — this is what makes the rotation work correctly even after
   * the user has manually dragged the cube / orbited the camera.
   */
  const focusStateRef = useRef({
    pending: false,   // set by useEffect; consumed by useFrame on next tick
    pendingFaceIdx: null,
    active: false,
    faceIdx: null,
    startQ: new THREE.Quaternion(),
    targetQ: new THREE.Quaternion(),
    t: 0,
    opened: false,
  });

  // When focusingFaceIdx changes, flag a pending animation.
  // We DON'T compute the target here — we do it in useFrame so we have
  // access to the real-time camera position AFTER any orbit drag.
  useEffect(() => {
    if (focusingFaceIdx === null) return;
    const fs = focusStateRef.current;
    fs.pending        = true;
    fs.pendingFaceIdx = focusingFaceIdx;
  }, [focusingFaceIdx]);

  // Base 512×512 CanvasTextures
  const faceTextures = useMemo(() => {
    const canvases = getFaceCanvases();
    return canvases.map(c => {
      const t = new THREE.CanvasTexture(c);
      t.flipY = false;
      return t;
    });
  }, []);

  const accentColors = useMemo(() => events.map(e => e.accentColor), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const fs = focusStateRef.current;

    // ── Consume a pending focus request ──────────────────────────────────
    // This runs on the FIRST frame after a click. By computing the target
    // here we get the camera's actual current position (post-orbit-drag).
    if (fs.pending && !fs.active) {
      fs.pending = false;

      const faceIdx = fs.pendingFaceIdx;

      // Direction from origin → camera (the direction a face must point to face the camera)
      const camDir = state.camera.position.clone().normalize();

      // The target group quaternion = the rotation that maps the face's local
      // normal into the camera direction.
      // setFromUnitVectors(a, b) gives the shortest rotation that takes a → b.
      const faceNormal = FACE_NORMALS[faceIdx].clone();
      const targetQ    = new THREE.Quaternion().setFromUnitVectors(faceNormal, camDir);

      fs.active  = true;
      fs.faceIdx = faceIdx;
      fs.startQ.copy(groupRef.current.quaternion);
      fs.targetQ.copy(targetQ);
      fs.t       = 0;
      fs.opened  = false;

      // Capture current idle Y so we can sync back cleanly after animation
      idleRotY.current = groupRef.current.rotation.y;
    }

    // ── Run the focus rotation animation ─────────────────────────────────
    if (fs.active) {
      fs.t = Math.min(1, fs.t + delta / 1.2); // ~1.2 s total

      // Smoothstep ease
      const eased = fs.t * fs.t * (3 - 2 * fs.t);

      groupRef.current.quaternion.slerpQuaternions(fs.startQ, fs.targetQ, eased);

      // Open dialog once face is clearly turned toward camera (60% through)
      if (!fs.opened && fs.t >= 0.6) {
        fs.opened = true;
        setActiveEventId(events[fs.faceIdx].id);
      }

      // Animation complete
      if (fs.t >= 1) {
        fs.active = false;
        setFocusingFaceIdx(null);
        // Sync idleRotY so idle animation doesn't snap
        idleRotY.current = groupRef.current.rotation.y;
      }

      // While animating, skip scroll-driven solve animation
      return;
    }

    // ── Normal scroll-driven solve animation ─────────────────────────────
    idleRotY.current += delta * 0.04;
    groupRef.current.rotation.y = idleRotY.current;

    const offset = useScrollBridge.getState().offset;
    const rawProgress = offset * TOTAL_MOVES;
    const moveIndex   = Math.min(Math.floor(rawProgress), TOTAL_MOVES - 1);
    const moveProgress = rawProgress - moveIndex;
    const easedP = moveProgress < 0.5
      ? 2 * moveProgress * moveProgress
      : -1 + (4 - 2 * moveProgress) * moveProgress;

    const move           = SOLVE_SEQUENCE[moveIndex];
    const layerGridIndex = move.layer - 1;
    const snapshot       = snapshots[moveIndex];

    const movingIds = new Set(
      snapshot.filter(c => c[`i${move.axis}`] === layerGridIndex).map(c => c.id)
    );

    const layerQ = buildLayerQuaternion(move.axis, move.dir, easedP);

    snapshot.forEach(cubie => {
      const mesh = meshRefs.current[cubie.id];
      if (!mesh) return;

      if (movingIds.has(cubie.id)) {
        const basePos = new THREE.Vector3(cubie.ix, cubie.iy, cubie.iz);
        basePos.applyQuaternion(layerQ);
        mesh.position.copy(basePos);
        mesh.quaternion.copy(cubie.q).premultiply(layerQ);
      } else {
        mesh.position.set(cubie.ix, cubie.iy, cubie.iz);
        mesh.quaternion.copy(cubie.q);
      }
    });

    // ── Per-face reveal progress + bidirectional unlock / re-lock ───────
    const globalProgress = rawProgress;
    const currentMove    = Math.floor(globalProgress);

    // Forward: unlock faces as user scrolls down
    if (currentMove > highWaterRef.current) {
      highWaterRef.current = currentMove;
      FACE_UNLOCK_AT_MOVE.forEach((unlockMove, faceIdx) => {
        if (currentMove > unlockMove) unlockFace(faceIdx);
      });
    }

    // Backward: re-lock faces when user scrolls back above their threshold
    // Each face unlocks when currentMove > FACE_UNLOCK_AT_MOVE[faceIdx].
    // So if we scroll back to where currentMove <= unlockMove, re-lock it.
    FACE_UNLOCK_AT_MOVE.forEach((unlockMove, faceIdx) => {
      if (currentMove <= unlockMove) {
        lockFace(faceIdx);
        // Also lower the high-water mark so forward re-unlock fires again
        if (unlockMove <= highWaterRef.current) {
          highWaterRef.current = currentMove - 1;
        }
      }
    });

    FACE_UNLOCK_AT_MOVE.forEach((unlockMove, faceIdx) => {
      const segStart  = faceIdx * 2;
      const raw       = THREE.MathUtils.clamp(globalProgress - segStart, 0, 2);
      const moveLocal = raw < 1 ? raw : raw - 1;
      const eased     = moveLocal < 0.5
        ? 2 * moveLocal * moveLocal
        : -1 + (4 - 2 * moveLocal) * moveLocal;
      const localP    = raw < 1 ? eased * 0.5 : 0.5 + eased * 0.5;
      faceProgressRef.current[faceIdx] = THREE.MathUtils.clamp(localP, 0, 1);
    });
  });

  const initialSnapshot = snapshots[0];
  const solvedSnapshot  = snapshots[snapshots.length - 1];

  const solvedCoords = useMemo(() => {
    const map = {};
    solvedSnapshot.forEach(c => map[c.id] = c);
    return map;
  }, [solvedSnapshot]);

  return (
    <group ref={groupRef}>
      {initialSnapshot.map(cubie => {
        const solved = solvedCoords[cubie.id];
        return (
          <CubieWithRef
            key={cubie.id}
            cubieId={cubie.id}
            ix={cubie.ix}
            iy={cubie.iy}
            iz={cubie.iz}
            solvedIx={solved.ix}
            solvedIy={solved.iy}
            solvedIz={solved.iz}
            meshRefs={meshRefs}
            faceTextures={faceTextures}
            faceProgressRef={faceProgressRef}
            accentColors={accentColors}
          />
        );
      })}
    </group>
  );
};

const CubieWithRef = ({ cubieId, ix, iy, iz, solvedIx, solvedIy, solvedIz, meshRefs, faceTextures, faceProgressRef, accentColors }) => {
  const meshRef = useRef();

  useEffect(() => {
    meshRefs.current[cubieId] = meshRef.current;
    return () => { delete meshRefs.current[cubieId]; };
  }, [cubieId, meshRefs]);

  return (
    <Cubie
      ix={ix}
      iy={iy}
      iz={iz}
      solvedIx={solvedIx}
      solvedIy={solvedIy}
      solvedIz={solvedIz}
      meshRef={meshRef}
      faceTextures={faceTextures}
      faceProgressRef={faceProgressRef}
      accentColors={accentColors}
    />
  );
};
