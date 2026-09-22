import React, { useState, useEffect } from 'react';
import { useEventsStore } from '../../store/useEventsStore';

export const ScrollHint = () => {
  const [isVisible, setIsVisible] = useState(true);
  const isSolved = useEventsStore(state => state.isSolved);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(false);
      }
    };
    
    const handleWheelOrTouch = () => {
      setIsVisible(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheelOrTouch, { passive: true });
    window.addEventListener('touchstart', handleWheelOrTouch, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheelOrTouch);
      window.removeEventListener('touchstart', handleWheelOrTouch);
    };
  }, []);

  return (
    <div 
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-32 z-40 pointer-events-none transition-opacity duration-1000 ${isVisible && !isSolved ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="px-4 py-2 rounded-full border border-border-hairline bg-panel font-mono text-xs text-text-muted shadow-lg animate-pulse">
        <span className="text-cyan">[SCROLL]</span> forward to continue solving
      </div>
    </div>
  );
};
