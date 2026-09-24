import React, { useEffect, useRef } from 'react';

/**
 * InteractiveBackground
 *
 * Renders the global seamless gradient dot grid across the entire website
 * with an interactive cursor spotlight glow effect.
 *
 * Features:
 * - Base subtle gradient dots (#00D8FF -> #FF3BBF) across the dark #04060B canvas.
 * - Dynamic spotlight: As the cursor moves, dots within ~240px light up, shine,
 *   and emit a neon glow around the cursor.
 * - Soft ambient aura around the cursor for depth.
 * - High-performance GPU-driven CSS variables (zero React re-renders).
 */
export const InteractiveBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let targetX = -9999;
    let targetY = -9999;
    let currentX = -9999;
    let currentY = -9999;
    let isInside = false;
    let rafId = null;

    const handlePointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isInside) {
        isInside = true;
        container.style.setProperty('--mouse-opacity', '1');
      }
    };

    const handlePointerLeave = () => {
      isInside = false;
      container.style.setProperty('--mouse-opacity', '0');
    };

    // Smooth lerp loop for organic, fluid cursor following
    const updatePosition = () => {
      if (isInside) {
        if (currentX === -9999) {
          currentX = targetX;
          currentY = targetY;
        } else {
          currentX += (targetX - currentX) * 0.25;
          currentY += (targetY - currentY) * 0.25;
        }

        container.style.setProperty('--mouse-x', `${currentX.toFixed(1)}px`);
        container.style.setProperty('--mouse-y', `${currentY.toFixed(1)}px`);
      }
      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('mouseleave', handlePointerLeave);

    rafId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
      style={{
        '--mouse-x': '-9999px',
        '--mouse-y': '-9999px',
        '--mouse-opacity': '0',
      }}
    >
      {/* ── Layer 1: Ambient Base Gradient Dots ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 216, 255, 0.25) 0%, rgba(255, 59, 191, 0.25) 100%)',
          WebkitMaskImage: 'radial-gradient(circle, black 1px, transparent 1px)',
          WebkitMaskSize: '28px 28px',
          maskImage: 'radial-gradient(circle, black 1px, transparent 1px)',
          maskSize: '28px 28px',
        }}
      />

      {/* ── Layer 2: Minimal Soft Halo Around Cursor ── */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: 'var(--mouse-opacity, 0)',
          background:
            'radial-gradient(circle 110px at var(--mouse-x) var(--mouse-y), rgba(0, 216, 255, 0.08) 0%, rgba(255, 59, 191, 0.04) 50%, transparent 80%)',
        }}
      />

      {/* ── Layer 3: Interactive Shiny Glowing Dots (Compact & Minimal) ── */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: 'var(--mouse-opacity, 0)',
          background:
            'radial-gradient(circle 80px at var(--mouse-x) var(--mouse-y), #00D8FF 0%, #FF3BBF 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle, black 1.5px, transparent 1.5px)',
          WebkitMaskSize: '28px 28px',
          maskImage: 'radial-gradient(circle, black 1.5px, transparent 1.5px)',
          maskSize: '28px 28px',
          filter:
            'drop-shadow(0 0 3px rgba(0, 216, 255, 0.8)) drop-shadow(0 0 6px rgba(255, 59, 191, 0.6))',
        }}
      />
    </div>
  );
};
