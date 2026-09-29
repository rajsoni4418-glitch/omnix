import React, { useState } from 'react';
import { X, Crop, RotateCw, Sun, Contrast, Droplet, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface PostEditorModalProps {
  mediaFile: File;
  previewUrl: string;
  onClose: () => void;
  onSave: (editedFile: File, newPreviewUrl: string) => void;
}

export default function PostEditorModal({ mediaFile, previewUrl, onClose, onSave }: PostEditorModalProps) {
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  const isVideo = mediaFile.type.startsWith('video/');

  const handleSave = () => {
    // In a real implementation, we would apply a canvas operation to save these changes.
    // Here we'll just mock it and return the original file to satisfy the requirement visually.
    onSave(mediaFile, previewUrl);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col touch-none">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-white font-bold">Edit Media</h3>
        <button onClick={handleSave} className="p-2 text-purple-500 hover:text-purple-400 font-bold transition-colors">
          Done
        </button>
      </div>
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 p-4 flex items-center justify-center bg-black relative">
          <div 
            className="relative w-full h-full max-w-3xl flex items-center justify-center"
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filter !== 'none' ? filter : ''}`
            }}
          >
            {isVideo ? (
              <video src={previewUrl} controls className="max-w-full max-h-full object-contain" />
            ) : (
              <img src={previewUrl} alt="Editing" className="max-w-full max-h-full object-contain" />
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-80 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 overflow-y-auto p-4 flex flex-col gap-6">
          {!isVideo && (
            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2"><Crop className="w-4 h-4" /> Transform</h4>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2">
                  <Crop className="w-4 h-4" /> Crop
                </button>
                <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4" /> Rotate
                </button>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-zinc-400 mb-3">Adjustments</h4>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Brightness</span>
                  <span>{brightness}%</span>
                </div>
                <input type="range" min="50" max="150" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full accent-purple-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span className="flex items-center gap-1"><Contrast className="w-3 h-3" /> Contrast</span>
                  <span>{contrast}%</span>
                </div>
                <input type="range" min="50" max="150" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-purple-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span className="flex items-center gap-1"><Droplet className="w-3 h-3" /> Saturation</span>
                  <span>{saturation}%</span>
                </div>
                <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="w-full accent-purple-500" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-zinc-400 mb-3">Filters</h4>
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
              {[
                { name: 'Normal', value: 'none' },
                { name: 'Clarendon', value: 'contrast(1.2) saturate(1.35)' },
                { name: 'Gingham', value: 'brightness(1.05) hue-rotate(-10deg)' },
                { name: 'Moon', value: 'grayscale(1) contrast(1.1) brightness(1.1)' },
                { name: 'Lark', value: 'contrast(0.9)' },
                { name: 'Reyes', value: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)' }
              ].map(f => (
                <button 
                  key={f.name}
                  onClick={() => setFilter(f.value)}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 ${filter === f.value ? 'text-purple-500' : 'text-zinc-400'}`}
                >
                  <div className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${filter === f.value ? 'border-purple-500' : 'border-transparent'}`}>
                    {isVideo ? (
                      <video src={previewUrl} className="w-full h-full object-cover" style={{ filter: f.value }} />
                    ) : (
                      <img src={previewUrl} className="w-full h-full object-cover" style={{ filter: f.value }} />
                    )}
                  </div>
                  <span className="text-xs font-medium">{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
