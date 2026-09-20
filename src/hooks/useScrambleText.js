/**
 * scrambleChar — animate a single character overlay span with 2-3 snappy random glyph swaps.
 *
 * Fast stepDelay (~75ms) so each hover feels responsive, sleek, and high-performance.
 */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*?/';

function pick(excludeChar) {
  let c = CHARS[Math.floor(Math.random() * CHARS.length)];
  while (c === excludeChar && CHARS.length > 1) {
    c = CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return c;
}

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function scrambleChar(
  overlaySpan,
  finalChar,
  { minSwaps = 2, maxSwaps = 3, stepDelay = 75 } = {}
) {
  if (!overlaySpan) return () => {};

  if (reducedMotion()) {
    overlaySpan.textContent = finalChar;
    overlaySpan.style.opacity = '1';
    return () => {};
  }

  // Cancel any ongoing animation on this span
  if (overlaySpan._cancelScramble) {
    overlaySpan._cancelScramble();
  }

  const timers = [];
  let dead = false;

  const cancel = () => {
    dead = true;
    timers.forEach(t => clearTimeout(t));
    timers.length = 0;
    if (overlaySpan) {
      overlaySpan.textContent = finalChar;
      overlaySpan.style.opacity = '1';
      overlaySpan._cancelScramble = null;
    }
  };

  overlaySpan._cancelScramble = cancel;

  // Determine 2 or 3 random scrambles
  const totalSwaps = Math.floor(Math.random() * (maxSwaps - minSwaps + 1)) + minSwaps;

  // Initial swap (Swap 1)
  overlaySpan.style.opacity = '0.85';
  overlaySpan.textContent = pick(finalChar);

  // Subsequent swaps
  for (let i = 1; i < totalSwaps; i++) {
    const t = setTimeout(() => {
      if (dead) return;
      overlaySpan.style.opacity = '0.9';
      overlaySpan.textContent = pick(finalChar);
    }, i * stepDelay);
    timers.push(t);
  }

  // Final lock to original character
  const lockTimer = setTimeout(() => {
    if (dead) return;
    overlaySpan.textContent = finalChar;
    overlaySpan.style.opacity = '1';
    overlaySpan._cancelScramble = null;
  }, totalSwaps * stepDelay);
  timers.push(lockTimer);

  return cancel;
}
