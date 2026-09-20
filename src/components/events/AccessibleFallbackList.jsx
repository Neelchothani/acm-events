import React from 'react';
import { events } from '../../data/events';
import { useEventsStore } from '../../store/useEventsStore';

export const AccessibleFallbackList = () => {
  const setActiveEventId = useEventsStore((state) => state.setActiveEventId);

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 md:px-8 max-w-3xl mx-auto">
      <div className="mb-16">
        <h1 className="font-display text-4xl md:text-5xl text-text-primary tracking-tighter uppercase mb-4">
          Event Protocol
        </h1>
        <p className="font-mono text-text-muted text-sm">
          Reduced motion mode enabled. All events are listed below.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {events.map((evt) => (
          <button
            key={evt.id}
            onClick={() => setActiveEventId(evt.id)}
            className="text-left bg-panel p-6 rounded-xl border border-border-hairline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan hover:bg-panel/80 transition-colors"
            style={{ borderLeft: `4px solid ${evt.accentColor}` }}
          >
            <div className="font-mono text-xs mb-2 uppercase tracking-widest" style={{ color: evt.accentColor }}>
              {evt.code} — {evt.tags[0]}
            </div>
            <h2 className="font-display text-2xl text-text-primary mb-2 uppercase">{evt.title}</h2>
            
            <div className="font-mono text-xs text-text-body mb-4">
              {evt.date} // {evt.time} @ {evt.venue}
            </div>

            <p className="font-mono text-sm text-text-muted leading-relaxed mb-6">
              {evt.description}
            </p>
            
            <span className="font-mono text-xs font-bold tracking-widest" style={{ color: evt.accentColor }}>
              VIEW DETAILS →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
