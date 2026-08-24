import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrcs?: string[];
}

export function SafeImage({ src, fallbackSrcs = [], ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  useEffect(() => {
    setImgSrc(src);
    setFallbackIndex(0);
  }, [src]);

  const handleError = () => {
    if (fallbackIndex < fallbackSrcs.length) {
      setImgSrc(fallbackSrcs[fallbackIndex]);
      setFallbackIndex(prev => prev + 1);
    }
  };

  return (
    <img
      {...props}
      src={imgSrc}
      onError={handleError}
    />
  );
}
