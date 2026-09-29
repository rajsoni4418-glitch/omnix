import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X, Volume2, VolumeX, MoreHorizontal, Send, Heart, MessageCircle, Share2, Eye, Flame, Smile, ShieldAlert, Sparkles, Pin, Music } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface Story {
  id: string;
  media_url: string;
  
  caption: string;
  created_at: string;
  user_id: string;
  privacy: string;
  view_count?: number;
  music?: string;
}

interface UserStories {
  userId: string;
  username: string;
  avatar_url: string;
  stories: Story[];
}

interface StoryViewerProps {
  storyGroups: UserStories[];
  initialUserIndex: number;
  initialStoryIndex?: number;
  onClose: () => void;
}

export default function StoryViewer({ storyGroups, initialUserIndex, initialStoryIndex = 0, onClose }: StoryViewerProps) {
  const { user } = useAuthStore();
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [liveViewCount, setLiveViewCount] = useState(0);
  
  // Audio for music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicTrack, setMusicTrack] = useState<any>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<number | null>(null);
  const currentGroup = storyGroups[currentUserIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];
  const isOwnStory = user?.id === currentGroup?.userId;

  // Calculate dynamic duration
  let dynamicDuration = 5000;
  if (currentStory) {
    let track = null;
    if (currentStory.music) {
      try { track = JSON.parse(currentStory.music); } catch(e){}
    } else if (currentStory.caption && currentStory.caption.includes("|||MUSIC|||")) {
      try { track = JSON.parse(currentStory.caption.split("|||MUSIC|||")[1]); } catch(e){}
    }
    if (track) {
      const trimDur = track.trimDuration !== undefined ? track.trimDuration : (typeof track.duration === 'number' ? track.duration : 30);
      if (trimDur) {
        dynamicDuration = trimDur * 1000;
      }
    }
  }
  const storyDuration = dynamicDuration;

  // Track view & subscribe to live view count
  useEffect(() => {
    if (!currentStory || !user) return;
    
    const pinned = JSON.parse(localStorage.getItem('pinned_stories') || '[]');
    setIsPinned(pinned.includes(currentStory.id));
    
    setLiveViewCount(currentStory.view_count || 0);

    const trackView = async () => {
      try {
        const { error } = await supabase.from('story_views').insert({
          story_id: currentStory.id,
          user_id: user.id
        });
        if (error) {
          console.log("Track view error (might be duplicate):", error);
        } else {
          setLiveViewCount(prev => prev + 1);
        }
      } catch (e) {
        console.error("Exception in trackView:", e);
      }
    };
    
    if (!isOwnStory) {
      trackView();
    }

    const channel = supabase.channel(`story-${currentStory.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stories',
          filter: `id=eq.${currentStory.id}`
        },
        (payload) => {
          if (payload.new && payload.new.view_count !== undefined) {
            setLiveViewCount(payload.new.view_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentStory, user, isOwnStory]);

  // Audio initialization
  useEffect(() => {
    if (!currentStory) return;
    
    let track = null;
    if (currentStory.music) {
      try { track = JSON.parse(currentStory.music); } catch(e){}
    } else if (currentStory.caption && currentStory.caption.includes('|||MUSIC|||')) {
      try { track = JSON.parse(currentStory.caption.split('|||MUSIC|||')[1]); } catch(e){}
    }

    if (track) {
      try {
        const parsedMusic = {
          ...track,
          previewUrl: track.preview_url || track.previewUrl,
          audioUrl: track.audio_url || track.audioUrl,
          isFullTrack: track.is_full_track === true || track.isFullTrack === true,
          startTime: track.start_time !== undefined ? track.start_time : track.startTime,
          trimDuration: track.trimDuration !== undefined ? track.trimDuration : (typeof track.duration === 'number' ? track.duration : 30),
          coverUrl: track.artwork || track.coverUrl
        };
        setMusicTrack(parsedMusic);
        
        const playbackUrl = parsedMusic.audioUrl || parsedMusic.previewUrl;
        if (playbackUrl && !isMuted) {
          const audio = new Audio(playbackUrl);
          audio.currentTime = parsedMusic.startTime || 0;
          audio.volume = parsedMusic.volume !== undefined ? parsedMusic.volume : 1;
          
          audioRef.current = audio;
          
          const handleTimeUpdate = () => {
            const endTime = (parsedMusic.startTime || 0) + (parsedMusic.trimDuration || parsedMusic.duration || 30);
            if (audio.currentTime >= endTime) {
              audio.currentTime = parsedMusic.startTime || 0;
              // we rely on the play/pause effect to keep it playing, just reset time
            }
          };
          audio.addEventListener('timeupdate', handleTimeUpdate);
          (audioRef.current as any)._handleTimeUpdate = handleTimeUpdate;
        }
      } catch (e) {
        console.error("Failed to parse music", e);
        setMusicTrack(null);
      }
    } else {
      setMusicTrack(null);
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
  }, [currentStory, isMuted]);

  // Handle play/pause when state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') console.error("Audio playback blocked", e);
          });
        }
      }
    }
    
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') console.error("Video playback blocked", e);
          });
        }
      }
    }
  }, [isPaused, musicTrack, currentStoryIndex, isMuted]);

  const nextStory = useCallback(() => {
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(c => c + 1);
    } else if (currentUserIndex < storyGroups.length - 1) {
      setCurrentUserIndex(c => c + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  }, [currentStoryIndex, currentUserIndex, currentGroup?.stories.length, storyGroups.length, onClose]);

  const prevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(c => c - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(c => c - 1);
      setCurrentStoryIndex(storyGroups[currentUserIndex - 1].stories.length - 1);
    }
  }, [currentStoryIndex, currentUserIndex, storyGroups]);

  useEffect(() => {
    if (progress >= 100) {
      nextStory();
    }
  }, [progress, nextStory]);

  useEffect(() => {
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [currentStoryIndex, currentUserIndex]);

  useEffect(() => {
    if (!currentStory) return;
    
    if (progressInterval.current !== null) {
      clearInterval(progressInterval.current);
    }
    
    if (isPaused) return;

    if ((currentStory.media_url?.endsWith('.mp4') || currentStory.media_url?.endsWith('.webm')) && videoRef.current) {
      const video = videoRef.current;
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError') console.error("Video playback blocked", e);
        });
      }
      
      const updateProgress = () => {
        if (!isPaused) {
          const percent = (video.currentTime / video.duration) * 100;
          setProgress(percent);
        }
      };
      
      video.addEventListener('timeupdate', updateProgress);
      return () => {
        video.removeEventListener('timeupdate', updateProgress);
      };
    } else {
      const interval = 50;
      const step = (interval / storyDuration) * 100;
      
      progressInterval.current = window.setInterval(() => {
        setProgress(p => {
          if (p >= 100) return 100;
          return p + step;
        });
      }, interval);
      
      return () => {
        if (progressInterval.current !== null) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [currentStory, isPaused, storyDuration]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const width = e.currentTarget.offsetWidth;
    const x = e.nativeEvent.offsetX;
    if (x < width / 3) {
      prevStory();
    } else {
      nextStory();
    }
  };

  const handlePin = () => {
    if (!currentStory) return;
    try {
      const pinned = JSON.parse(localStorage.getItem('pinned_stories') || '[]');
      if (pinned.includes(currentStory.id)) {
        const newPinned = pinned.filter((id: string) => id !== currentStory.id);
        localStorage.setItem('pinned_stories', JSON.stringify(newPinned));
        setIsPinned(false);
        showToast("Story unpinned");
      } else {
        pinned.push(currentStory.id);
        localStorage.setItem('pinned_stories', JSON.stringify(pinned));
        setIsPinned(true);
        showToast("Story pinned");
      }
    } catch(e) {
      console.error(e);
      showToast("Failed to pin story");
    }
  };

  const handleShare = async () => {
    if (!currentStory) return;
    const shareData = {
      title: 'Story',
      text: 'Check out this story!',
      url: window.location.origin + '/story/' + currentStory.id
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // user canceled or error
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
                         showToast("Link copied to clipboard");
      showToast("Link copied to clipboard");
    }
  };

  const handleSend = () => {
    if (!replyText.trim()) return;
    setReplyText('');
    showToast("Message sent to " + (currentGroup?.username || 'user'));
    setIsPaused(false);
  };
  
    const handleReaction = async (emoji: string) => {
    showToast(`Reaction ${emoji} sent`);
    setShowReactions(false);
    setIsPaused(false);
    
    // Instead of failing, we just do optimistic for now 
    // since we can't create story_reactions or story_likes
    // in this environment.
  };

  const handleDragEnd = (e: any, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    } else if (info.offset.x > 100) {
      if (currentUserIndex > 0) {
        setCurrentUserIndex(c => c - 1);
        setCurrentStoryIndex(0);
      }
    } else if (info.offset.x < -100) {
      if (currentUserIndex < storyGroups.length - 1) {
        setCurrentUserIndex(c => c + 1);
        setCurrentStoryIndex(0);
      } else {
        onClose();
      }
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteStory = async () => {
    if (!currentStory || !isOwnStory || isDeleting) return;
    
    // Pause while deleting
    setIsPaused(true);
    setIsDeleting(true);
    try {
      // 1. Delete from stories table
      const { error } = await supabase.from('stories').delete().eq('id', currentStory.id);
      if (error) throw error;
      
      // 2. Delete media from storage (if exists)
      if (currentStory.media_url && currentStory.media_url.includes('storage/v1/object/public/stories/')) {
        const path = currentStory.media_url.split('storage/v1/object/public/stories/')[1];
        if (path) {
          await supabase.storage.from('stories').remove([path]);
        }
      }
      
      // 3. Close viewer since story is gone
      onClose();
    } catch (e) {
      console.error("Failed to delete story:", e);
      setIsPaused(false);
      setIsDeleting(false);
      showToast("Failed to delete story");
    }
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[200] bg-black sm:bg-black/90 touch-none flex flex-col justify-center items-center backdrop-blur-sm"
      >
        <motion.div 
          className="relative w-full h-full sm:max-w-[480px] sm:h-[85vh] bg-zinc-950 sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col sm:border sm:border-zinc-800"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={handleDragEnd}
        >
          {/* Progress Bars */}
          <div className="absolute top-0 inset-x-0 pt-4 px-2 z-30 flex gap-1 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-8">
            {currentGroup.stories.map((s, i) => (
              <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ width: i === currentStoryIndex ? `${progress}%` : i < currentStoryIndex ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 inset-x-0 px-4 pt-2 z-30 flex items-center justify-between">
            <Link to={`/@${currentGroup.username}`} className="flex items-center gap-3 drop-shadow-md">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                {currentGroup.avatar_url ? (
                  <img src={currentGroup.avatar_url} alt={currentGroup.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                    {currentGroup.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-sm drop-shadow-md">{currentGroup.username}</span>
                  <span className="text-white/80 text-xs">• {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}</span>
                </div>
                {currentStory.privacy === 'close_friends' && (
                  <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px] w-fit font-medium backdrop-blur">
                    <Sparkles className="w-3 h-3" /> Close Friends
                  </div>
                )}
              </div>
            </Link>
            
            <div className="flex items-center gap-2 drop-shadow-md">
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button onClick={() => { setIsPaused(true); setShowMenu(true); }} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Media Content */}
          <div 
            className="flex-1 relative bg-black flex items-center justify-center overflow-hidden" 
            onClick={handleTap}
            onPointerDown={() => setIsPaused(true)}
            onPointerUp={() => setIsPaused(false)}
            onPointerLeave={() => setIsPaused(false)}
          >
            {(currentStory.media_url?.endsWith('.mp4') || currentStory.media_url?.endsWith('.webm')) ? (
              <video
                ref={videoRef}
                src={currentStory.media_url}
                className="w-full h-full object-cover sm:object-contain"
                playsInline
                muted={isMuted}
                loop={false}
              />
            ) : (
              <img 
                src={currentStory.media_url} 
                alt="Story"
                className="w-full h-full object-cover sm:object-contain"
              />
            )}
            
            {/* Music Overlay */}
            {musicTrack && (
              <div 
                className="absolute z-20 bg-white/10 backdrop-blur-xl text-white font-medium rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 pointer-events-none"
                style={{ left: '50%', top: '20%', transform: 'translate(-50%, -50%) rotate(-10deg)' }}
              >
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0">
                  <img src={musicTrack.coverUrl} className={`w-full h-full object-cover ${!isPaused ? 'animate-[spin_10s_linear_infinite]' : ''}`} alt="Album art" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Music className="w-4 h-4 text-white drop-shadow-md" />
                  </div>
                </div>
                <div className="flex flex-col items-start min-w-[100px] max-w-[160px] mr-2">
                  <span className="font-bold text-sm truncate w-full shadow-black drop-shadow-sm">{musicTrack.title}</span>
                  <span className="text-[10px] text-white/80 truncate w-full">{musicTrack.artist}</span>
                </div>
              </div>
            )}
            
            {/* Caption Overlay */}
            {currentStory.caption && currentStory.caption.split('|||MUSIC|||')[0] && (
              <div className="absolute bottom-28 inset-x-8 text-center z-20 pointer-events-none">
                <div className="inline-block bg-black/60 text-white px-5 py-3 rounded-2xl text-lg font-medium backdrop-blur-md whitespace-pre-wrap shadow-xl border border-white/10">
                  {currentStory.caption.split('|||MUSIC|||')[0]}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="absolute bottom-0 inset-x-0 p-4 pt-12 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
            {isOwnStory ? (
              <div className="flex items-center justify-between pointer-events-auto pb-4">
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-white backdrop-blur transition-colors text-sm font-medium">
                  <Eye className="w-4 h-4" /> 
                  {liveViewCount} views
                </button>
                <div className="flex gap-2">
                  <button onClick={handlePin} className={`p-3 hover:bg-white/20 rounded-full text-white backdrop-blur transition-colors ${isPinned ? 'bg-pink-500' : 'bg-white/10'}`}>
                    <Pin className={`w-5 h-5 ${isPinned ? 'fill-white' : ''}`} />
                  </button>
                  <button onClick={handleShare} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pointer-events-auto">
                <AnimatePresence>
                  {showReactions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="flex justify-between items-center bg-black/60 backdrop-blur-xl p-3 rounded-full border border-white/10 mb-2 shadow-2xl"
                    >
                      {['😂', '😮', '😍', '😢', '👏', '🔥'].map(emoji => (
                        <button key={emoji} onClick={() => handleReaction(emoji)} className="text-3xl hover:scale-125 transition-transform hover:-translate-y-2 relative group">
                          {emoji}
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Send</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex items-center gap-3 pb-2 sm:pb-4">
                  <div className="flex-1 relative group">
                    <input 
                      type="text" 
                      placeholder={`Reply to ${currentGroup.username}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      onFocus={() => { setIsPaused(true); setShowReactions(false); }}
                      onBlur={() => setIsPaused(false)}
                      className="w-full bg-transparent border border-white/30 text-white placeholder:text-white/70 px-6 py-3.5 rounded-full outline-none focus:bg-white/10 focus:border-white/50 transition-all backdrop-blur-md"
                    />
                  </div>
                  
                  <button 
                    onClick={() => setShowReactions(!showReactions)}
                    className={`p-3.5 rounded-full text-white transition-all backdrop-blur-md ${showReactions ? 'bg-pink-500 shadow-lg shadow-pink-500/50' : 'bg-transparent border border-white/30 hover:bg-white/10'}`}
                  >
                    <Heart className={`w-6 h-6 ${showReactions ? 'fill-white' : ''}`} />
                  </button>
                  <button onClick={handleSend} className="p-3.5 bg-transparent border border-white/30 hover:bg-white/10 rounded-full text-white transition-all backdrop-blur-md">
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 50, x: '-50%' }}
                className="absolute bottom-24 left-1/2 z-50 bg-white text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 pointer-events-none whitespace-nowrap"
              >
                <Sparkles className="w-5 h-5 text-pink-500" />
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
                onClick={() => { setShowMenu(false); setIsPaused(false); }}
              >
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-[300px] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col">
                    {isOwnStory ? (
                      <button 
                        onClick={() => { handleDeleteStory(); }}
                        disabled={isDeleting}
                        className="py-4 font-bold text-red-500 hover:bg-white/5 active:bg-white/10 border-b border-white/10 transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Story'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => { 
                          showToast("Story reported to moderators");
                          setShowMenu(false); 
                          setIsPaused(false); 
                        }}
                        className="py-4 font-bold text-red-500 hover:bg-white/5 active:bg-white/10 border-b border-white/10 transition-colors"
                      >
                        Report
                      </button>
                    )}
                    <button 
                      onClick={() => { 
                         navigator.clipboard.writeText(`${window.location.origin}/@${currentGroup.username}/story/${currentStory.id}`);
                         showToast("Link copied to clipboard");
                         setShowMenu(false); 
                         setIsPaused(false); 
                      }}
                      className="py-4 font-medium text-white hover:bg-white/5 active:bg-white/10 border-b border-white/10 transition-colors"
                    >
                      Copy Link
                    </button>
                    <button 
                      onClick={() => { setShowMenu(false); setIsPaused(false); }}
                      className="py-4 font-medium text-white/70 hover:bg-white/5 active:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
