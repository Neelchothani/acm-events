import * as THREE from 'three';

/**
 * Face descriptors: normal axis, and the two in-plane (tangent) axes used to
 * compute a cubie's row/col position within that face's 3×3 tile grid.
 *
 * Face indices (matching events order):
 *   0 = +Z (front)   1 = +X (right)   2 = -Z (back)
 *   3 = -X (left)    4 = +Y (top)     5 = -Y (bottom)
 */
export const FACE_DESCRIPTORS = [
  { normal: [0, 0, 1],  up: [0, 1, 0], right: [1, 0, 0]  }, // 0 = +Z front
  { normal: [1, 0, 0],  up: [0, 1, 0], right: [0, 0, -1] }, // 1 = +X right
  { normal: [0, 0, -1], up: [0, 1, 0], right: [-1, 0, 0] }, // 2 = -Z back
  { normal: [-1, 0, 0], up: [0, 1, 0], right: [0, 0, 1]  }, // 3 = -X left
  { normal: [0, 1, 0],  up: [0, 0, -1], right: [1, 0, 0] }, // 4 = +Y top
  { normal: [0, -1, 0], up: [0, 0, 1],  right: [1, 0, 0] }, // 5 = -Y bottom
];

const AXIS_KEY_TO_FACE_INDEX = { '+z': 0, '+x': 1, '-z': 2, '-x': 3, '+y': 4, '-y': 5 };

// THREE.BoxGeometry's material group order: +x, -x, +y, -y, +z, -z
export const BOX_MATERIAL_AXES = [
  { axis: 'x', sign: 1,  key: '+x' },
  { axis: 'x', sign: -1, key: '-x' },
  { axis: 'y', sign: 1,  key: '+y' },
  { axis: 'y', sign: -1, key: '-y' },
  { axis: 'z', sign: 1,  key: '+z' },
  { axis: 'z', sign: -1, key: '-z' },
];

/**
 * For a cubie at grid coords (ix,iy,iz), returns an array of 6 entries — one per
 * BoxGeometry material slot, in BOX_MATERIAL_AXES order. Each entry is either:
 *   { exterior: false }
 *     — interior-facing (or this cubie doesn't reach this side); use the shared
 *       plain plastic material.
 *   { exterior: true, faceIdx, slot }
 *     — outward-facing; belongs to event face `faceIdx`, tile `slot` (0-8,
 *       row-major, slot 0 = top-left — matches getStickerUV()'s convention).
 */
export function getCubieFaceAssignments(ix, iy, iz) {
  return BOX_MATERIAL_AXES.map(({ axis, sign, key }) => {
    const coord = axis === 'x' ? ix : axis === 'y' ? iy : iz;
    if (coord !== sign) return { exterior: false };

    const faceIdx = AXIS_KEY_TO_FACE_INDEX[key];
    const fd = FACE_DESCRIPTORS[faceIdx];
    const pos = new THREE.Vector3(ix, iy, iz);
    const R = new THREE.Vector3(...fd.right);
    const U = new THREE.Vector3(...fd.up);
    const u = Math.round(pos.dot(R));
    const v = Math.round(pos.dot(U));
    const col = u + 1;       // 0,1,2
    const row = 1 - v;       // 0 = top
    const slot = row * 3 + col;

    return { exterior: true, faceIdx, slot };
  });
}
