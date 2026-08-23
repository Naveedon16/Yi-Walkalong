import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_IMAGES, GalleryImage } from './GalleryImage';
import { motion, AnimatePresence } from 'motion/react';

export function GallerySlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    }, 4500);
    
    return () => clearInterval(interval);
  }, [isHovered]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
  };

  return (
    <div 
      className="relative overflow-hidden rounded-[32px] border border-[#eaddff] bg-[#f3edf7] dark:bg-purple-900/20 aspect-[4/3] md:aspect-[21/9] w-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <GalleryImage
            src={GALLERY_IMAGES[currentIndex]}
            alt={`WalkAlong event ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={goToPrevious}
          aria-label="Previous photo"
          className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          aria-label="Next photo"
          className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
        {currentIndex + 1} / {GALLERY_IMAGES.length}
      </div>
    </div>
  );
}
