import { events } from '../data/events';

/**
 * Generates a 512×512 CanvasTexture atlas for one event face.
 *
 * ONE unified design across the full 512×512 — NOT repeated per tile.
 * Each cubie's UV slice shows its portion; together all 9 cubies of the
 * solved face display the complete artwork.
 *
 * Scrambled → tiles are individually rotated (jitter) so the text looks
 *   shredded / encrypted.
 * Solved → all tiles snap into alignment → you read the full event name
 *   cleanly across the face.
 *
 * flipY = false on the CanvasTexture (set in CubeRig) means canvas Y=0
 * maps to WebGL UV Y=0 (bottom).  We compensate by flipping the ctx
 * before drawing so the final render appears right-side-up.
 */
export function generateFaceCanvas(event) {
  const SIZE = 512;

  const canvas = document.createElement('canvas');
  canvas.width  = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext('2d');
  const { accentColor, title, code } = event;

  // ── 1. Solid background ───────────────────────────────────────────────────
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle radial vignette for depth
  const vig = ctx.createRadialGradient(SIZE/2, SIZE/2, 0, SIZE/2, SIZE/2, SIZE * 0.72);
  vig.addColorStop(0,   'rgba(255,255,255,0.10)');
  vig.addColorStop(0.5, 'rgba(0,0,0,0.00)');
  vig.addColorStop(1,   'rgba(0,0,0,0.35)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ── 2. Flip ctx so text reads correctly (compensates for flipY=false) ─────
  ctx.save();
  ctx.translate(0, SIZE);
  ctx.scale(1, -1);

  // ── 3. Full-face event code ───────────────────────────────────────────────
  //   Positioned in the TOP THIRD of the face (tile row 0)
  const codeFontSize = 46;
  ctx.font          = `700 ${codeFontSize}px 'JetBrains Mono', monospace`;
  ctx.fillStyle     = '#000000'; // Pure black
  ctx.textAlign     = 'center';
  ctx.textBaseline  = 'middle';
  ctx.fillText(code, SIZE / 2, SIZE * (1/6));   // center of top tile row

  // ── 4. Full-face event title ─────────────────────────────────────────────
  //   Spans the MIDDLE THIRD of the face (tile row 1) — auto-fit to 90% width.
  const fullTitle = title.toUpperCase();
  const maxW      = SIZE * 0.90;
  let   fontSize  = 96;
  const minSize   = 46;

  ctx.textBaseline = 'middle';
  do {
    ctx.font = `900 ${fontSize}px 'Space Grotesk', sans-serif`;
    if (ctx.measureText(fullTitle).width <= maxW || fontSize <= minSize) break;
    fontSize -= 2;
  } while (true);

  const titleY     = SIZE / 2;        // centre of middle tile row

  ctx.fillStyle    = '#000000';
  ctx.textAlign    = 'center';
  ctx.fillText(fullTitle, SIZE / 2, titleY);

  // ── 5. Full-width accent underline ───────────────────────────────────────
  //   Positioned in the BOTTOM THIRD of the face (tile row 2)
  const barW = SIZE * 0.60;
  const barH = SIZE * 0.022;
  const barY = SIZE * (5/6);          // center of bottom tile row
  ctx.fillStyle  = '#000000';
  ctx.fillRect((SIZE - barW) / 2, barY - barH / 2, barW, barH);

  ctx.restore();

  return canvas;
}

/** Pre-generate all 6 face canvases, keyed by event index. */
let _faceCanvases = null;

export function getFaceCanvases() {
  if (!_faceCanvases) {
    _faceCanvases = events.map(evt => generateFaceCanvas(evt));
  }
  return _faceCanvases;
}

// Clear cache on HMR so texture changes take effect in dev without a full reload
if (import.meta.hot) {
  import.meta.hot.dispose(() => { _faceCanvases = null; });
}

/**
 * Given a sticker slot (0-8 in reading order, row-major), returns the UV
 * repeat and offset to sample the correct 1/9th of the texture.
 */
export function getStickerUV(slotIndex) {
  const col = slotIndex % 3;
  const row = Math.floor(slotIndex / 3);
  return {
    repeat: [1 / 3, 1 / 3],
    offset: [col / 3, 1 - (row + 1) / 3],
  };
}

/**
 * Small deterministic jitter angle so scrambled tiles look encrypted.
 * Range: ±8°–18°, alternating sign, seeded per face+slot.
 */
export function getScrambleRotation(faceIndex, slotIndex) {
  const seed = (faceIndex * 9 + slotIndex) * 137 + 31;
  const magnitudeDeg = 8 + (seed % 11);   // 8–18°
  const sign = seed % 2 === 0 ? 1 : -1;
  return (magnitudeDeg * Math.PI) / 180 * sign;
}
