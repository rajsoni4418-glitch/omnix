import React, { useRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface OptimizedVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

export default function OptimizedVideo({ 
  src, 
  poster,
  className = '', 
  autoPlay = false,
  ...props 
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref, inView } = useInView({
    threshold: 0.5, // 50% of video must be visible
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    
    if (inView && autoPlay) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented
          console.warn("Autoplay prevented for video");
        });
      }
    } else if (!inView) {
      videoRef.current.pause();
    }
  }, [inView, autoPlay]);

  return (
    <div ref={ref} className={`relative overflow-hidden bg-zinc-900 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10 animate-pulse">
           {poster && <img src={poster} className="w-full h-full object-cover opacity-50 blur-sm" alt="Loading..." />}
        </div>
      )}
      
      <video
        ref={videoRef}
        src={src}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        poster={poster}
        playsInline
        preload="metadata" // Only preload metadata, save bandwidth
        onLoadedData={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
}
