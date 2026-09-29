import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Music, Volume2, VolumeX, Bookmark, RotateCcw } from 'lucide-react';
import { renderMentions } from '../../lib/username';
import { useAudioStore } from '../../store/audioStore';
import OptimizedImage from '../performance/OptimizedImage';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface ClipProps {
  clip: any;
  isActive: boolean;
  isNext: boolean;
  onLike: () => void;
  onOpenComments: () => void;
  onShare: () => void;
}

export default function Clip({ clip, isActive, isNext, onLike, onOpenComments, onShare }: ClipProps) {
  const { user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { isMuted, setIsMuted, toggleMute } = useAudioStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLikeAnim, setShowLikeAnim] = useState(false);
  const [isLiked, setIsLiked] = useState(clip.has_liked || false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(clip.likes_count || 0);
  const [videoError, setVideoError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(err => {
          if (err.name === 'NotAllowedError') {
            // Browser blocked autoplay with sound. Force mute and try again.
            if (videoRef.current) videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current?.play().then(() => setIsPlaying(true)).catch(e => {});
          }
        });
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMute();
  };

  const handleTogglePlay = () => {
    if (videoError && retryCount >= 2) {
      setRetryCount(0);
      setVideoError(false);
      if (videoRef.current) videoRef.current.load();
      return;
    }
    if (videoRef.current) {
      if (isMuted) {
        setIsMuted(false);
        if (!isPlaying) {
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      } else {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    }
  };

  const handleVideoError = () => {
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(r => r + 1);
        if (videoRef.current) {
          videoRef.current.load();
          if (isActive) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }
      }, 1000);
    } else {
      setVideoError(true);
      setIsPlaying(false);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    if (!isLiked) {
      handleLike(e);
    }
    
    // Show heart animation at click position
    setShowLikeAnim(true);
    setTimeout(() => setShowLikeAnim(false), 1000);
  };

  let clickTimer: NodeJS.Timeout | null = null;
  const handleClick = (e: React.MouseEvent) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      handleDoubleTap(e);
    } else {
      clickTimer = setTimeout(() => {
        handleTogglePlay();
        clickTimer = null;
      }, 250);
    }
  };

    const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(p => newLiked ? p + 1 : p - 1);
    onLike();
    
    try {
      if (newLiked) {
        await supabase.from('clip_likes').insert({ clip_id: clip.id, user_id: user.id });
      } else {
        await supabase.from('clip_likes').delete().eq('clip_id', clip.id).eq('user_id', user.id);
      }
    } catch(err) {
      console.error(err);
      setIsLiked(!newLiked);
      setLikesCount(p => newLiked ? p - 1 : p + 1);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen w-full snap-start relative bg-black flex justify-center items-center overflow-hidden">
      {!clip.video_url || videoError ? (
        clip.thumbnail_url ? (
          <OptimizedImage src={clip.thumbnail_url} alt={clip.caption || "Thumbnail"} className="h-full w-full object-cover cursor-pointer" objectFit="cover" onClick={handleClick} />
        ) : (
          <div className="text-zinc-500 font-medium">No video source</div>
        )
      ) : null}

      {clip.video_url && !videoError && (
        <video
          ref={videoRef}
          src={clip.video_url}
          className="h-full w-full object-cover cursor-pointer"
          loop
          muted={isMuted}
          playsInline
          preload={isActive || isNext ? "auto" : "none"}
          controls={false}
          onClick={handleClick}
          onError={handleVideoError}
        />
      )}
      
      {/* Play/Pause Indicator (Overlay) */}
      {!isPlaying && isActive && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1" />
          </div>
        </div>
      )}

      {videoError && isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 bg-black/20">
          <button 
            className="w-16 h-16 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 text-white pointer-events-auto hover:bg-black/80 transition-colors"
            onClick={(e) => { e.stopPropagation(); handleTogglePlay(); }}
          >
            <RotateCcw className="w-8 h-8" />
          </button>
          <span className="text-white text-sm mt-2 font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Video unavailable. Tap to retry.</span>
        </div>
      )}

      {/* Double Tap Heart Animation */}
      {showLikeAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 animate-ping duration-300">
          <Heart className="w-32 h-32 text-red-500 fill-red-500 opacity-80 scale-150 transition-transform" />
        </div>
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-10">
        <Link to={`/@${clip.profile?.username}`} className="flex flex-col items-center gap-1 group relative mb-2">
          <div className="w-11 h-11 rounded-full border-[1.5px] border-white overflow-hidden bg-zinc-800 relative shadow-lg">
            {clip.profile?.avatar_url ? (
              <OptimizedImage src={clip.profile.avatar_url} alt={clip.profile.username || 'user'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-white">
                {clip.profile?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center border-2 border-black shadow-md transition-transform group-hover:scale-110">
            <span className="text-white text-[12px] font-bold leading-none">+</span>
          </div>
        </Link>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group drop-shadow-md">
          <div className={`p-2.5 rounded-full transition-all ${isLiked ? 'bg-red-500/20' : 'bg-black/20 backdrop-blur-sm group-hover:bg-black/40'}`}>
            <Heart className={`w-7 h-7 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{likesCount > 0 ? likesCount : 'Like'}</span>
        </button>

        {/* Comment */}
        <button onClick={(e) => { e.stopPropagation(); onOpenComments(); }} className="flex flex-col items-center gap-1 group drop-shadow-md">
          <div className="p-2.5 bg-black/20 backdrop-blur-sm rounded-full group-hover:bg-black/40 transition-all">
            <MessageCircle className="w-7 h-7 text-white fill-white/20" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{clip.comments_count || 'Comment'}</span>
        </button>

        {/* Save */}
        <button onClick={handleSave} className="flex flex-col items-center gap-1 group drop-shadow-md">
          <div className="p-2.5 bg-black/20 backdrop-blur-sm rounded-full group-hover:bg-black/40 transition-all">
            <Bookmark className={`w-6 h-6 transition-colors ${isSaved ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Share */}
        <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="flex flex-col items-center gap-1 group drop-shadow-md">
          <div className="p-2.5 bg-black/20 backdrop-blur-sm rounded-full group-hover:bg-black/40 transition-all">
            <Share2 className="w-7 h-7 text-white fill-white/20" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">Share</span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-20 p-4 pb-6 md:pb-6 z-10 pointer-events-auto flex flex-col gap-2">
        <Link to={`/@${clip.profile?.username}`} className="flex items-center gap-2 w-max group drop-shadow-md">
          <span className="text-white font-bold text-[17px] group-hover:underline">@{clip.profile?.username}</span>
          {clip.profile?.is_verified && <span className="text-purple-400 text-sm">✓</span>}
        </Link>
        
        <p className="text-white/90 text-[15px] whitespace-pre-wrap leading-snug drop-shadow-md">
          {renderMentions(clip.caption)}
        </p>
        
        <div className="flex items-center gap-2 text-white mt-1 drop-shadow-md">
          <Music className="w-4 h-4 animate-spin-slow" />
          <span className="text-sm font-medium truncate max-w-[200px] hover:underline cursor-pointer">
            {clip.music_title || 'Original Audio'}
          </span>
        </div>
      </div>

      {/* Mute Toggle floating top right */}
      <button 
        onClick={handleToggleMute}
        className="absolute top-20 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors z-20 overflow-hidden"
      >
        <div key={isMuted ? 'muted' : 'unmuted'} className="animate-in zoom-in-50 duration-200 flex items-center justify-center">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </div>
      </button>
    </div>
  );
}
