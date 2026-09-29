import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, Play, Pause, X, Music, Check, Clock, Scissors, Loader2, TrendingUp, Flame, Gamepad2, Coffee, Music2, Info, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  coverUrl: string;
  previewUrl?: string;
  audioUrl?: string; // Full-length/licensed stream URL when provided by the catalog
  isFullTrack?: boolean;
  startTime?: number; // for trimming
  trimDuration?: number;
  volume?: number;
  provider?: string;
  isLicensed?: boolean;
}

const CATEGORIES = [
  { id: 'trending', name: 'Trending', icon: TrendingUp },
  { id: 'recent', name: 'Recent', icon: Clock },
  { id: 'favorites', name: 'Favorites', icon: Heart },
  { id: 'pop', name: 'Pop', icon: Flame },
  { id: 'hiphop', name: 'Hip-Hop', icon: Music2 },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
  { id: 'chill', name: 'Chill', icon: Coffee },
];

export default function MusicPicker({ onSelect, onClose, initialTrack }: { onSelect: (track: MusicTrack) => void, onClose: () => void, initialTrack?: MusicTrack | null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trimmingTrack, setTrimmingTrack] = useState<MusicTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  useEffect(() => {
    if (initialTrack) {
      setTrimmingTrack(initialTrack);
      if (initialTrack.startTime !== undefined) {
        setTrimStart(initialTrack.startTime);
      }
      if (initialTrack.trimDuration !== undefined) {
        setTrimDuration(initialTrack.trimDuration);
      }
      if (initialTrack.volume !== undefined) {
        setTrimVolume(initialTrack.volume);
      }
    }
  }, [initialTrack]);
  
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('omnix_fav_music') || '[]');
    setFavorites(favs.map((t: any) => t.id));
  }, []);
  
  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioError, setIsAudioError] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0); // seconds
  const [trimStart, setTrimStart] = useState(0); // seconds
  const [trimDuration, setTrimDuration] = useState(15); // seconds (or full track when available)
  const [trimVolume, setTrimVolume] = useState(1); // 0.0 to 1.0
  const [duration, setDuration] = useState(30); // actual preview length
  const [showDurationOptions, setShowDurationOptions] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const parseDuration = (value: string | number | undefined) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const parts = String(value).split(':').map(Number);
    if (parts.length === 2 && parts.every(Number.isFinite)) return parts[0] * 60 + parts[1];
    return Number(value) || 0;
  };

  useEffect(() => {
    async function fetchMusic() {
      if (trimmingTrack) return;
      setIsLoading(true);
      setError(null);
      try {
        if (activeCategory === 'recent' && !debouncedQuery) {
          const recent = JSON.parse(localStorage.getItem('omnix_recent_music') || '[]');
          setTracks(recent);
          setIsLoading(false);
          return;
        }
        if (activeCategory === 'favorites' && !debouncedQuery) {
          const favs = JSON.parse(localStorage.getItem('omnix_fav_music') || '[]');
          setTracks(favs);
          setIsLoading(false);
          return;
        }

        const query = debouncedQuery || `${activeCategory} music`;
        
        const cacheKey = `music_${query}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          setTracks(JSON.parse(cached));
          setIsLoading(false);
          return;
        }
        
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Music search unavailable');
        
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        setTracks(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load music. Please try again.');
        console.warn('Music picker notice:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMusic();
  }, [debouncedQuery, activeCategory, trimmingTrack]);

  const toggleFavorite = (e: React.MouseEvent, track: MusicTrack) => {
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem('omnix_fav_music') || '[]');
    const isFav = favs.some((t: MusicTrack) => t.id === track.id);
    let newFavs;
    if (isFav) {
      newFavs = favs.filter((t: MusicTrack) => t.id !== track.id);
    } else {
      newFavs = [track, ...favs];
    }
    localStorage.setItem('omnix_fav_music', JSON.stringify(newFavs));
    setFavorites(newFavs.map((t: any) => t.id));
    
    if (activeCategory === 'favorites') {
      setTracks(newFavs);
    }
  };

  const handleSelectTrack = (track: MusicTrack) => {
    setTrimmingTrack(track);
    const recent = JSON.parse(localStorage.getItem('omnix_recent_music') || '[]');
    const filtered = recent.filter((t: MusicTrack) => t.id !== track.id);
    localStorage.setItem('omnix_recent_music', JSON.stringify([track, ...filtered].slice(0, 20)));
  };

  // Audio lifecycle
  useEffect(() => {
    const playbackUrl = trimmingTrack?.audioUrl || trimmingTrack?.previewUrl;
    if (trimmingTrack && playbackUrl) {
      const audio = new Audio(playbackUrl);
      audio.crossOrigin = "anonymous";
      
      const handleCanPlay = () => {
        setIsAudioLoading(false);
        const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : (parseDuration(trimmingTrack.duration) || 30);
        setDuration(dur);
        if (trimmingTrack.isFullTrack && trimDuration === 15) {
          setTrimDuration(dur);
        }
        if (trimmingTrack.startTime !== undefined && trimStart === 0 && !initialTrack) {
           setTrimStart(trimmingTrack.startTime);
           audio.currentTime = trimmingTrack.startTime;
        } else if (initialTrack && trimStart === 0) {
           setTrimStart(initialTrack.startTime || 0);
           audio.currentTime = initialTrack.startTime || 0;
        }
        audio.volume = trimVolume;
      };
      
      const handleTimeUpdate = () => {
        if (audio.duration) {
          setAudioProgress(audio.currentTime);
          
          const trimEndSec = Math.min(trimStart + trimDuration, audio.duration);
          if (audio.currentTime >= trimEndSec) {
            audio.pause();
            setIsPlaying(false);
            audio.currentTime = trimStart;
          }
        }
      };
      
      const handleEnded = () => setIsPlaying(false);
      const handleError = () => {
        console.error("Audio playback error");
        setIsAudioLoading(false);
        setIsAudioError(true);
      };
      const handleWaiting = () => setIsAudioLoading(true);
      const handlePlaying = () => setIsAudioLoading(false);

      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('playing', handlePlaying);
      
      audioRef.current = audio;
      setIsAudioLoading(true);
      setIsAudioError(false);
      
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Autoplay prevented", err);
        setIsAudioLoading(false);
      });

      return () => {
        audio.pause();
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('playing', handlePlaying);
        audioRef.current = null;
      };
    }
  }, [trimmingTrack, trimStart, trimDuration, initialTrack]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const audio = audioRef.current;
        
        if (audio.currentTime >= trimStart + trimDuration) {
          audio.currentTime = trimStart;
        } else if (audio.currentTime < trimStart) {
          audio.currentTime = trimStart;
        }
        
        audio.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setTrimVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  const handleTrimStartChange = (val: number) => {
    if (navigator.vibrate) {
       navigator.vibrate(10);
    }
    const newStart = Math.min(Math.max(0, val), duration - trimDuration);
    setTrimStart(newStart);
    if (audioRef.current) {
      audioRef.current.currentTime = newStart;
      setAudioProgress(newStart);
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
      }
    }
  };

  const handleDone = () => {
    if (trimmingTrack) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      onSelect({
        ...trimmingTrack,
        startTime: trimStart,
        trimDuration: trimDuration >= duration - 0.5 ? duration : trimDuration,
        volume: trimVolume
      });
    }
  };

  if (trimmingTrack) {
    const trimEndSec = Math.min(trimStart + trimDuration, duration);
    const maxTrimStart = Math.max(0, duration - trimDuration);

    return (
      <div className="absolute inset-x-0 bottom-0 bg-zinc-950/95 backdrop-blur-xl rounded-t-3xl z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-6 h-[80vh]">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => initialTrack ? onClose() : setTrimmingTrack(null)} className="p-2 text-white hover:bg-zinc-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>
          <h3 className="text-white font-bold text-lg">Select Music</h3>
          <button onClick={handleDone} className="text-purple-400 font-bold hover:text-purple-300 transition-colors">Done</button>
        </div>
        
        <div className="flex flex-col items-center gap-6 mb-8 mt-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 rounded-full" />
            <img src={trimmingTrack.coverUrl} className="w-40 h-40 rounded-2xl shadow-2xl object-cover relative z-10 border border-zinc-800" />
            
            {(trimmingTrack.audioUrl || trimmingTrack.previewUrl) && (
              <button 
                onClick={togglePlayback}
                disabled={isAudioError}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-2xl disabled:opacity-100"
              >
                {isAudioError ? (
                  <AlertCircle className="w-12 h-12 text-red-500" />
                ) : isAudioLoading ? (
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-12 h-12 text-white fill-white" />
                ) : (
                  <Play className="w-12 h-12 text-white fill-white ml-2" />
                )}
              </button>
            )}
          </motion.div>
          <div className="text-center max-w-[80%]">
            <h4 className="text-white font-bold text-2xl truncate">{trimmingTrack.title}</h4>
            <p className="text-zinc-400 font-medium truncate mt-1">{trimmingTrack.artist}</p>
          </div>
        </div>

        {(trimmingTrack.audioUrl || trimmingTrack.previewUrl) ? (
          <div className="space-y-6 mb-8 px-4 flex flex-col items-center justify-center w-full max-w-md mx-auto">
            {isAudioError ? (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 w-full">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400 leading-relaxed">
                  Audio preview is unavailable for this track.
                </p>
              </div>
            ) : (
              <>
                <div className="w-full text-center mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    {trimmingTrack.isFullTrack ? 'Full-Length Audio' : '30-Second Preview Provided By Source'}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <div className="text-zinc-400 font-mono text-xs">
                    <span>0:{(Math.floor(trimStart) % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <button 
                    onClick={() => setShowDurationOptions(!showDurationOptions)}
                    className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-full text-white text-xs font-medium transition-colors"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{trimDuration >= duration - 0.5 ? 'Full Song' : `${trimDuration}s Clip`}</span>
                  </button>
                  <div className="text-zinc-400 font-mono text-xs">
                    <span>0:{(Math.floor(trimEndSec) % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                <AnimatePresence>
                  {showDurationOptions && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full flex justify-center gap-2 overflow-hidden"
                    >
                      {[5, 10, 15, 20, 30, 60, 90].filter(d => d <= duration + 0.01).concat(trimDuration >= duration - 0.5 ? [duration] : []).filter((d, i, a) => a.indexOf(d) === i).map(dur => (
                        <button
                          key={dur}
                          onClick={() => {
                            setTrimDuration(Math.min(dur, duration));
                            if (trimStart + dur > duration) {
                              setTrimStart(Math.max(0, duration - dur));
                            }
                            setShowDurationOptions(false);
                          }}
                          className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center transition-colors ${trimDuration === dur ? 'bg-purple-500 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                        >
                          {dur >= duration - 0.5 ? 'Full' : dur}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Horizontal Waveform Timeline */}
                <div className="relative w-full h-16 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden group touch-none">
                  {/* Waveform graphic */}
                  <div className="absolute inset-0 flex items-center justify-around opacity-30 px-2 pointer-events-none">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div key={i} className="w-1 bg-white rounded-full" style={{ height: `${20 + Math.sin(i * 0.5) * 40 + Math.random() * 20}%` }} />
                    ))}
                  </div>
                  
                  {/* Background timeline click to jump */}
                  <div 
                    className="absolute inset-0 z-10"
                    onPointerDown={(e) => {
                      // Only handle clicks outside the selection window to jump
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(1, x / rect.width));
                      const clickTime = percentage * duration;
                      
                      if (clickTime < trimStart || clickTime > trimStart + trimDuration) {
                        const newStart = Math.min(Math.max(0, clickTime - trimDuration / 2), duration - trimDuration);
                        handleTrimStartChange(newStart);
                      }
                    }}
                  />
                  
                  {/* Inactive areas (darkened out) */}
                  <div 
                    className="absolute top-0 bottom-0 bg-black/60 pointer-events-none transition-all duration-100"
                    style={{ left: 0, width: `${(trimStart / duration) * 100}%` }}
                  />
                  <div 
                    className="absolute top-0 bottom-0 bg-black/60 pointer-events-none transition-all duration-100"
                    style={{ left: `${((trimStart + trimDuration) / duration) * 100}%`, right: 0 }}
                  />
                  
                  {/* Selection Window */}
                  <div 
                    className="absolute top-0 bottom-0 bg-purple-500/30 border-y-2 border-purple-500 z-20 cursor-grab active:cursor-grabbing"
                    style={{
                      left: `${(trimStart / duration) * 100}%`,
                      width: `${(trimDuration / duration) * 100}%`
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const parent = e.currentTarget.parentElement;
                      if (!parent) return;
                      const rect = parent.getBoundingClientRect();
                      const startX = e.clientX;
                      const initialStart = trimStart;
                      
                      const onMove = (moveEvt: PointerEvent) => {
                        const dx = moveEvt.clientX - startX;
                        const dTime = (dx / rect.width) * duration;
                        const newStart = Math.max(0, Math.min(initialStart + dTime, duration - trimDuration));
                        handleTrimStartChange(newStart);
                      };
                      const onUp = () => {
                        window.removeEventListener('pointermove', onMove);
                        window.removeEventListener('pointerup', onUp);
                      };
                      window.addEventListener('pointermove', onMove);
                      window.addEventListener('pointerup', onUp);
                    }}
                  >
                    {/* Left Handle */}
                    <div 
                      className="absolute top-0 bottom-0 -left-3 w-6 flex items-center justify-center cursor-ew-resize group/handle"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        const parent = e.currentTarget.parentElement?.parentElement;
                        if (!parent) return;
                        const rect = parent.getBoundingClientRect();
                        const initialStart = trimStart;
                        const initialDuration = trimDuration;
                        
                        const onMove = (moveEvt: PointerEvent) => {
                          const x = moveEvt.clientX - rect.left;
                          let newStart = Math.max(0, Math.min((x / rect.width) * duration, initialStart + initialDuration - 1));
                          let newDuration = initialStart + initialDuration - newStart;
                          // Optional: clamp duration to max 30s
                          if (newDuration > 30) {
                            newDuration = 30;
                            newStart = initialStart + initialDuration - 30;
                          }
                          setTrimStart(newStart);
                          setTrimDuration(newDuration);
                          if (audioRef.current) {
                            audioRef.current.currentTime = newStart;
                          }
                        };
                        const onUp = () => {
                          window.removeEventListener('pointermove', onMove);
                          window.removeEventListener('pointerup', onUp);
                          if (audioRef.current && !isPlaying) {
                            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                          }
                        };
                        window.addEventListener('pointermove', onMove);
                        window.addEventListener('pointerup', onUp);
                      }}
                    >
                      <div className="w-2 h-full bg-white rounded-l-md shadow-md flex flex-col items-center justify-center gap-1">
                        <div className="w-0.5 h-1.5 bg-zinc-400 rounded-full" />
                        <div className="w-0.5 h-1.5 bg-zinc-400 rounded-full" />
                      </div>
                    </div>

                    {/* Right Handle */}
                    <div 
                      className="absolute top-0 bottom-0 -right-3 w-6 flex items-center justify-center cursor-ew-resize group/handle"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        const parent = e.currentTarget.parentElement?.parentElement;
                        if (!parent) return;
                        const rect = parent.getBoundingClientRect();
                        const initialStart = trimStart;
                        const initialDuration = trimDuration;
                        
                        const onMove = (moveEvt: PointerEvent) => {
                          const x = moveEvt.clientX - rect.left;
                          let newEnd = Math.max(initialStart + 1, Math.min((x / rect.width) * duration, duration));
                          let newDuration = newEnd - initialStart;
                          if (newDuration > 30) {
                            newDuration = 30;
                          }
                          setTrimDuration(newDuration);
                        };
                        const onUp = () => {
                          window.removeEventListener('pointermove', onMove);
                          window.removeEventListener('pointerup', onUp);
                        };
                        window.addEventListener('pointermove', onMove);
                        window.addEventListener('pointerup', onUp);
                      }}
                    >
                      <div className="w-2 h-full bg-white rounded-r-md shadow-md flex flex-col items-center justify-center gap-1">
                        <div className="w-0.5 h-1.5 bg-zinc-400 rounded-full" />
                        <div className="w-0.5 h-1.5 bg-zinc-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Playhead */}
                  {isPlaying && (
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-purple-500 z-30 pointer-events-none"
                      style={{ 
                        left: `${(audioProgress / duration) * 100}%`,
                        boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)'
                      }}
                    />
                  )}
                </div>
                
                
                <div className="flex items-center gap-3 w-full px-2">
                  <div className="text-zinc-500 text-xs font-medium">Vol</div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={trimVolume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="text-zinc-500 text-xs font-mono w-8 text-right">{Math.round(trimVolume * 100)}%</div>
                </div>

                <div className="flex items-center gap-2 text-zinc-500 text-xs mt-2">
                  <Scissors className="w-3 h-3" />
                  <span>Drag the timeline to adjust clip position</span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3 mb-8 px-4 flex flex-col items-center justify-center">
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex items-start gap-3 text-left">
              <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-300 leading-relaxed">
                Music preview is unavailable. Select the song to attach its metadata to your story.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-x-0 bottom-0 top-12 bg-zinc-950/95 backdrop-blur-xl rounded-t-3xl z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-xl">Music</h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative mb-4">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search iTunes Music..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 text-white rounded-2xl py-3 pl-12 pr-4 outline-none border border-zinc-800 focus:border-purple-500 focus:bg-zinc-900 transition-all font-medium placeholder:text-zinc-500"
          />
        </div>

        {!searchQuery && (
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide -mx-4 px-4 snap-x">
            {CATEGORIES.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`snap-start flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${
                    activeCategory === category.id 
                      ? 'bg-white text-black border-white' 
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-bold text-sm">{category.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-zinc-500 font-medium text-sm">Searching iTunes...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 px-4 text-center">
            <p className="text-red-400 font-medium">{error}</p>
            <button onClick={() => setDebouncedQuery(debouncedQuery)} className="text-purple-400 text-sm font-bold hover:underline">Try Again</button>
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-zinc-500 font-medium">No music found</p>
          </div>
        ) : (
          <AnimatePresence>
            {tracks.map((track, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={`${track.id}-${i}`} 
                className="flex items-center justify-between group p-2 hover:bg-zinc-900/50 rounded-2xl transition-colors cursor-pointer"
                onClick={() => handleSelectTrack(track)}
              >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className="w-14 h-14 rounded-xl overflow-hidden relative bg-zinc-800 shrink-0 shadow-md">
                    <img src={track.coverUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-white font-bold text-base truncate">{track.title}</div>
                      {track.isLicensed ? (
                        <span className="bg-purple-500/20 text-purple-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 border border-purple-500/30">Licensed</span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 border border-emerald-500/30">Free</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-zinc-400 text-sm truncate">{track.artist}</span>
                      <span className="text-zinc-600 text-xs font-bold px-1.5 py-0.5 rounded bg-zinc-900">{track.duration}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => toggleFavorite(e, track)}
                  className={`p-3 transition-all ${favorites.includes(track.id) ? 'text-red-500 opacity-100' : 'text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                >
                  <Heart className="w-5 h-5" fill={favorites.includes(track.id) ? "currentColor" : "none"} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
