import React, { useEffect, useRef, useState } from 'react';
import { useEventsStore } from '../../store/useEventsStore';
import { useScrollBridge } from '../../store/useScrollBridge';
import { events } from '../../data/events';

export const ProgressRail = () => {
  const unlockedFaces = useEventsStore((state) => state.unlockedFaces);
  const percentRef = useRef(null);
  const [inCubeSection, setInCubeSection] = useState(true);

  // Update traversal % every frame
  useEffect(() => {
    let raf;
    const update = () => {
      if (percentRef.current) {
        const offset = useScrollBridge.getState().offset;
        const pct = Math.round(offset * 100);
        percentRef.current.innerText = `${pct}%`;
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Hide the rail when the archives section scrolls into view
  useEffect(() => {
    const archiveSection = document.getElementById('our-archives');
    if (!archiveSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When archives enter viewport, hide the rail; when they leave, show it again
        setInCubeSection(!entry.isIntersecting);
      },
      { threshold: 0.05 } // trigger as soon as 5% of the section is visible
    );

    observer.observe(archiveSection);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col items-center justify-center w-16 pointer-events-none transition-opacity duration-500"
      style={{ opacity: inCubeSection ? 1 : 0 }}
    >
      <div className="flex flex-col items-center gap-4 py-8 h-1/2 justify-between">
        <div className="flex flex-col gap-3">
          {events.map((evt, idx) => {
            const isUnlocked = unlockedFaces[idx];
            return (
              <div 
                key={evt.id} 
                className={`w-2 h-2 rounded-full border transition-colors duration-300 ${isUnlocked ? 'border-transparent' : 'border-text-muted'}`}
                style={{ 
                  backgroundColor: isUnlocked ? evt.accentColor : 'transparent',
                  boxShadow: isUnlocked ? `0 0 8px ${evt.accentColor}` : 'none'
                }}
              />
            );
          })}
        </div>
        
        {/* Vertical text label */}
        <div 
          className="font-mono text-[10px] text-text-muted tracking-widest whitespace-nowrap" 
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          CUBE TRAVERSAL — <span ref={percentRef} className="text-text-body">0%</span>
        </div>
      </div>
    </div>
  );
};
