import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_IMAGES, GalleryImage } from '../components/GalleryImage';

export function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const closeLightbox = () => setSelectedIndex(null);

  const goToPrevious = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(prev => (prev === null || prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1));
  }, [selectedIndex]);

  const goToNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(prev => (prev === null ? null : (prev + 1) % GALLERY_IMAGES.length));
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, goToPrevious, goToNext]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-10">
        <Link to="/" className="inline-flex items-center text-[#6750a4] hover:underline font-medium mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <h1 className="text-4xl lg:text-5xl font-bold text-[#1d1b20]  mb-4">Moments of Joy</h1>
        <p className="text-[#49454f]  text-xl">Glimpses from our previous editions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {GALLERY_IMAGES.map((src, i) => (
          <div
            key={src}
            onClick={() => setSelectedIndex(i)}
            className="relative overflow-hidden rounded-[32px] border border-[#eaddff]  bg-[#f3edf7]  group cursor-pointer aspect-[4/3] focus:outline-none focus:ring-4 focus:ring-[#6750a4]" tabIndex={0} onKeyDown={(e) => { if(e.key === 'Enter') setSelectedIndex(i); }}
          >
            <GalleryImage
              src={src}
              alt={`WalkAlong event ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog" aria-modal="true" aria-label="Image lightbox"
          onClick={closeLightbox}
        >
          <div 
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full transition-colors focus:ring-2 focus:ring-white focus:outline-none"
              aria-label="Close image lightbox" autoFocus
            >
              <X className="w-6 h-6" />
            </button>
            
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-3 rounded-full transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <img
              src={GALLERY_IMAGES[selectedIndex]}
              alt={`WalkAlong event ${selectedIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-3 rounded-full transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white font-medium bg-black/50 px-4 py-2 rounded-full text-sm">
              {selectedIndex + 1} / {GALLERY_IMAGES.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
