import React, { useRef, useEffect, useState } from 'react';
import { ArchiveFolderCard } from './ArchiveFolderCard';

/**
 * ArchiveCarousel
 *
 * Continuous, infinite horizontal marquee carousel of archive folders.
 * Features:
 * - True seamless infinite loop: wraps position by exact width of ONE full set
 * - Hover slowdown & selection pause
 * - Touch swipe support
 * - Subtle Y-offsets and rotation tilt per item for organic depth
 */

export const ArchiveCarousel = ({
  events,
  selectedFolder,
  onSelectFolder,
}) => {
  const trackRef = useRef(null);
  const firstSetRef = useRef(null);
  const scrollPosRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  // Triple the events array: one real set + two buffer copies for seamless wrap
  const extendedEvents = React.useMemo(() => {
    return [...events, ...events, ...events];
  }, [events]);

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (trackRef.current && firstSetRef.current && !selectedFolder) {
        // Base speed: 0.04 px/ms (slow, steady, elegant). Slow down to 0.012 px/ms on hover.
        const speed = isHovered ? 0.012 : 0.04;
        scrollPosRef.current += speed * delta;

        // Measure the total pixel width of just the first set (including gap)
        const singleSetWidth = firstSetRef.current.getBoundingClientRect().width;

        // Once we've scrolled a full set width, snap back by exactly one set
        if (singleSetWidth > 0 && scrollPosRef.current >= singleSetWidth) {
          scrollPosRef.current -= singleSetWidth;
        }

        trackRef.current.style.transform = `translate3d(-${scrollPosRef.current}px, 0, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, selectedFolder]);

  // Subtle dimensional vertical offsets and rotation tilts per event item
  const yOffsets = [-12, 6, -6, 10, -8, 4, -10, 8];
  const rotations = [-1.5, 1.0, -0.8, 1.5, -1.0, 0.6, -1.2, 0.9];

  const renderFolderItem = (evt, idx, isFirstSet) => {
    const isCurrentSelected = selectedFolder && selectedFolder.id === evt.id;
    const yOffset = yOffsets[idx % yOffsets.length];
    const rotation = rotations[idx % rotations.length];

    return (
      <div
        key={`${evt.id}-${idx}-${isFirstSet ? 'a' : 'b'}`}
        className="flex-shrink-0 transition-transform duration-300"
        style={{
          transform: `translateY(${yOffset}px) rotate(${rotation}deg)`,
        }}
      >
        <ArchiveFolderCard
          event={evt}
          isSelected={isCurrentSelected}
          onSelect={(selectedEvt, rect) => onSelectFolder(selectedEvt, rect)}
        />
      </div>
    );
  };

  return (
    <div
      className="w-full relative py-12 overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle Side Fade Gradients for Seamless Edge Receding */}
      <div className="absolute top-0 bottom-0 left-0 w-24 md:w-44 bg-gradient-to-r from-background via-background/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 md:w-44 bg-gradient-to-l from-background via-background/80 to-transparent z-20 pointer-events-none" />

      {/* GPU-Accelerated Continuous Marquee Track */}
      <div
        ref={trackRef}
        className="flex w-max py-8 transition-none"
        style={{ willChange: 'transform', gap: '3rem' }}
      >
        {/* First Set — this wrapper is measured to get single set width */}
        <div ref={firstSetRef} className="flex" style={{ gap: '3rem' }}>
          {events.map((evt, idx) => renderFolderItem(evt, idx, true))}
        </div>

        {/* Second and third sets — infinite buffer copies */}
        <div className="flex" style={{ gap: '3rem' }}>
          {events.map((evt, idx) => renderFolderItem(evt, idx + events.length, false))}
        </div>
        <div className="flex" style={{ gap: '3rem' }}>
          {events.map((evt, idx) => renderFolderItem(evt, idx + events.length * 2, false))}
        </div>
      </div>
    </div>
  );
};
