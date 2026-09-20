import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Tag, ExternalLink } from 'lucide-react';
import { useEventsStore } from '../../store/useEventsStore';
import { events } from '../../data/events';

export const EventDetailDialog = () => {
  const activeEventId    = useEventsStore((state) => state.activeEventId);
  const setActiveEventId = useEventsStore((state) => state.setActiveEventId);

  const activeEvent = events.find(e => e.id === activeEventId);
  const handleClose = () => setActiveEventId(null);

  // Pick a contrasting text color for the accent-colored header band
  const isDarkAccent = (hex) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return (0.299*r + 0.587*g + 0.114*b) < 186;
  };

  return (
    <Dialog.Root open={!!activeEvent} onOpenChange={(open) => !open && handleClose()}>
      <AnimatePresence>
        {activeEvent && (
          <Dialog.Portal forceMount>
            {/* ── Full-screen backdrop with heavy blur ── */}
            <Dialog.Overlay asChild>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="fixed inset-0 z-50"
                style={{ backgroundColor: 'rgba(4, 6, 11, 0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
              />
            </Dialog.Overlay>

            {/* ── Centered big modal card ── */}
            <Dialog.Content asChild>
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.88, y: 32 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{    opacity: 0, scale: 0.92,  y: 16 }}
                transition={{ type: 'spring', damping: 28, stiffness: 280, duration: 0.45 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
              >
                <div
                  className="relative w-full max-w-2xl pointer-events-auto outline-none overflow-hidden rounded-2xl"
                  style={{
                    background: 'linear-gradient(145deg, #0d111c 0%, #0a0e18 100%)',
                    border: `1.5px solid ${activeEvent.accentColor}55`,
                    boxShadow: `0 0 80px ${activeEvent.accentColor}25, 0 0 0 1px ${activeEvent.accentColor}18, 0 32px 80px rgba(0,0,0,0.6)`,
                  }}
                >
                  {/* ── Accent top bar ── */}
                  <div
                    className="w-full h-1.5"
                    style={{ background: `linear-gradient(90deg, ${activeEvent.accentColor}, ${activeEvent.accentColor}66)` }}
                  />

                  {/* ── Header band ── */}
                  <div
                    className="px-8 pt-8 pb-6"
                    style={{
                      background: `linear-gradient(180deg, ${activeEvent.accentColor}18 0%, transparent 100%)`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        {/* Code + tag pill */}
                        <div className="flex items-center gap-3">
                          <span
                            className="font-mono text-xs tracking-[0.2em] uppercase font-bold px-3 py-1 rounded-full"
                            style={{
                              background: `${activeEvent.accentColor}22`,
                              color: activeEvent.accentColor,
                              border: `1px solid ${activeEvent.accentColor}55`,
                            }}
                          >
                            {activeEvent.code}
                          </span>
                          <span className="font-mono text-xs tracking-widest uppercase text-white/40">
                            {activeEvent.tags[0]}
                          </span>
                        </div>

                        {/* Title */}
                        <Dialog.Title
                          className="font-display text-5xl uppercase tracking-tighter leading-none mt-1"
                          style={{ color: '#FFFFFF' }}
                        >
                          {activeEvent.title}
                        </Dialog.Title>

                        {/* Tagline */}
                        <p
                          className="font-mono text-sm mt-1"
                          style={{ color: `${activeEvent.accentColor}cc` }}
                        >
                          {activeEvent.tagline}
                        </p>
                      </div>

                      {/* Close button */}
                      <Dialog.Close asChild>
                        <button
                          className="flex-shrink-0 text-white/40 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/30 rounded-full p-2 mt-1 focus:outline-none"
                          style={{ backdropFilter: 'blur(4px)' }}
                        >
                          <X size={18} />
                        </button>
                      </Dialog.Close>
                    </div>
                  </div>

                  {/* ── Divider ── */}
                  <div className="h-px mx-8" style={{ background: `${activeEvent.accentColor}22` }} />

                  {/* ── Body ── */}
                  <div className="px-8 py-7 flex flex-col gap-6">
                    {/* Meta row */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} style={{ color: activeEvent.accentColor }} />
                          <span className="font-mono text-xs text-white/40 tracking-widest uppercase">Date & Time</span>
                        </div>
                        <p className="font-mono text-sm text-white font-medium">
                          {activeEvent.date}
                        </p>
                        <p className="font-mono text-sm text-white/70">
                          {activeEvent.time}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <MapPin size={13} style={{ color: activeEvent.accentColor }} />
                          <span className="font-mono text-xs text-white/40 tracking-widest uppercase">Location</span>
                        </div>
                        <p className="font-mono text-sm text-white font-medium">
                          {activeEvent.venue}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Tag size={13} style={{ color: activeEvent.accentColor }} />
                        <span className="font-mono text-xs text-white/40 tracking-widest uppercase">About</span>
                      </div>
                      <Dialog.Description className="font-mono text-sm text-white/65 leading-relaxed">
                        {activeEvent.description}
                      </Dialog.Description>
                    </div>

                    {/* CTA button */}
                    <a
                      href={activeEvent.ctaHref}
                      className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-mono text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] outline-none focus:ring-2"
                      style={{
                        background: `linear-gradient(135deg, ${activeEvent.accentColor} 0%, ${activeEvent.accentColor}bb 100%)`,
                        color: isDarkAccent(activeEvent.accentColor) ? '#FFFFFF' : '#000000',
                        boxShadow: `0 0 30px ${activeEvent.accentColor}55, 0 4px 20px ${activeEvent.accentColor}33`,
                      }}
                    >
                      {activeEvent.ctaLabel}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
