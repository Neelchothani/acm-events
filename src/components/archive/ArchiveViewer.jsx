import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Layers, ArrowLeft } from 'lucide-react';

/**
 * ArchiveViewer
 *
 * Handles the continuous screen-travel transition, 3D folder opening,
 * sequential emergence of 3-4 images, and return transition on close.
 */

export const ArchiveViewer = ({
  selectedFolder,
  sourceRect,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  useEffect(() => {
    if (selectedFolder) {
      // Trigger 3D opening after folder reaches center
      const timer = setTimeout(() => setIsOpen(true), 350);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
      setActiveLightboxImage(null);
    }
  }, [selectedFolder]);

  if (!selectedFolder) return null;

  const handleImageLoad = (idx) => {
    setImagesLoaded((prev) => ({ ...prev, [idx]: true }));
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {selectedFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
            {/* ── Backdrop Blur Overlay ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={onClose}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl cursor-pointer"
            />

            {/* ── Continuous Travel Folder Container ── */}
            <motion.div
              layoutId={`archive-folder-${selectedFolder.id}`}
              initial={
                sourceRect
                  ? {
                      x: sourceRect.left - window.innerWidth / 2 + sourceRect.width / 2,
                      y: sourceRect.top - window.innerHeight / 2 + sourceRect.height / 2,
                      scale: 0.85,
                    }
                  : { scale: 0.8, y: 40, opacity: 0 }
              }
              animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              exit={
                sourceRect
                  ? {
                      x: sourceRect.left - window.innerWidth / 2 + sourceRect.width / 2,
                      y: sourceRect.top - window.innerHeight / 2 + sourceRect.height / 2,
                      scale: 0.8,
                      opacity: 0,
                    }
                  : { scale: 0.8, y: 40, opacity: 0 }
              }
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="relative z-10 w-full max-w-5xl px-4 md:px-8 pt-20 pb-6 flex flex-col items-center max-h-screen overflow-y-auto no-scrollbar"
            >
              {/* Top Close Bar */}
              <div className="w-full flex justify-between items-center mb-4">
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-hairline bg-panel text-text-muted text-xs font-mono tracking-widest hover:text-cyan hover:border-cyan transition-all group shadow-md"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span>BACK TO ARCHIVES</span>
                </button>

                <div className="font-mono text-xs tracking-widest text-text-muted flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: selectedFolder.accentColor }} />
                  <span>ARCHIVE // {selectedFolder.category}</span>
                </div>
              </div>

              {/* Main 3D Interactive Folder Experience Card */}
              <div
                className="w-full bg-panel/95 rounded-2xl border p-5 md:p-8 relative overflow-hidden shadow-2xl flex flex-col gap-6"
                style={{
                  borderColor: `${selectedFolder.accentColor}44`,
                  boxShadow: `0 0 70px ${selectedFolder.accentColor}25, inset 0 0 35px ${selectedFolder.accentColor}12`,
                }}
              >
                {/* Header Title & Tagline */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span
                        className="font-mono text-[10px] tracking-[0.2em] font-bold px-2.5 py-0.5 rounded-full uppercase"
                        style={{
                          backgroundColor: `${selectedFolder.accentColor}22`,
                          color: selectedFolder.accentColor,
                          border: `1px solid ${selectedFolder.accentColor}44`,
                        }}
                      >
                        {selectedFolder.date}
                      </span>
                      <span className="font-mono text-xs text-white/50 uppercase tracking-widest">
                        {selectedFolder.category}
                      </span>
                    </div>
                    <h2 className="font-display text-3xl md:text-5xl uppercase tracking-tight text-white font-bold">
                      {selectedFolder.title}
                    </h2>
                  </div>

                  <p className="font-mono text-xs text-text-muted max-w-md leading-relaxed">
                    {selectedFolder.description}
                  </p>
                </div>

                {/* ── 3D Folder Container & Emerged Photos Stack ── */}
                <div className="w-full relative min-h-[320px] md:min-h-[380px] flex items-center justify-center my-1 perspective-1000">
                  
                  {/* 3D Folder Body Container */}
                  <div 
                    className="w-72 h-44 md:w-96 md:h-56 rounded-xl border relative shadow-2xl z-0 overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, rgba(13, 18, 31, 0.98) 0%, rgba(7, 10, 18, 0.99) 100%)',
                      borderColor: `${selectedFolder.accentColor}55`,
                      boxShadow: `0 20px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)`,
                    }}
                  >
                    {/* Cyber Grid Lines & Flap Label */}
                    <div 
                      className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(${selectedFolder.accentColor} 1px, transparent 1px)`,
                        backgroundSize: '16px 16px',
                      }}
                    />

                    {/* 3D Rotating Front Flap */}
                    <motion.div
                      initial={{ rotateX: 0 }}
                      animate={{ rotateX: isOpen ? -115 : 0 }}
                      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        transformOrigin: 'bottom center',
                        transformStyle: 'preserve-3d',
                        background: 'linear-gradient(180deg, rgba(18, 25, 42, 0.95) 0%, rgba(10, 14, 24, 0.98) 100%)',
                        borderColor: `${selectedFolder.accentColor}66`,
                      }}
                      className="absolute inset-0 rounded-xl p-5 flex flex-col justify-between border-t"
                    >
                      <div className="flex justify-between items-center text-xs font-mono opacity-50">
                        <span>CONFIDENTIAL // RECAP</span>
                        <Layers size={16} style={{ color: selectedFolder.accentColor }} />
                      </div>

                      <div className="text-center opacity-40">
                        <span className="font-display text-lg md:text-xl uppercase font-bold tracking-widest text-white">
                          {selectedFolder.title}
                        </span>
                      </div>

                      <div className="flex justify-between items-center font-mono text-[10px] opacity-40">
                        <span>{selectedFolder.date}</span>
                        <span>OPENING...</span>
                      </div>
                    </motion.div>

                    {/* Folder Internal Compartment Base */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center opacity-30">
                      <Layers size={36} style={{ color: selectedFolder.accentColor }} className="mb-2" />
                      <span className="font-mono text-xs tracking-widest uppercase text-white/60">
                        DIGITAL MEMORY VAULT
                      </span>
                    </div>
                  </div>

                  {/* ── Dynamic Emerged Event Images Stack ── */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none overflow-visible">
                    {selectedFolder.images.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="absolute flex flex-col items-center gap-3 text-center pointer-events-none"
                        style={{ top: '-80px' }}
                      >
                        <div
                          className="w-20 h-20 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: `${selectedFolder.accentColor}66`,
                            background: `radial-gradient(circle, ${selectedFolder.accentColor}15, transparent)`,
                          }}
                        >
                          <Layers size={32} style={{ color: selectedFolder.accentColor }} className="opacity-60" />
                        </div>
                        <span
                          className="font-mono text-xs tracking-[0.2em] uppercase font-bold"
                          style={{ color: selectedFolder.accentColor }}
                        >
                          COMING SOON
                        </span>
                        <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase">
                          ARCHIVE PHOTOS — DROPPING SOON
                        </span>
                      </motion.div>
                    ) : (
                      selectedFolder.images.map((imgUrl, idx) => {
                        const total = selectedFolder.images.length;
                        let cfg;
                        
                        if (total === 1) {
                          cfg = { x: 0, y: -30, rotate: 0, scale: 1.15 };
                        } else if (total === 3) {
                          const threeOffsets = [
                            { x: -170, y: -25, rotate: -6, scale: 1.02 },
                            { x: 0,    y: -48, rotate: 0,  scale: 1.08 },
                            { x: 170,  y: -25, rotate: 6,  scale: 1.02 },
                          ];
                          cfg = threeOffsets[idx % 3];
                        } else {
                          const fourOffsets = [
                            { x: -210, y: -25, rotate: -8, scale: 1.0 },
                            { x: -70,  y: -45, rotate: -3, scale: 1.05 },
                            { x: 70,   y: -20, rotate: 4,  scale: 1.02 },
                            { x: 210,  y: -40, rotate: 9,  scale: 0.98 },
                          ];
                          cfg = fourOffsets[idx % 4];
                        }

                        return (
                          <motion.div
                            key={idx}
                            initial={{ x: 0, y: 60, opacity: 0, rotate: 0, scale: 0.6 }}
                            animate={
                              isOpen
                                ? {
                                    x: cfg.x,
                                    y: cfg.y,
                                    opacity: 1,
                                    rotate: cfg.rotate,
                                    scale: cfg.scale,
                                  }
                                : { x: 0, y: 60, opacity: 0, scale: 0.6 }
                            }
                            transition={{
                              type: 'spring',
                              damping: 22,
                              stiffness: 200,
                              delay: isOpen ? 0.15 + idx * 0.1 : 0,
                            }}
                            onClick={() => setActiveLightboxImage({ url: imgUrl, idx })}
                            className="absolute w-52 h-36 sm:w-64 sm:h-44 md:w-80 md:h-56 lg:w-88 lg:h-60 rounded-xl border overflow-hidden pointer-events-auto shadow-2xl group hover:z-40 hover:scale-115 transition-all duration-300 cursor-pointer"
                            style={{
                              borderColor: `${selectedFolder.accentColor}77`,
                              boxShadow: `0 16px 45px rgba(0,0,0,0.85), 0 0 25px ${selectedFolder.accentColor}35`,
                            }}
                          >
                            {/* Lazy Loaded High-Res Photo */}
                            <img
                              src={imgUrl}
                              alt={`${selectedFolder.title} memory ${idx + 1}`}
                              loading="lazy"
                              onLoad={() => handleImageLoad(idx)}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />

                            {/* Photo Number Tag */}
                            <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md font-mono text-[10px] text-white/90 border border-white/20 font-bold tracking-wider flex items-center gap-1.5">
                              <span>IMG_0{idx + 1}</span>
                              <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-cyan">🔍 CLICK TO EXPAND</span>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center border-t border-white/10 pt-3 font-mono text-xs text-text-muted">
                  <span className="hidden sm:inline">
                    {selectedFolder.images.length > 0
                      ? `${selectedFolder.images.length} ARCHIVED RECAP MEDIA FILES — CLICK ANY PHOTO TO VIEW FULLSCREEN`
                      : 'NO ARCHIVE MEDIA YET — CHECK BACK SOON'
                    }
                  </span>
                  <button
                    onClick={onClose}
                    className="ml-auto flex items-center gap-2 text-cyan hover:underline font-bold tracking-wider"
                  >
                    CLOSE ARCHIVE ✕
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Separate Fullscreen Lightbox Preview Modal ── */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/92 backdrop-blur-2xl pointer-events-auto"
            onClick={() => setActiveLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative max-w-5xl max-h-[92vh] flex flex-col items-center group cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Bar */}
              <div className="w-full flex justify-between items-center mb-3 text-xs font-mono text-white/70">
                <div className="flex items-center gap-3">
                  <span style={{ color: selectedFolder.accentColor }} className="font-bold tracking-widest uppercase">
                    {selectedFolder.title}
                  </span>
                  <span className="text-white/40">//</span>
                  <span className="text-white/80">IMG_0{activeLightboxImage.idx + 1}</span>
                </div>
                <button
                  onClick={() => setActiveLightboxImage(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs font-mono"
                >
                  <X size={16} />
                  <span>CLOSE</span>
                </button>
              </div>

              {/* Large Image Frame */}
              <div 
                className="rounded-2xl overflow-hidden border shadow-2xl relative max-h-[82vh] flex items-center justify-center bg-black/50"
                style={{
                  boxShadow: `0 0 60px ${selectedFolder.accentColor}40`,
                  borderColor: `${selectedFolder.accentColor}88`,
                }}
              >
                <img
                  src={activeLightboxImage.url}
                  alt={`${selectedFolder.title} expanded memory ${activeLightboxImage.idx + 1}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
