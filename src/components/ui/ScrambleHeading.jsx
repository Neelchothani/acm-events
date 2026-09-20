/**
 * ScrambleHeading
 *
 * Each letter scrambles INDEPENDENTLY on hover.
 * Hovering over a letter runs 2-3 fast, snappy random character swaps (75ms/swap).
 *
 * Zero layout shift: invisible spacer holds the width.
 * Pointer events enabled per character slot.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { scrambleChar } from '../../hooks/useScrambleText';

export const ScrambleHeading = ({
  text,
  as: Tag = 'h1',
  className = '',
  minSwaps = 2,
  maxSwaps = 3,
  stepDelay = 75, // fast & snappy (~75ms per character swap)
}) => {
  const chars    = useMemo(() => Array.from(text), [text]);
  const overlays = useRef([]); // refs to each overlay span

  // On mount: quick staggered reveal across letters
  useEffect(() => {
    const MOUNT_STAGGER = 40; // ms between each char starting on mount
    const timers = overlays.current.map((span, i) => {
      if (!span) return null;
      return setTimeout(() => {
        scrambleChar(span, chars[i], { minSwaps, maxSwaps, stepDelay });
      }, i * MOUNT_STAGGER);
    });

    return () => {
      timers.forEach(t => t && clearTimeout(t));
      overlays.current.forEach((span) => {
        if (span && span._cancelScramble) span._cancelScramble();
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tag className={className} aria-label={text}>
      {/* Screen-reader / SEO text */}
      <span className="sr-only">{text}</span>

      {/* Visual layer */}
      <span
        aria-hidden="true"
        className="inline-flex whitespace-pre"
        style={{ letterSpacing: 'inherit', lineHeight: 'inherit' }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              position: 'relative',
              pointerEvents: 'auto',
              cursor: 'default',
            }}
            onMouseEnter={() => {
              // Only THIS character scrambles with 2-3 fast random swaps
              scrambleChar(overlays.current[i], char, { minSwaps, maxSwaps, stepDelay });
            }}
          >
            {/* Width-holding spacer */}
            <span
              aria-hidden="true"
              style={{ visibility: 'hidden', userSelect: 'none', pointerEvents: 'none' }}
            >
              {char}
            </span>

            {/* Animated overlay */}
            <span
              ref={el => { overlays.current[i] = el; }}
              data-scramble-char
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 1,
                pointerEvents: 'none',
              }}
            >
              {char}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
};
