import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { uploadMedia } from '../../lib/storage';
import { 
  X, Image as ImageIcon, Zap, Trash2, ZapOff, Type as TypeIcon, Smile, Music, Check, 
  Wand2, Download, Maximize, Loader2, Sparkles, SlidersHorizontal, Share2, 
  Globe, Users, Lock, ChevronDown, RotateCw, Grid3X3, Clock, Settings, 
  Aperture, Smartphone, Film, Activity, Video, Layout, Layers, Scissors,
  Sun, ChevronRight, Mic, Camera, Type, Volume2, VolumeX, AlignCenter,
  MoveHorizontal, ActivitySquare
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'motion/react';
import MusicPicker from './MusicPicker';
import EmojiPicker from './EmojiPicker';

interface StoryCreatorProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface OverlayText {
  id: string;
  text: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  color: string;
  font: string;
}

const FILTERS = [
  { id: 'normal', name: 'Normal', css: '' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(0.5) contrast(1.2)' },
  { id: 'cinema', name: 'Cinema', css: 'contrast(1.1) saturate(1.3)' },
  { id: 'bw', name: 'B&W', css: 'grayscale(1) contrast(1.2)' },
  { id: 'warm', name: 'Warm', css: 'sepia(0.3) saturate(1.5) hue-rotate(-10deg)' },
  { id: 'cool', name: 'Cool', css: 'saturate(1.2) hue-rotate(10deg)' },
  { id: 'beauty', name: 'Beauty', css: 'brightness(1.1) contrast(0.9) saturate(1.1)' }
];

const MODES = [
  { id: 'story', name: 'Story' },
  { id: 'photo', name: 'Photo' },
  { id: 'video', name: 'Video' },
  { id: 'boomerang', name: 'Boomerang' },
  { id: 'hands_free', name: 'Hands-Free' },
  { id: 'dual', name: 'Dual' },
  { id: 'layout', name: 'Layout' }
];

export default function StoryCreator({ onClose, onSuccess }: StoryCreatorProps) {
  const { user, dbUser } = useAuthStore();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isDraggingMusic, setIsDraggingMusic] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const trashRef = useRef<HTMLDivElement>(null);
  
  // Camera State
  const [activeMode, setActiveMode] = useState('story');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [flashSupported, setFlashSupported] = useState<boolean>(true);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [musicPickerMode, setMusicPickerMode] = useState<"new" | "edit">("new");
  const [showMusicOptions, setShowMusicOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const [musicScale, setMusicScale] = useState(1);
  const [musicRotate, setMusicRotate] = useState(-10);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState<0 | 3 | 5 | 10>(0);
  const [timerCountdown, setTimerCountdown] = useState<number | null>(null);
  const [quality, setQuality] = useState<'HD' | 'FHD' | '4K'>('HD');
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Audience & Overlays
  const [audience, setAudience] = useState<'public' | 'followers' | 'close_friends'>('public');
  const [showAudienceMenu, setShowAudienceMenu] = useState(false);
  const [texts, setTexts] = useState<OverlayText[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [currentInputText, setCurrentInputText] = useState('');
  const [currentTextColor, setCurrentTextColor] = useState('#ffffff');

  const touchDistanceRef = useRef<number | null>(null);
  const recordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  
  useEffect(() => {
    const selectedAudioUrl = selectedMusic?.audioUrl || selectedMusic?.previewUrl;
    if (selectedMusic && selectedAudioUrl) {
      const audio = new Audio(selectedAudioUrl);
      audio.currentTime = selectedMusic.startTime || 0;
      audio.volume = selectedMusic.volume !== undefined ? selectedMusic.volume : 1;
      audio.play().catch(e => console.error('Audio play error:', e));
      audioRef.current = audio;
      
      const handleTimeUpdate = () => {
        const endTime = (selectedMusic.startTime || 0) + (selectedMusic.trimDuration || 30);
        if (audio.currentTime >= endTime) {
          audio.currentTime = selectedMusic.startTime || 0;
          audio.play().catch(e => {});
        }
      };
      audio.addEventListener('timeupdate', handleTimeUpdate);
      
      // Store reference to cleanup listener
      (audioRef.current as any)._handleTimeUpdate = handleTimeUpdate;
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        if ((audioRef.current as any)._handleTimeUpdate) {
          audioRef.current.removeEventListener('timeupdate', (audioRef.current as any)._handleTimeUpdate);
        }
        audioRef.current = null;
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if ((audioRef.current as any)._handleTimeUpdate) {
          audioRef.current.removeEventListener('timeupdate', (audioRef.current as any)._handleTimeUpdate);
        }
        audioRef.current = null;
      }
    };
  }, [selectedMusic]);

  useEffect(() => {
    if (!previewUrl) {
      setZoomLevel(1);
      startCamera();
    }
    return () => { stopCamera(); if (recordTimeoutRef.current) clearTimeout(recordTimeoutRef.current); };
  }, [previewUrl, facingMode, quality]);

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          // Let the browser decide the best orientation and resolution, avoiding forced crops
          ...(quality === '4K' ? { width: { ideal: 3840 } } : 
              quality === 'FHD' ? { width: { ideal: 1920 } } : 
              { width: { ideal: 1280 } })
        },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Check flash support
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() || {} as any;
      setFlashSupported(!!(capabilities as any).torch);
      
    } catch (error: any) {
      console.warn('Camera access issue:', error.message);
      setCameraError('Camera access denied or unavailable. You can still upload media.');
    }
  };

  const applyFlash = async (mode: 'off' | 'on' | 'auto') => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() || {} as any;
      if ((capabilities as any).torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: mode === 'on' || mode === 'auto' } as any]
          });
        } catch (e) {
          console.error("Error applying torch", e);
        }
      }
    }
  };

  useEffect(() => {
    applyFlash(flashMode);
  }, [flashMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const executeCapture = () => {
    if (!videoRef.current || !streamRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    // Apply filter to context if possible (simplified for now)
    if (activeFilter.css) {
      ctx.filter = activeFilter.css;
    }
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'story-capture.jpg', { type: 'image/jpeg' });
        setMediaFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleCapture = () => {
    if (timer > 0) {
      setTimerCountdown(timer);
      let count = timer;
      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setTimerCountdown(count);
        } else {
          clearInterval(interval);
          setTimerCountdown(null);
          executeCapture();
        }
      }, 1000);
    } else {
      executeCapture();
    }
  };

  const executeStartRecording = () => {
    if (!streamRef.current) return;
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], 'story-video.webm', { type: 'video/webm' });
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      stopCamera();
    };
    
    mediaRecorder.start();
    setIsRecording(true);
  };

  const startRecording = () => {
    if (timer > 0) {
      setTimerCountdown(timer);
      let count = timer;
      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setTimerCountdown(count);
        } else {
          clearInterval(interval);
          setTimerCountdown(null);
          executeStartRecording();
        }
      }, 1000);
    } else {
      executeStartRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      let finalFile = file;
      if (file.type.startsWith('image/')) {
        try {
          finalFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
        } catch (error) { console.error(error); }
      }
      setMediaFile(finalFile);
      setPreviewUrl(URL.createObjectURL(finalFile));
      stopCamera();
    }
  };

  const simulateAiEnhance = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      setActiveFilter(FILTERS.find(f => f.id === 'beauty') || FILTERS[0]);
    }, 2000);
  };

  const toggleFlash = () => {
    if (!flashSupported) {
      alert("Flash is not supported on this device.");
      return;
    }
    const modes: ('off' | 'on' | 'auto')[] = ['off', 'on', 'auto'];
    setFlashMode(modes[(modes.indexOf(flashMode) + 1) % modes.length]);
  };

  const cycleTimer = () => {
    const timers: (0|3|5|10)[] = [0, 3, 5, 10];
    setTimer(timers[(timers.indexOf(timer) + 1) % timers.length]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      
      const scaleDiff = (currentDistance - touchDistanceRef.current) * 0.01;
      setZoomLevel(prev => Math.min(Math.max(0.5, prev + scaleDiff), 5));
      touchDistanceRef.current = currentDistance;
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
  };

  const addTextOverlay = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setEditingTextId(newId);
    setCurrentInputText('');
  };

  const addEmojiOverlay = (emoji: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    setTexts(prev => [...prev, {
      id: newId,
      text: emoji,
      x: 50,
      y: 50,
      scale: 1,
      rotate: 0,
      color: '#ffffff',
      font: 'Inter'
    }]);
    setShowEmojiPicker(false);
  };

  const handleRemoveMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSelectedMusic(null);
    setShowMusicOptions(false);
  };

  const handleMusicSelect = (track: any) => {
    setSelectedMusic(track);
    setShowMusicPicker(false);
  };

  const saveTextOverlay = () => {
    if (currentInputText.trim() && editingTextId) {
      setTexts(prev => [...prev, {
        id: editingTextId,
        text: currentInputText,
        x: 50,
        y: 50,
        scale: 1,
        rotate: 0,
        color: currentTextColor,
        font: 'Inter'
      }]);
    }
    setEditingTextId(null);
  };

  const handleUpload = async () => {
    if (!mediaFile && texts.length === 0) return;
    if (!user) {
      alert("Please login again.");
      return;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      alert("Please login again.");
      return;
    }

    setIsUploading(true);
    try {
      let publicUrl = '';
      let isVideo = false;
      
      if (mediaFile) {
        console.log('Selected file:', { name: mediaFile.name, type: mediaFile.type, size: mediaFile.size });
      } else {
        console.log('Selected file:', 'No media, text only story');
      }

      if (mediaFile) {
        isVideo = mediaFile.type.startsWith('video/');
        const fileExt = mediaFile.name.split('.').pop() || 'png';
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        const filePath = fileName;
        
        console.log('Upload payload:', { bucket: 'stories', path: filePath });
        const uploadRes = await supabase.storage.from('stories').upload(filePath, mediaFile, { upsert: true });
        console.log('Upload response:', uploadRes);
        
        if (uploadRes.error) {
          throw new Error(`Supabase Storage Error: ${uploadRes.error.message}`);
        }
        
        const { data: urlData } = supabase.storage.from('stories').getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
        console.log('Public URL:', publicUrl);
      }
      
      const captionText = texts.length > 0 ? texts.map(t => t.text).join('\n') : null;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const payload: any = {
        user_id: session.user.id,
        media_url: publicUrl || 'https://via.placeholder.com/1080x1920/111111/FFFFFF?text=Text+Story',
        expires_at: expiresAt.toISOString(),
        media_type: isVideo ? 'video' : 'image',
        privacy: 'public'
      };
      
      if (captionText) payload.caption = captionText;
      if (selectedMusic) {
        payload.music = JSON.stringify({
          music_id: selectedMusic.id,
          title: selectedMusic.title,
          artist: selectedMusic.artist,
          artwork: selectedMusic.coverUrl,
          preview_url: selectedMusic.previewUrl,
          audio_url: selectedMusic.audioUrl,
          is_full_track: selectedMusic.isFullTrack === true,
          start_time: selectedMusic.startTime,
          duration: selectedMusic.trimDuration || 30,
          volume: selectedMusic.volume !== undefined ? selectedMusic.volume : 1
        });
      }
      
      console.log('--- PRE-INSERT DEBUG ---');
      console.log('session.user.id:', session.user.id);
      console.log('dbUser.id:', dbUser?.id);
      console.log('payload.user_id:', payload.user_id);
      
      // Verify payload.user_id exists in public.profiles before inserting
      if (!payload.user_id) {
         throw new Error("payload.user_id is missing! Ensure you are fully logged in and your user profile exists.");
      }
      try {
        const { data: userExists } = await supabase.from('profiles').select('id').eq('id', payload.user_id).single();
        if (!userExists) {
           console.log("Profile not found in public.profiles for payload.user_id! Attempting to create...");
           await supabase.from('profiles').insert({
              id: payload.user_id,
              username: session.user.email ? session.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + '_' + Date.now().toString().slice(-4) : 'user_' + Date.now(),
              display_name: 'User',
              is_verified: false
           });
        } else {
           console.log("Verified: profile exists in public.profiles");
        }
      } catch (e) {
        console.warn("Failed to check profile in public.profiles:", e);
      }
      console.log('--- PRE-INSERT DEBUG END ---');

      console.log('Insert payload:', payload);

      const insertRes = await supabase.from('stories').insert(payload).select();
      console.log('Insert response:', insertRes);

      if (insertRes.error) {
         throw new Error(`Supabase Database Error: ${insertRes.error.message}`);
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`${error.message || JSON.stringify(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col font-sans select-none overflow-hidden touch-none">
      {/* Top Bar Settings */}
      {!previewUrl && (
        <div className="absolute top-0 inset-x-0 z-30 flex justify-between items-start p-4 bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={onClose} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col gap-4 items-center">
            <button onClick={toggleFlash} className={`p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40 relative group ${!flashSupported ? 'opacity-50' : ''}`}>
              {flashMode === 'off' ? <ZapOff className="w-5 h-5" /> : <Zap className={`w-5 h-5 ${flashMode === 'auto' ? 'text-yellow-400' : 'text-white'}`} />}
              {flashMode === 'auto' && <span className="absolute -bottom-1 -right-1 text-[9px] font-bold bg-yellow-400 text-black px-1 rounded-sm">A</span>}
            </button>
            <button onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40">
              <RotateCw className="w-5 h-5" />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40">
              <ChevronDown className="w-5 h-5" />
            </button>
            
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.9 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.9 }}
                  className="flex flex-col gap-4 items-center overflow-hidden"
                >
                  <button onClick={() => setGridEnabled(!gridEnabled)} className={`p-3 rounded-full backdrop-blur ${gridEnabled ? 'bg-purple-500 text-white' : 'bg-black/20 text-white hover:bg-black/40'}`}>
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button onClick={cycleTimer} className={`p-3 rounded-full backdrop-blur relative ${timer > 0 ? 'bg-purple-500 text-white' : 'bg-black/20 text-white hover:bg-black/40'}`}>
                    <Clock className="w-5 h-5" />
                    {timer > 0 && <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-white text-purple-600 px-1 rounded-sm">{timer}s</span>}
                  </button>
                  <button onClick={() => setQuality(q => q === 'HD' ? 'FHD' : q === 'FHD' ? '4K' : 'HD')} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40 text-xs font-bold w-11 h-11 flex items-center justify-center">
                    {quality}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Editor Top Bar */}
      {previewUrl && (
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={onClose} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40">
            <X className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button onClick={simulateAiEnhance} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </button>
            <button onClick={addTextOverlay} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40">
              <TypeIcon className="w-5 h-5" />
            </button>
            <button onClick={() => setShowEmojiPicker(true)} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40">
              <Smile className="w-5 h-5" />
            </button>
            <button onClick={() => { if (selectedMusic) { setShowMusicOptions(true); } else { setMusicPickerMode("new"); setShowMusicPicker(true); } }} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40">
              <Music className="w-5 h-5" />
            </button>
            {(mediaFile?.type.startsWith('video/')) && (
              <button onClick={() => setIsMuted(!isMuted)} className="p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden sm:rounded-none">
        
        {/* Countdown Timer */}
        <AnimatePresence>
          {timerCountdown !== null && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute z-50 text-white font-bold text-9xl drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
            >
              {timerCountdown}
            </motion.div>
          )}
        </AnimatePresence>

        {isAiProcessing && (
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur flex flex-col items-center justify-center">
            <div className="w-64 h-64 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin absolute" />
            <Sparkles className="w-12 h-12 text-purple-400 animate-pulse mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Enhancing Magic...</h3>
          </div>
        )}

        {!previewUrl ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-900 z-10">
                <Camera className="w-16 h-16 text-zinc-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Camera Unavailable</h3>
                <p className="text-zinc-400 mb-6">{cameraError}</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-black px-6 py-3 rounded-full font-bold"
                >
                  Upload from Device
                </button>
              </div>
            ) : null}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full h-full object-cover origin-center transition-transform" 
              style={{ 
                transform: `${zoomLevel !== 1 ? `scale(${zoomLevel})` : ''} ${facingMode === 'user' ? 'scaleX(-1)' : ''}`.trim() || undefined,
                filter: activeFilter.css || undefined
              }}
            />
            {/* Grid overlay */}
            {gridEnabled && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30 z-10">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div className="border-white" />
              </div>
            )}
            
            {/* Quick Zoom Buttons */}
            <div className="absolute bottom-40 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 z-20 pointer-events-auto bg-black/40 rounded-full px-4 py-2 backdrop-blur-md">
              <button onClick={() => setZoomLevel(0.5)} className={`text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors ${zoomLevel === 0.5 ? 'bg-white text-black' : 'text-white'}`}>.5x</button>
              <button onClick={() => setZoomLevel(1)} className={`text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors ${zoomLevel === 1 ? 'bg-white text-black' : 'text-white'}`}>1x</button>
              <button onClick={() => setZoomLevel(2)} className={`text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors ${zoomLevel === 2 ? 'bg-white text-black' : 'text-white'}`}>2x</button>
            </div>
            
          </motion.div>
        ) : (
          <div className="w-full h-full relative group">
            {mediaFile?.type.startsWith('video/') ? (
              <video src={previewUrl} className="w-full h-full object-contain bg-black" autoPlay loop muted={isMuted} style={{ filter: activeFilter.css }} />
            ) : (
              <img src={previewUrl} className="w-full h-full object-contain bg-black" alt="Preview" style={{ filter: activeFilter.css }} />
            )}
            
            {/* Draggable Texts & Emojis */}
            {texts.map(text => (
              <motion.div
                key={text.id}
                drag
                dragMomentum={false}
                onDoubleClick={() => setTexts(texts.filter(t => t.id !== text.id))}
                className="absolute text-center whitespace-pre-wrap font-bold text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] cursor-move group/text"
                style={{ 
                  left: `${text.x}%`, top: `${text.y}%`, x: '-50%', y: '-50%',
                  color: text.color,
                  fontFamily: text.font,
                  scale: text.scale || 1,
                  rotate: text.rotate || 0,
                  transformOrigin: 'center'
                }}
              >
                {text.text}
                <button 
                  onClick={() => setTexts(texts.filter(t => t.id !== text.id))}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/text:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {/* Scale/Rotate Handle */}
                <div 
                  className="absolute -bottom-3 -right-3 w-6 h-6 bg-white text-black rounded-full shadow-lg opacity-0 group-hover/text:opacity-100 transition-opacity flex items-center justify-center cursor-nwse-resize pointer-events-auto"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startScale = text.scale || 1;
                    const startRotate = text.rotate || 0;
                    
                    const handleMove = (moveEvent: PointerEvent) => {
                      const dx = moveEvent.clientX - startX;
                      const dy = moveEvent.clientY - startY;
                      const newScale = Math.max(0.2, startScale + (dx + dy) * 0.01);
                      const newRotate = startRotate + dx * 0.5;
                      
                      setTexts(prev => prev.map(t => 
                        t.id === text.id ? { ...t, scale: newScale, rotate: newRotate } : t
                      ));
                    };
                    
                    const handleUp = () => {
                      window.removeEventListener('pointermove', handleMove);
                      window.removeEventListener('pointerup', handleUp);
                    };
                    
                    window.addEventListener('pointermove', handleMove);
                    window.addEventListener('pointerup', handleUp);
                  }}
                >
                  <RotateCw className="w-3 h-3" />
                </div>
              </motion.div>
            ))}

            {/* Selected Music Sticker */}
            {selectedMusic && (
              <motion.div
                drag
                dragMomentum={false}
                onDragStart={() => setIsDraggingMusic(true)}
                onDrag={(event, info) => {
                  if (trashRef.current) {
                    const rect = trashRef.current.getBoundingClientRect();
                    const isOver = info.point.x > rect.left && info.point.x < rect.right && info.point.y > rect.top && info.point.y < rect.bottom;
                    setIsOverTrash(isOver);
                  }
                }}
                onDragEnd={(event, info) => {
                  setIsDraggingMusic(false);
                  if (isOverTrash) {
                    handleRemoveMusic();
                  }
                  setIsOverTrash(false);
                }}
                initial={{ scale: 0, opacity: 0, rotate: -10 }}
                animate={{ scale: musicScale, opacity: 1, rotate: musicRotate }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: musicScale * 1.05 }}
                className="absolute bg-white/10 backdrop-blur-xl text-white font-medium rounded-2xl p-2 pr-4 cursor-grab active:cursor-grabbing flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 group/music z-40" onClick={() => setShowMusicOptions(true)}
                style={{ left: '50%', top: '20%', x: '-50%', y: '-50%', transformOrigin: 'center' }}
              >
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0">
                  <img src={selectedMusic.coverUrl} className="w-full h-full object-cover animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Music className="w-4 h-4 text-white drop-shadow-md" />
                  </div>
                </div>
                <div className="flex flex-col items-start min-w-[100px] max-w-[160px] mr-2">
                  <span className="font-bold text-sm truncate w-full shadow-black drop-shadow-sm">{selectedMusic.title}</span>
                  <span className="text-[10px] text-white/80 truncate w-full">{selectedMusic.artist}</span>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic(null);
                  }}
                  className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover/music:opacity-100 transition-all shadow-lg scale-75 group-hover/music:scale-100"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Scale/Rotate Handle */}
                <div 
                  className="absolute -bottom-3 -right-3 w-6 h-6 bg-white text-black rounded-full shadow-lg opacity-0 group-hover/music:opacity-100 transition-opacity flex items-center justify-center cursor-nwse-resize pointer-events-auto"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startScale = musicScale;
                    const startRotate = musicRotate;
                    
                    const handleMove = (moveEvent: PointerEvent) => {
                      const dx = moveEvent.clientX - startX;
                      const dy = moveEvent.clientY - startY;
                      setMusicScale(Math.max(0.5, startScale + (dx + dy) * 0.01));
                      setMusicRotate(startRotate + dx * 0.5);
                    };
                    
                    const handleUp = () => {
                      window.removeEventListener('pointermove', handleMove);
                      window.removeEventListener('pointerup', handleUp);
                    };
                    
                    window.addEventListener('pointermove', handleMove);
                    window.addEventListener('pointerup', handleUp);
                  }}
                >
                  <RotateCw className="w-3 h-3" />
                </div>
              </motion.div>
            )}
          </div>
        )}
        
        
            {/* Trash Dropzone for Music */}
            <AnimatePresence>
              {isDraggingMusic && (
                <motion.div
                  ref={trashRef}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0, scale: isOverTrash ? 1.5 : 1 }}
                  exit={{ opacity: 0, y: 50 }}
                  className={`absolute bottom-32 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center z-50 transition-colors ${isOverTrash ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-black/50 backdrop-blur-md text-white/80 border border-white/20'}`}
                >
                  <Trash2 className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>

        {/* Text Input Overlay */}
        <AnimatePresence>
          {editingTextId && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-6"
            >
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setEditingTextId(null)} className="text-white text-lg font-medium">Cancel</button>
                <div className="flex gap-2">
                  {['#ffffff', '#000000', '#ef4444', '#a855f7', '#3b82f6', '#22c55e', '#eab308'].map(color => (
                    <button 
                      key={color} 
                      onClick={() => setCurrentTextColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${currentTextColor === color ? 'border-white scale-110' : 'border-white/20 hover:scale-110'} transition-transform`} 
                      style={{ backgroundColor: color }} 
                    />
                  ))}
                </div>
                <button onClick={saveTextOverlay} className="text-white text-lg font-bold bg-white/20 px-6 py-2 rounded-full">Done</button>
              </div>
              <textarea
                autoFocus
                value={currentInputText}
                onChange={(e) => setCurrentInputText(e.target.value)}
                placeholder="Type something..."
                style={{ color: currentTextColor }}
                className="w-full flex-1 bg-transparent text-center text-4xl font-bold resize-none outline-none placeholder:text-white/30 leading-relaxed"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="relative z-30 flex flex-col bg-black">
        
        {/* Camera Controls */}
        {!previewUrl ? (
          <div className="px-4 pb-8 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent">
            
            {/* Filter Selector */}
            <div className="flex overflow-x-auto gap-4 mb-6 px-4 scrollbar-hide snap-x">
              {FILTERS.map(f => (
                <button 
                  key={f.id}
                  onClick={() => setActiveFilter(f)}
                  className={`snap-center flex flex-col items-center gap-1 min-w-[64px] ${activeFilter.id === f.id ? 'opacity-100' : 'opacity-50'}`}
                >
                  <div className={`w-14 h-14 rounded-full border-2 overflow-hidden ${activeFilter.id === f.id ? 'border-purple-500 scale-110' : 'border-transparent'} transition-all`}>
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500" style={{ filter: f.css }} />
                  </div>
                  <span className="text-[10px] text-white font-medium">{f.name}</span>
                </button>
              ))}
            </div>

            {/* Shutter Row */}
            <div className="flex items-center justify-between max-w-sm mx-auto w-full mb-6">
              <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </button>
              
              <div className="relative flex items-center justify-center">
                <svg className="absolute w-[100px] h-[100px] -rotate-90 pointer-events-none">
                  <circle cx="50" cy="50" r="48" fill="transparent" stroke="#3f3f46" strokeWidth="4" />
                  {isRecording && (
                    <circle cx="50" cy="50" r="48" fill="transparent" stroke="#ec4899" strokeWidth="4" strokeDasharray="301" strokeDashoffset="0" className="animate-[dash_15s_linear_forwards]" />
                  )}
                </svg>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onPointerDown={() => {
                    if (activeMode === 'video' || activeMode === 'hands_free') {
                      recordTimeoutRef.current = setTimeout(() => startRecording(), 300);
                    } else if (activeMode === 'story') {
                      recordTimeoutRef.current = setTimeout(() => { if (!previewUrl) startRecording(); }, 500);
                    }
                  }}
                  onPointerUp={() => { 
                    if (recordTimeoutRef.current) {
                      clearTimeout(recordTimeoutRef.current);
                      recordTimeoutRef.current = null;
                    }
                    if (isRecording && activeMode !== 'hands_free') {
                      stopRecording(); 
                    }
                  }}
                  onClick={() => {
                    if (recordTimeoutRef.current) {
                      clearTimeout(recordTimeoutRef.current);
                      recordTimeoutRef.current = null;
                    }
                    if (isRecording && activeMode === 'hands_free') {
                      stopRecording();
                    } else if (!isRecording && (activeMode === 'photo' || activeMode === 'story')) {
                      handleCapture(); 
                    }
                  }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-[0_0_0_4px_rgba(255,255,255,0.2)] ${isRecording ? 'bg-red-500 scale-75' : 'bg-white'}`}
                >
                  {isRecording && <div className="w-8 h-8 bg-black rounded-md" />}
                </motion.button>
              </div>
              
              <button onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')} className="w-12 h-12 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center text-white">
                <RotateCw className="w-6 h-6" />
              </button>
            </div>
            
            {/* Mode Selector */}
            <div className="flex overflow-x-auto gap-6 px-[50%] scrollbar-hide snap-x items-center h-8" 
                 style={{ scrollSnapType: 'x mandatory' }}>
              {MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`snap-center whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-colors ${activeMode === mode.id ? 'text-white' : 'text-zinc-500'}`}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between p-4 pb-8 max-w-lg mx-auto bg-black">
            {/* Audience Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowAudienceMenu(!showAudienceMenu)}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-3 rounded-full text-white font-medium transition-colors"
              >
                {audience === 'public' && <Globe className="w-4 h-4 text-blue-400" />}
                {audience === 'followers' && <Users className="w-4 h-4 text-purple-400" />}
                {audience === 'close_friends' && <Sparkles className="w-4 h-4 text-green-400" />}
                <span className="capitalize">{audience.replace('_', ' ')}</span>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </button>
              
              <AnimatePresence>
                {showAudienceMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 mb-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-1 z-50"
                  >
                    <button onClick={() => { setAudience('public'); setShowAudienceMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 text-left">
                      <div className="p-2 bg-blue-500/20 rounded-full"><Globe className="w-5 h-5 text-blue-400" /></div>
                      <div><div className="font-medium">Public</div><div className="text-xs text-zinc-400">Anyone on Omnix</div></div>
                    </button>
                    <button onClick={() => { setAudience('followers'); setShowAudienceMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 text-left">
                      <div className="p-2 bg-purple-500/20 rounded-full"><Users className="w-5 h-5 text-purple-400" /></div>
                      <div><div className="font-medium">Followers</div><div className="text-xs text-zinc-400">Only your followers</div></div>
                    </button>
                    <button onClick={() => { setAudience('close_friends'); setShowAudienceMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 text-left">
                      <div className="p-2 bg-green-500/20 rounded-full"><Sparkles className="w-5 h-5 text-green-400" /></div>
                      <div><div className="font-medium">Close Friends</div><div className="text-xs text-zinc-400">Selected list</div></div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-3 rounded-full text-white font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-purple-500/25"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
              {isUploading ? 'Posting...' : 'Share Story'}
            </button>
          </div>
        )}
      </div>
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
      
      <AnimatePresence>

      <AnimatePresence>
        {showMusicOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end justify-center bg-black/50"
            onClick={() => setShowMusicOptions(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-zinc-950 rounded-t-3xl p-6 flex flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-4" />
              <button
                onClick={() => { setShowMusicOptions(false); setMusicPickerMode("new"); setShowMusicPicker(true); }}
                className="w-full py-4 bg-zinc-900 rounded-xl text-white font-bold hover:bg-zinc-800 transition-colors"
              >
                Change Music
              </button>
              <button
                onClick={() => { setShowMusicOptions(false); setMusicPickerMode("edit"); setShowMusicPicker(true); }}
                className="w-full py-4 bg-zinc-900 rounded-xl text-white font-bold hover:bg-zinc-800 transition-colors"
              >
                Edit Clip
              </button>
              <button
                onClick={handleRemoveMusic}
                className="w-full py-4 bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500/20 transition-colors"
              >
                Remove Music
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {showMusicPicker && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-x-0 bottom-0 top-0 z-50 pointer-events-auto"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMusicPicker(false)} />
            <MusicPicker onSelect={handleMusicSelect} onClose={() => setShowMusicPicker(false)} initialTrack={musicPickerMode === "edit" ? selectedMusic : undefined} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-x-0 bottom-0 top-0 z-50 pointer-events-auto"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowEmojiPicker(false)} />
            <EmojiPicker onSelect={addEmojiOverlay} onClose={() => setShowEmojiPicker(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash { to { stroke-dashoffset: 0; } from { stroke-dashoffset: 301; } }
      `}} />
    </div>
  );
}
