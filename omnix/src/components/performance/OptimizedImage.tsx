import React, { useState, useEffect } from 'react';
import { Blurhash } from 'react-blurhash';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  blurhash?: string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export default function OptimizedImage({ 
  src, 
  alt = '', 
  blurhash, 
  className = '', 
  objectFit = 'cover',
  ...props 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Implement basic retry logic
  useEffect(() => {
    if (hasError && retryCount < 3) {
      const timer = setTimeout(() => {
        setHasError(false);
        setRetryCount(prev => prev + 1);
      }, 2000 * Math.pow(2, retryCount)); // Exponential backoff
      return () => clearTimeout(timer);
    }
  }, [hasError, retryCount]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder / Blurhash */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center">
           {blurhash ? (
             <Blurhash hash={blurhash} width="100%" height="100%" resolutionX={32} resolutionY={32} punch={1} />
           ) : null}
        </div>
      )}
      
      {/* Error state */}
      {hasError && retryCount >= 3 && (
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-zinc-500 text-xs text-center p-2">
          Failed to load image
        </div>
      )}

      {/* Actual Image */}
      {(!hasError || retryCount < 3) && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-${objectFit} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          {...props}
        />
      )}
    </div>
  );
}
