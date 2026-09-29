import React, { useState, useRef } from 'react';
import { X, UploadCloud, Loader2, Image as ImageIcon, Video, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadMedia } from '../../lib/storage';
import { useAuthStore } from '../../store/authStore';

export default function UploadModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 100 * 1024 * 1024) {
        setError('Video exceeds 100MB limit.');
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    setUploading(true);
    setError(null);
    setProgress(10); // Start progress

    try {
      // Check video length (max 3 mins)
      if (videoPreviewRef.current && videoPreviewRef.current.duration > 180) {
        throw new Error('Video must be less than 3 minutes long.');
      }

      // Simulate compression
      setProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(40);

      // Upload to storage
      const ext = file.name.split('.').pop();
      const filename = `${Math.random().toString(36).substring(2)}-${Date.now()}.${ext}`;
      const filePath = `${user.id}/${filename}`;

      const publicUrl = await uploadMedia('media', filePath, file);

      setProgress(75);

      // Generate a thumbnail (using placeholder for now as canvas drawing in browser can fail on some video codecs without CORS)
      const thumbnailUrl = publicUrl; 


      // Extract hashtags
      const hashtags = caption.match(/#[a-z0-9_]+/gi)?.map(t => t.toLowerCase()) || [];

      // Save metadata
      const { error: dbError } = await supabase
        .from('omniclips')
        .insert({
          user_id: user.id,
          video_url: publicUrl,
          thumbnail: thumbnailUrl,
          caption: caption.trim(),
          music: 'Original Audio'
        });

      if (dbError) throw dbError;

      setProgress(100);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Upload OmniClip</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-purple-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-zinc-800/30 hover:bg-zinc-800/50 transition-all group"
            >
              <div className="w-16 h-16 bg-zinc-800 group-hover:bg-purple-500/20 rounded-full flex items-center justify-center transition-colors">
                <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Select Video to Upload</p>
                <p className="text-zinc-500 text-sm mt-1">MP4 or WebM (Max 100MB, 3 mins)</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[40vh] mx-auto border border-zinc-800">
                <video 
                  ref={videoPreviewRef}
                  src={previewUrl!} 
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                />
                <button 
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe your clip... #awesome"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none h-24"
                />
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>{progress < 40 ? 'Compressing...' : 'Uploading...'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    Post OmniClip
                  </>
                )}
              </button>
            </div>
          )}
          
          <input 
            type="file" 
            accept="video/mp4,video/webm" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}
