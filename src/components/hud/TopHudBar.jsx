import React from 'react';
import { Menu, Globe } from 'lucide-react';

export const TopHudBar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-panel border-b border-border-hairline backdrop-blur-sm">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border border-text-muted flex items-center justify-center font-display text-text-primary text-sm font-bold">
          AC
        </div>
        <span className="font-display font-bold tracking-tight text-text-primary hidden sm:inline-block">
          ACM EVENTS
        </span>
      </div>

      {/* Center: Breadcrumb (Desktop) */}
      <div className="hidden md:flex font-mono text-xs text-text-muted tracking-wider">
        <span>BOULEVARD</span>
        <span className="mx-2">/</span>
        <span>EVENTS</span>
        <span className="mx-2">/</span>
        <span className="text-cyan">SOLVE TO UNLOCK</span>
      </div>

      {/* Right: Nav Pills & Mobile Menu */}
      <div className="flex items-center gap-4">
        {/* Desktop Pills */}
        <div className="hidden md:flex gap-3">
          <a href="#" className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-hairline text-text-muted text-xs font-mono hover:text-text-body transition-colors">
            <Globe size={14} />
            GLOBE VIEW
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan text-cyan text-xs font-mono glow-cyan bg-cyan/5">
            EVENTS
          </a>
        </div>
        {/* Mobile Menu Icon */}
        <button className="md:hidden text-text-primary p-1">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};
