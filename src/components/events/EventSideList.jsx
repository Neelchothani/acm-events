import React from 'react';
import { useEventsStore } from '../../store/useEventsStore';
import { events } from '../../data/events';

export const EventSideList = () => {
  const unlockedFaces     = useEventsStore((state) => state.unlockedFaces);
  const setFocusingFaceIdx = useEventsStore((state) => state.setFocusingFaceIdx);

  return (
    <div className="flex flex-col gap-3 mt-8">
      {events.map((evt, idx) => {
        const isUnlocked = unlockedFaces[idx];

        return (
          <button
            key={evt.id}
            onClick={() => isUnlocked && setFocusingFaceIdx(idx)}
            disabled={!isUnlocked}
            className="flex items-center gap-4 text-left transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-cyan cursor-default"
            style={{ opacity: 1 }}  /* always fully visible */
          >
            {/* Colour swatch — filled + glowing when unlocked, outlined when locked */}
            <div
              className="w-6 h-6 rounded flex-shrink-0 border-2 transition-all duration-500"
              style={{
                backgroundColor: isUnlocked ? evt.accentColor : 'transparent',
                borderColor:      isUnlocked ? evt.accentColor : 'rgba(255,255,255,0.25)',
                boxShadow:        isUnlocked ? `0 0 12px ${evt.accentColor}80` : 'none',
              }}
            >
              {/* Lock icon when not yet solved */}
              {!isUnlocked && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.30)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-full h-full p-0.5"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </div>

            {/* Label — always white, unlocked items get the accent glow */}
            <span
              className="font-mono text-sm tracking-wide transition-all duration-500"
              style={{
                color:      isUnlocked ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                textShadow: isUnlocked ? `0 0 8px ${evt.accentColor}60` : 'none',
                cursor:     isUnlocked ? 'pointer' : 'default',
              }}
            >
              {evt.code} — {evt.title}
            </span>
          </button>
        );
      })}
    </div>
  );
};
