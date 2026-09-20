import React from 'react';

/**
 * ArchiveFolderCard
 *
 * Represents an individual digital archive folder inside the digital city.
 * Features:
 * - Folder body + top tab design
 * - Subtle 3D perspective & hair-line cyber borders
 * - Event title printed on front flap
 * - Smooth hover pop (scale 1.1x, Y lift, glow enhancement)
 * - Accessible button wrapper
 */

export const ArchiveFolderCard = ({
  event,
  scale = 1,
  opacity = 1,
  isSelected = false,
  onSelect,
}) => {
  const cardRef = React.useRef(null);

  const handleClick = (e) => {
    if (onSelect && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      onSelect(event, rect);
    }
  };

  return (
    <button
      ref={cardRef}
      onClick={handleClick}
      type="button"
      aria-label={`Open archive for ${event.title}`}
      style={{
        transform: `scale(${scale})`,
        opacity,
        transition: 'transform 0.25s ease-out, opacity 0.25s ease-out, box-shadow 0.25s ease-out',
      }}
      className={`relative group text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan ${
        isSelected ? 'opacity-0 pointer-events-none' : ''
      }`}
    >
      {/* ── Outer Folder Container (Entire folder unit transforms together on hover) ── */}
      <div className="w-56 h-36 md:w-64 md:h-40 relative flex flex-col group-hover:-translate-y-3 group-hover:scale-[1.08] transition-all duration-300">
        
        {/* ── Folder Top Tab ── */}
        <div 
          className="w-28 h-6 rounded-t-lg px-3 py-0.5 flex items-center justify-between border-t border-l border-r text-[9px] font-mono tracking-widest transition-all duration-300 relative z-10"
          style={{
            background: 'linear-gradient(180deg, rgba(20, 28, 46, 0.95) 0%, rgba(13, 17, 28, 0.98) 100%)',
            borderColor: `${event.accentColor}66`,
            boxShadow: `0 -4px 15px rgba(0,0,0,0.4)`,
          }}
        >
          <span 
            className="truncate font-bold tracking-wider transition-colors duration-300 group-hover:text-white"
            style={{ color: event.accentColor }}
          >
            {event.category}
          </span>
          <div 
            className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover:scale-125"
            style={{ backgroundColor: event.accentColor, boxShadow: `0 0 6px ${event.accentColor}` }}
          />
        </div>

        {/* ── Folder Main Body ── */}
        <div
          className="flex-1 rounded-b-xl rounded-tr-xl p-4 flex flex-col justify-between border relative overflow-hidden backdrop-blur-md shadow-lg transition-all duration-300 -mt-px"
          style={{
            background: 'linear-gradient(135deg, rgba(13, 18, 30, 0.96) 0%, rgba(7, 10, 18, 0.99) 100%)',
            borderColor: `${event.accentColor}66`,
            boxShadow: `0 10px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)`,
          }}
        >
          {/* Subtle Cyber Grid Lines inside Folder */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${event.accentColor} 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
            }}
          />

          {/* Top Accent Strip */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, ${event.accentColor}, transparent)` }}
          />

          {/* Header Row inside Folder */}
          <div className="flex justify-between items-start z-10">
            <span className="font-mono text-[10px] tracking-widest text-white/50 uppercase font-semibold">
              {event.date}
            </span>
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: event.accentColor, boxShadow: `0 0 10px ${event.accentColor}` }}
            />
          </div>

          {/* Center Printed Event Name */}
          <div className="my-auto z-10">
            <h3 
              className="font-display text-xl md:text-2xl uppercase font-bold tracking-tight text-text-primary group-hover:text-white transition-colors"
              style={{ textShadow: `0 2px 12px ${event.accentColor}40` }}
            >
              {event.title}
            </h3>
          </div>

          {/* Footer Badge */}
          <div className="flex justify-between items-center z-10 pt-2 border-t border-white/10">
            <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">
              ARCHIVE // RECAP
            </span>
            <span 
              className="font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold tracking-wider"
              style={{ color: event.accentColor }}
            >
              OPEN →
            </span>
          </div>

          {/* Hover Glow Overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
            style={{
              boxShadow: `0 0 40px ${event.accentColor}45, inset 0 0 20px ${event.accentColor}20`,
            }}
          />
        </div>
      </div>
    </button>
  );
};
