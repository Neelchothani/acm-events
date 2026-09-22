import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CubeRig } from './CubeRig';
import { SceneBloom } from './SceneBloom';
import { ProgressRail } from '../hud/ProgressRail';
import { EventSideList } from '../events/EventSideList';
import { ScrollHint } from '../hud/ScrollHint';
import { EventDetailDialog } from '../events/EventDetailDialog';
import { useScrollBridge } from '../../store/useScrollBridge';
import { useEventsStore } from '../../store/useEventsStore';
import { CameraOffset } from './CameraOffset';
import { ScrambleHeading } from '../ui/ScrambleHeading';

/**
 * HUDOverlay — rendered OUTSIDE the Canvas tree as a plain DOM sibling of <Canvas>.
 * Pinned for the full duration of the cube scroll section.
 */
const HUDOverlay = () => {
  const overlayRef = useRef();
  const rafRef = useRef();

  React.useEffect(() => {
    const tick = () => {
      if (overlayRef.current) {
        overlayRef.current.style.opacity = 1;
        overlayRef.current.style.visibility = 'visible';
        overlayRef.current.setAttribute('aria-hidden', 'false');
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={overlayRef}
      style={{ opacity: 0 }}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-10"
    >
      <ProgressRail />
      <ScrollHint />

      <div className="absolute top-0 left-0 w-full lg:w-5/12 h-full flex flex-col justify-center px-6 md:px-16 lg:pl-56 pt-20 pointer-events-none">
        <div className="max-w-md pointer-events-none">
          <ScrambleHeading
            text="EVENTS."
            as="h1"
            className="font-display text-6xl md:text-7xl lg:text-8xl text-text-primary tracking-tighter leading-none mb-4 uppercase"
            duration={880}
            stagger={60}
            fps={38}
          />
          <p className="font-mono text-text-muted text-sm leading-relaxed mb-8">
            Decrypt the digital city. Solve the sequence to reveal upcoming events, workshops, and hackathons.
          </p>
          <div className="pointer-events-auto">
            <EventSideList />
          </div>
        </div>
      </div>
    </div>
  );
};

export const EventsExperience = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll = containerRef.current.clientHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const currentScroll = -rect.top;
      const offset = Math.max(0, Math.min(1, currentScroll / totalScroll));
      useScrollBridge.setState({ offset });
      if (offset >= 0.995) {
        useEventsStore.getState().setIsSolved(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const archiveSection = document.getElementById('our-archives');
    if (!archiveSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          useEventsStore.getState().setIsSolved(true);
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(archiveSection);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[600vh] md:h-[800vh] relative">
      {/* Sticky viewport — dot grid sits here so it shows through the transparent canvas */}
      <div
        className="sticky top-0 left-0 w-full h-screen overflow-hidden"
        style={{
          backgroundColor: '#04060B',
          backgroundImage: 'radial-gradient(rgba(38, 227, 239, 0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 9], fov: 42 }}
          gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
          shadows
          className="w-full h-full"
          style={{ background: 'transparent' }}
        >
          {/* No <color> attachment — canvas is transparent, dot grid shows through */}

          <ambientLight intensity={1.2} />
          <directionalLight
            position={[8, 12, 6]}
            intensity={2.0}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-8, -6, 4]} intensity={0.8} />
          <pointLight position={[-6, -4, 4]} intensity={0.8} color="#26E3EF" />

          <Suspense fallback={null}>
            <CubeRig />
            <CameraOffset offsetX={300} />
            <SceneBloom />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Suspense>
        </Canvas>

        {/* HUD overlay pinned over sticky canvas */}
        <HUDOverlay />

        {/* Dialog sits outside canvas */}
        <EventDetailDialog />
      </div>
    </div>
  );
};
