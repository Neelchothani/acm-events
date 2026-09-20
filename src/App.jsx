import React, { useState, useEffect } from 'react';
import { TopHudBar } from './components/hud/TopHudBar';
import { EventsExperience } from './components/cube/EventsExperience';
import { AccessibleFallbackList } from './components/events/AccessibleFallbackList';
import { ArchiveSection } from './components/archive/ArchiveSection';
import { EventDetailDialog } from './components/events/EventDetailDialog';
import { getRenderMode } from './utils/getRenderMode';

function App() {
  const [renderMode, setRenderMode] = useState({ useFallback: false, prefersReducedMotion: false });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setRenderMode(getRenderMode());
    setIsReady(true);
  }, []);

  if (!isReady) return <div className="h-screen bg-background" />;

  return (
    <>
      <TopHudBar />
      
      <main>
        {renderMode.useFallback ? (
          <AccessibleFallbackList />
        ) : (
          <EventsExperience />
        )}

        <ArchiveSection />
      </main>

      {/* The 3D experience has its own dialog embedded inside its root to sit over the canvas overlay, 
          but for fallback we render it here */}
      {renderMode.useFallback && <EventDetailDialog />}
    </>
  );
}

export default App;
