import React, { useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { X } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200">
      <div className="absolute top-0 right-0 p-4 z-10">
        <button 
          onClick={onClose}
          className="p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div 
        className="flex-1 w-full h-full flex items-center justify-center touch-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={4}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
          doubleClick={{ step: 1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <React.Fragment>
              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                <img 
                  src={src} 
                  alt={alt || "Viewed image"} 
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </TransformComponent>
            </React.Fragment>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}
