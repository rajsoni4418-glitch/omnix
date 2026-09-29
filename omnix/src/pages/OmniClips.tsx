import React, { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { supabase } from '../lib/supabase';


import { useAuthStore } from "../store/authStore";
import { Loader2, Film, Sparkles, UploadCloud, Search } from 'lucide-react';

import Clip from '../components/omniclips/Clip';
import UploadModal from '../components/omniclips/UploadModal';
import CommentsModal from '../components/omniclips/CommentsModal';
import ShareModal from '../components/omniclips/ShareModal';

export default function OmniClips() {
  const { user } = useAuthStore();
  
  
  
  const { ref, inView } = useInView();
  const [feedType, setFeedType] = useState<'forYou' | 'following' | 'trending'>('forYou');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Modals state
  const [activeCommentsClip, setActiveCommentsClip] = useState<any>(null);
  const [activeShareClip, setActiveShareClip] = useState<any>(null);

  // Active clip tracker
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchClips = async ({ pageParam = 0 }) => {
    let query = supabase
      .from('omniclips')
      .select(`
        id,
        video_url,
        thumbnail_url:thumbnail,
        caption,
        music_title:music,
        view_count:views,
        likes_count,
        comments_count,
        shares_count,
        created_at,
        user_id
      `)
      .range(pageParam * 10, (pageParam + 1) * 10 - 1);
      
    if (searchQuery) {
      query = query.or(`caption.ilike.%${searchQuery}%,music.ilike.%${searchQuery}%`);
    } else if (feedType === 'trending') {
      query = query.order('likes_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
        
    if (error) {
      console.warn('Omniclips query notice:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    const userIds = [...new Set(data.map(c => c.user_id).filter(Boolean))];
    let profilesMap: Record<string, any> = {};
    
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, display_name:full_name, is_verified:verified, avatar_url')
        .in('id', userIds);
      
      if (profilesData) {
        profilesMap = profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
      }
    }
    
    let userLikes = new Set();
    if (user && data && data.length > 0) {
      const clipIds = data.map(c => c.id);
      const { data: likesData } = await supabase
        .from('clip_likes')
        .select('clip_id')
        .in('clip_id', clipIds)
        .eq('user_id', user.id);
        
      if (likesData) {
        userLikes = new Set(likesData.map(l => l.clip_id));
      }
    }

    let processed = data.map(clip => ({
      ...clip,
      has_liked: userLikes.has(clip.id),
      profile: profilesMap[clip.user_id] || { 
        id: clip.user_id, 
        username: 'user_' + (clip.user_id?.substring(0, 5) || 'unknown'),
        display_name: 'Unknown User',
        avatar_url: null,
        is_verified: false
      }
    }));

    return processed;
  };

  const {
    data,
    isLoading,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ['omniclips', feedType, searchQuery],
    queryFn: fetchClips,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === 10 ? allPages.length : undefined;
    }
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Scroll listener to update active index
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex h-[calc(100vh-64px)] md:h-screen items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const allClips = data?.pages.flatMap(page => page) || [];

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen bg-black relative">
      
      {/* Top Navigation Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-12 pt-4 px-4 flex flex-col gap-3">
        <div className="flex justify-between items-center pointer-events-auto">
          <div className="flex gap-4 sm:gap-6 items-center flex-1">
            <button 
              onClick={() => {setFeedType('following'); setSearchQuery('');}}
              className={`font-bold text-sm sm:text-base drop-shadow-md transition-colors ${feedType === 'following' && !searchQuery ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              Following
            </button>
            <button 
              onClick={() => {setFeedType('forYou'); setSearchQuery('');}}
              className={`font-bold text-sm sm:text-base flex items-center gap-1 drop-shadow-md transition-colors ${feedType === 'forYou' && !searchQuery ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              For You {feedType === 'forYou' && !searchQuery && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
            </button>
            <button 
              onClick={() => {setFeedType('trending'); setSearchQuery('');}}
              className={`font-bold text-sm sm:text-base drop-shadow-md transition-colors ${feedType === 'trending' && !searchQuery ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              Trending
            </button>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setIsUploading(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-600/90 hover:bg-purple-600 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all shadow-lg"
              >
                <UploadCloud className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-xs pointer-events-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input 
              type="text"
              placeholder="Search clips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:bg-black/60 focus:border-white/40 transition-all placeholder:text-white/50"
            />
          </div>
        </div>
      </div>

      {/* Main Feed Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
      >
        {queryError ? (
          <div className="flex h-full items-center justify-center text-zinc-500 flex-col gap-4 p-4">
            <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center">
              <Film className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-400 text-center font-medium">Failed to load clips</p>
            <p className="text-zinc-500 text-sm max-w-xs text-center bg-zinc-900/50 p-3 rounded-lg border border-red-900/30">
              {(queryError as any).message || 'Unknown error occurred. Please check permissions or try again.'}
            </p>
            <button 
              onClick={() => refetch()}
              className="mt-2 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : allClips.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-500 flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
              <Film className="w-8 h-8 text-zinc-700" />
            </div>
            <p>{searchQuery ? 'No clips found.' : 'No OmniClips yet. Be the first!'}</p>
          </div>
        ) : (
          <>
            {allClips.map((clip, index) => (
              <Clip 
                key={clip.id} 
                clip={clip} 
                isActive={index === activeIndex}
                isNext={index === activeIndex + 1 || index === activeIndex + 2}
                onLike={() => { /* Handled locally in component for optimistic UI */ }}
                onOpenComments={() => setActiveCommentsClip(clip)}
                onShare={() => setActiveShareClip(clip)}
              />
            ))}
            
            <div ref={ref} className="snap-start h-20 flex items-center justify-center bg-black pb-8">
              {isFetchingNextPage ? (
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              ) : hasNextPage ? (
                <span className="text-zinc-500 text-sm">Scroll for more</span>
              ) : (
                <span className="text-zinc-500 text-sm">You're all caught up!</span>
              )}
            </div>
          </>
        )}
      </div>

      {isUploading && (
        <UploadModal 
          onClose={() => setIsUploading(false)} 
          onSuccess={() => { setIsUploading(false); refetch(); }} 
        />
      )}

      {activeCommentsClip && (
        <CommentsModal 
          clip={activeCommentsClip} 
          onClose={() => setActiveCommentsClip(null)} 
        />
      )}

      {activeShareClip && (
        <ShareModal 
          clip={activeShareClip} 
          onClose={() => setActiveShareClip(null)} 
        />
      )}

    </div>
  );
}
