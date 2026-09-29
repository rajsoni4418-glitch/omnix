import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface Point {
  x: number;
  y: number;
}

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface ImageCropperProps {
  imageSrc: string;
  aspectRatio: number;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  shape?: 'rect' | 'round';
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const rotRad = getRadianAngle(rotation);

  const bBoxWidth =
    Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
  const bBoxHeight =
    Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('No 2d context');
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((file) => {
      if (file) {
        resolve(file);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg', 0.9);
  });
}

export default function ImageCropper({ imageSrc, aspectRatio, onCropComplete, onCancel, shape = 'rect' }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      const compressedFile = await imageCompression(new File([croppedBlob], 'image.jpg', { type: 'image/jpeg' }), {
        maxSizeMB: 1,
        maxWidthOrHeight: 1080,
        useWebWorker: true
      });
      
      onCropComplete(compressedFile);
    } catch (e) {
      console.error('Error cropping image:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-black">
        <button onClick={onCancel} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-white">Crop Image</h2>
        <button 
          onClick={handleSave} 
          disabled={isProcessing}
          className="p-2 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
        >
          {isProcessing ? <span className="animate-pulse">Saving...</span> : <Check className="w-6 h-6" />}
        </button>
      </div>
      
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={onZoomChange}
          cropShape={shape}
          showGrid={true}
        />
      </div>
      
      <div className="p-6 bg-black flex items-center justify-center gap-4">
        <span className="text-zinc-400 text-sm">Zoom</span>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full max-w-sm accent-purple-500"
        />
      </div>
    </div>
  );
}
