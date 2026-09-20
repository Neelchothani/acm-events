import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { archivedEvents } from '../../data/archivedEvents';
import { ArchiveCarousel } from './ArchiveCarousel';
import { ArchiveViewer } from './ArchiveViewer';

/**
 * ArchiveSection
 *
 * Additive archive section placed after SummaryGrid / Rubik's cube experience.
 * Displays:
 * - Italic, understated, elegant section label "OUR ARCHIVES" with scroll reveal animation
 * - Digital city atmospheric background extensions
 * - Continuous infinite 3D marquee folder carousel
 * - ArchiveViewer for folder-to-center opening flow
 */

export const ArchiveSection = () => {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [sourceRect, setSourceRect] = useState(null);

  const handleSelectFolder = (evt, rect) => {
    setSourceRect(rect);
    setSelectedFolder(evt);
  };

  const handleClose = () => {
    setSelectedFolder(null);
  };

  return (
    <section 
      id="our-archives" 
      className="w-full relative z-10 py-24 overflow-hidden"
    >
      {/* ── Ambient Glow Blobs ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-72 bg-cyan/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-64 h-64 bg-magenta/5 blur-3xl rounded-full pointer-events-none" />

      {/* ── Section Title Header with Subtle Entrance Motion ── */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 md:px-8 mb-8 text-center flex flex-col items-center relative z-10"
      >
        <span className="font-display italic text-base md:text-lg text-text-muted tracking-[0.25em] uppercase mb-2 select-none">
          OUR ARCHIVES
        </span>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
      </motion.div>

      {/* Infinite Horizontal Marquee Folder Carousel */}
      <ArchiveCarousel
        events={archivedEvents}
        selectedFolder={selectedFolder}
        onSelectFolder={handleSelectFolder}
      />

      {/* Continuous Center Travel & 3D Opening Viewer */}
      <ArchiveViewer
        selectedFolder={selectedFolder}
        sourceRect={sourceRect}
        onClose={handleClose}
      />
    </section>
  );
};

