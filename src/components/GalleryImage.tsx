import React, { useState } from 'react';

export const GALLERY_IMAGES = [
  '/1Z6A4375.JPG',
  '/627A0979.JPG',
  '/1Z6A4287.JPG',
  '/627A1000.JPG',
  '/627A1002.JPG',
  '/1Z6A4344.JPG',
];

export function GalleryImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-[#eaddff]/30 text-[#6750a4] ${className || ''}`}>
        <span className="text-sm font-medium">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
