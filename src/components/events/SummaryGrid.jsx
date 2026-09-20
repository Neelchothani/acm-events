import React from 'react';
import { events } from '../../data/events';
import { useEventsStore } from '../../store/useEventsStore';

export const SummaryGrid = () => {
  const setActiveEventId = useEventsStore((state) => state.setActiveEventId);

  return (
    <section id="all-events" className="min-h-screen bg-background relative z-10 py-24 px-4 md:px-8 lg:px-16 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="mb-16">
          <h2 className="font-display text-4xl md:text-6xl text-text-primary tracking-tighter uppercase mb-4">
            All Events.
          </h2>
          <p className="font-mono text-text-muted text-sm max-w-lg">
            Review all scheduled protocols. Select any event to view full coordinates and registration details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <button
              key={evt.id}
              onClick={() => setActiveEventId(evt.id)}
              className="text-left bg-panel p-6 rounded-xl border border-border-hairline hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan group relative overflow-hidden"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = evt.accentColor;
                e.currentTarget.style.boxShadow = `0 0 15px ${evt.accentColor}30, inset 0 0 10px ${evt.accentColor}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div 
                className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-30"
                style={{ backgroundColor: evt.accentColor }}
              />
              <div className="font-mono text-xs mb-4 uppercase" style={{ color: evt.accentColor }}>
                {evt.code}
              </div>
              <h3 className="font-display text-2xl text-text-primary mb-2 uppercase">{evt.title}</h3>
              <p className="font-mono text-xs text-text-muted line-clamp-2">
                {evt.description}
              </p>
              
              <div className="mt-8 font-mono text-xs flex justify-between items-center text-text-body">
                <span>{evt.date}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" style={{ color: evt.accentColor }}>
                  VIEW DETAILS →
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-24 text-center">
          <a href="#" className="inline-block px-8 py-3 bg-panel border border-border-hairline text-text-body font-mono text-sm tracking-widest hover:text-cyan hover:border-cyan transition-colors">
            ← BACK TO BOULEVARD
          </a>
        </div>
      </div>
    </section>
  );
};
