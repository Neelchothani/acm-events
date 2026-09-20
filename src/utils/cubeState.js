import * as THREE from 'three';
import { getScrambleSequence } from '../data/moves';

/**
 * Cubie state: each of the 27 cubies is tracked by its current 3D grid position
 * (ix, iy, iz) in cube-space coordinates where the center of the cube is the
 * origin and each index is -1, 0, or +1.
 *
 * We only track positions (not sticker face-assignment) because under the
 * slot-pinned decal model (Option C), the sticker layer is independent and
 * never needs to know which physical cubie is where.
 *
 * The state here is used ONLY to determine which 9 cubies belong to the
 * moving layer for any given move, so CubeRig can group them correctly.
 */

const GRID = [-1, 0, 1]; // cube index range

/** Build the canonical solved cubie list: 27 objects with grid coords. */
function buildSolvedCubies() {
  const cubies = [];
  let id = 0;
  for (const iz of GRID) {
    for (const iy of GRID) {
      for (const ix of GRID) {
        cubies.push({ id: id++, ix, iy, iz, q: new THREE.Quaternion() });
      }
    }
  }
  return cubies;
}

/**
 * Apply a single move to the cubie list (mutates positions).
 * A move rotates a 3×3 slice of 9 cubies 90° around an axis.
 *
 * axis:  'x'|'y'|'z'
 * layer:  0 → index -1, 1 → index 0, 2 → index +1
 * dir:   +1 | -1  (sign of the 90° rotation angle)
 */
function applyMoveToCubies(cubies, { axis, layer, dir }) {
  // Map layer (0,1,2) → grid index (-1,0,1)
  const layerIndex = layer - 1;

  cubies.forEach(c => {
    // Only affect cubies in this slice
    if (c[`i${axis}`] !== layerIndex) return;

    // Rotate the other two coordinates 90° around axis
    const angle = (Math.PI / 2) * dir;
    const cos = Math.round(Math.cos(angle)); // ±1 or 0
    const sin = Math.round(Math.sin(angle)); // ±1 or 0

    if (axis === 'x') {
      const y = c.iy, z = c.iz;
      c.iy = cos * y - sin * z;
      c.iz = sin * y + cos * z;
    } else if (axis === 'y') {
      const x = c.ix, z = c.iz;
      c.ix = cos * x + sin * z;
      c.iz = -sin * x + cos * z;
    } else { // z
      const x = c.ix, y = c.iy;
      c.ix = cos * x - sin * y;
      c.iy = sin * x + cos * y;
    }

    // Update the cubie's quaternion
    const qTurn = new THREE.Quaternion();
    const vec = new THREE.Vector3(
      axis === 'x' ? 1 : 0,
      axis === 'y' ? 1 : 0,
      axis === 'z' ? 1 : 0
    );
    qTurn.setFromAxisAngle(vec, angle);
    c.q.premultiply(qTurn);
  });
}

/**
 * Build 13 discrete snapshots of cubie positions:
 *   - state[0]  = scrambled (before any solve move)
 *   - state[1]  = after move 0
 *   - ...
 *   - state[12] = fully solved
 *
 * Done by starting with solved, applying the scramble sequence to get state[0],
 * then replaying each solve move forward to get states[1..12].
 */
function buildCubieSnapshots() {
  const scramble = getScrambleSequence(); // 12 inverted+reversed moves

  // Build scrambled state (state[0])
  const cubies = buildSolvedCubies();
  scramble.forEach(move => applyMoveToCubies(cubies, move));

  // Deep-clone helper
  const clone = cs => cs.map(c => ({ ...c, q: c.q.clone() }));

  const snapshots = [clone(cubies)]; // index 0 = scrambled

  // Import solve sequence lazily to avoid circular deps
  // We need to replay forward — import synchronously at module level
  return snapshots; // will be filled in initCubeState
}

// ─── Public API ───────────────────────────────────────────────────────────────

let _snapshots = null;

/**
 * Call once at app start. Returns the 13 state snapshots.
 */
export function initCubeSnapshots(solveSequence) {
  const scramble = getScrambleSequence();

  // Build scrambled state
  const cubies = buildSolvedCubies();
  scramble.forEach(move => applyMoveToCubies(cubies, move));

  const clone = cs => cs.map(c => ({ ...c, q: c.q.clone() }));
  const snapshots = [clone(cubies)];

  // Replay each solve move forward
  solveSequence.forEach(move => {
    applyMoveToCubies(cubies, move);
    snapshots.push(clone(cubies));
  });

  _snapshots = snapshots;
  return snapshots;
}

/**
 * Returns the array of 27 cubie positions for snapshot[index].
 */
export function getCubieSnapshot(index) {
  if (!_snapshots) return [];
  return _snapshots[Math.max(0, Math.min(index, _snapshots.length - 1))];
}

/**
 * Given a move index and fractional progress (0→1), return:
 *   - the 9 cubie IDs in the moving layer (from the snapshot BEFORE this move)
 *   - the axis, layer, dir of the move
 *
 * Used by CubeRig to group and pivot those 9 cubies.
 */
export function getMoveLayerInfo(moveIndex) {
  if (!_snapshots || moveIndex < 0 || moveIndex >= 12) return null;
  const snapshot = _snapshots[moveIndex]; // positions BEFORE this move
  return snapshot;
}

/**
 * Build the Three.js Quaternion for rotating a group by `progress` (0→1)
 * through 90° around the given axis/dir.
 */
export function buildLayerQuaternion(axis, dir, progress) {
  const angle = (Math.PI / 2) * dir * progress;
  const q = new THREE.Quaternion();
  const vec = new THREE.Vector3(
    axis === 'x' ? 1 : 0,
    axis === 'y' ? 1 : 0,
    axis === 'z' ? 1 : 0
  );
  q.setFromAxisAngle(vec, angle);
  return q;
}
