/**
 * Pre-scripted 12-move solve sequence.
 *
 * Design: The cube starts SOLVED, then we apply the INVERSE of this sequence
 * (invert each move AND reverse array order) to get the scrambled state.
 * Replaying this sequence forward on that scrambled state returns it to solved.
 *
 * Each move carries:
 *   axis:  'x'|'y'|'z'
 *   layer: which slice index (0 = negative end, 1 = middle, 2 = positive end)
 *   dir:   +1 (counterclockwise from positive axis view) | -1 (clockwise)
 *
 * Notation mapping:
 *   R  → x-axis, layer 2, dir +1
 *   R' → x-axis, layer 2, dir -1
 *   L  → x-axis, layer 0, dir -1
 *   L' → x-axis, layer 0, dir +1
 *   U  → y-axis, layer 2, dir +1
 *   U' → y-axis, layer 2, dir -1
 *   D  → y-axis, layer 0, dir -1
 *   D' → y-axis, layer 0, dir +1
 *   F  → z-axis, layer 2, dir +1
 *   F' → z-axis, layer 2, dir -1
 *   B  → z-axis, layer 0, dir -1
 *   B' → z-axis, layer 0, dir +1
 *
 * unlocksFace: which of the 6 events (0-indexed) this move completing unlocks.
 * Two moves per event (moves 0-1 unlock face 0, moves 2-3 unlock face 1, etc.)
 */
export const SOLVE_SEQUENCE = [
  // Face 0 (EVT.01 – Hack the Grid, cyan)  → unlocks at move 1
  { axis: 'y', layer: 2, dir: +1, label: "U"  },   // 0
  { axis: 'x', layer: 2, dir: +1, label: "R"  },   // 1  ← unlocksFace 0

  // Face 1 (EVT.02 – Signal Boost, magenta) → unlocks at move 3
  { axis: 'y', layer: 2, dir: -1, label: "U'" },   // 2
  { axis: 'x', layer: 0, dir: -1, label: "L"  },   // 3  ← unlocksFace 1

  // Face 2 (EVT.03 – Design Sprint, yellow)  → unlocks at move 5
  { axis: 'z', layer: 2, dir: +1, label: "F"  },   // 4
  { axis: 'y', layer: 0, dir: -1, label: "D"  },   // 5  ← unlocksFace 2

  // Face 3 (EVT.04 – CTF Night, green)       → unlocks at move 7
  { axis: 'z', layer: 2, dir: -1, label: "F'" },   // 6
  { axis: 'y', layer: 0, dir: +1, label: "D'" },   // 7  ← unlocksFace 3

  // Face 4 (EVT.05 – Founder's Protocol, purple) → unlocks at move 9
  { axis: 'x', layer: 2, dir: -1, label: "R'" },   // 8
  { axis: 'z', layer: 0, dir: -1, label: "B"  },   // 9  ← unlocksFace 4

  // Face 5 (EVT.06 – Demo Day, amber)        → unlocks at move 11
  { axis: 'x', layer: 0, dir: +1, label: "L'" },   // 10
  { axis: 'z', layer: 0, dir: +1, label: "B'" },   // 11 ← unlocksFace 5
];

/** Which move index completes each face (0-indexed face → move index). */
export const FACE_UNLOCK_AT_MOVE = [1, 3, 5, 7, 9, 11];

/** Invert a single move (flip dir, same axis/layer). */
export function invertMove(move) {
  return { ...move, dir: -move.dir };
}

/**
 * Returns the scramble sequence: reversed array with each move inverted.
 * Applying these moves in order to a solved cube produces the scrambled state.
 */
export function getScrambleSequence() {
  return [...SOLVE_SEQUENCE].reverse().map(invertMove);
}
