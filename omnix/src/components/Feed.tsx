import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { supabase } from '../lib/supabase';
import { Loader2, Sparkles, Clock, RefreshCw } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import PostCard from './PostCard';
import PostSkeleton from './performance/PostSkeleton';

import { useAuthStore } from '../store/authStore';

export default function Feed() {
  const [feedType, setFeedType] = useState<'forYou' | 'following'>(() => {
    return (localStorage.getItem('omnix_feed_type') as 'forYou' | 'following') || 'forYou';
  });
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);

  useEffect(() => {
    localStorage.setItem('omnix_feed_type', feedType);
  }, [feedType]);

  const fetchPosts = async ({ pageParam = 0 }) => {
    let query = supabase
      .from('posts')
      .select(`
        id,
        content:caption,
        caption,
        image_url,
        video_url,
        location,
        visibility,
        created_at,
        user_id,

        likes (id, user_id),
        comments (id)
      `)
      .order('created_at', { ascending: false })
      .range(pageParam * 10, (pageParam + 1) * 10 - 1);

    const { data, error } = await query;

    if (error) {
      console.warn('[Feed/fetchPosts] Query notice:', error);
      return [];
    }

    let profilesData: any[] = [];
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, is_verified, avatar_url')
          .in('id', userIds);
        if (profilesError) {
          console.warn('[Feed/fetchPosts] Could not retrieve profiles:', profilesError);
        } else if (profiles) {
          profilesData = profiles;
        }
      }
    }

    const mappedData = data?.map((post: any) => {
      return {
        ...post,
        content: post.caption || post.content || '',
        users: profilesData.find(p => p.id === post.user_id) || null
      };
    }) || [];

    if (feedType === 'forYou') {
      const shuffled = [...mappedData].sort((a, b) => {
        const scoreA = (a.likes?.length || 0) * 2 + (a.comments?.length || 0) * 3 + Math.random() * 5;
        const scoreB = (b.likes?.length || 0) * 2 + (b.comments?.length || 0) * 3 + Math.random() * 5;
        return scoreB - scoreA;
      });
      return shuffled;
    }

    return mappedData;
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery({
    queryKey: ['posts', feedType],
    queryFn: fetchPosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === 10 ? allPages.length : undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Pull to refresh logic
  const pullProgressRef = useRef(0);
  
  useEffect(() => {
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (startY > 0) {
        const y = e.touches[0].clientY;
        const diff = y - startY;
        if (diff > 0 && window.scrollY === 0) {
          e.preventDefault();
          const progress = Math.min(diff / 100, 1);
          pullProgressRef.current = progress;
          setPullProgress(progress);
        }
      }
    };
    
    const handleTouchEnd = async () => {
      if (pullProgressRef.current > 0.6) {
        setIsRefreshing(true);
        pullProgressRef.current = 1;
        setPullProgress(1); // lock at top
        await refetch();
        setIsRefreshing(false);
      }
      pullProgressRef.current = 0;
      setPullProgress(0);
      startY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [refetch]);


  const uniquePosts = new Map();
  data?.pages.forEach(page => {
    page?.forEach(post => {
      uniquePosts.set(post.id, post);
    });
  });
  
  const postsArray = Array.from(uniquePosts.values());

  return (
    <div className="pb-10 min-h-screen">
      {/* Pull to refresh indicator */}
      <div 
        className="flex justify-center items-center overflow-hidden transition-all duration-200"
        style={{ height: `${pullProgress * 50}px`, opacity: pullProgress }}
      >
        <RefreshCw className={`w-5 h-5 text-purple-500 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullProgress * 360}deg)` }} />
      </div>

      {/* Feed Toggle */}
      <div className="flex border-b border-zinc-800 bg-black/80 backdrop-blur-xl sticky top-[60px] z-30">
        <button
          onClick={() => setFeedType('forYou')}
          className={`flex-1 py-4 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${
            feedType === 'forYou' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
          aria-label="For You Feed"
        >
          <Sparkles className="w-4 h-4" />
          For You
        </button>
        <button
          onClick={() => setFeedType('following')}
          className={`flex-1 py-4 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${
            feedType === 'following' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
          aria-label="Following Feed"
        >
          <Clock className="w-4 h-4" />
          Following
        </button>
      </div>

      {status === 'error' ? (
        <div className="p-8 text-center text-red-500">
          Error loading feed. Please try again.
        </div>
      ) : postsArray.length > 0 ? (
        <Virtuoso
          useWindowScroll
          data={postsArray}
          endReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          itemContent={(index, post) => (
            <PostCard key={post.id} post={post} onDelete={() => refetch()} />
          )}
          components={{
            Footer: () => {
              if (isFetchingNextPage) {
                return (
                  <div className="flex flex-col">
                    <PostSkeleton />
                  </div>
                );
              }
              if (!hasNextPage && postsArray.length > 0) {
                return (
                  <div className="p-8 flex justify-center">
                    <span className="text-zinc-500 font-medium">You're all caught up! ✨</span>
                  </div>
                );
              }
              return <div className="h-20" />;
            }
          }}
        />
      ) : status === 'pending' ? (
        <div className="flex flex-col">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : (
        <div className="p-8 flex justify-center text-center">
          <span className="text-zinc-500">No posts yet. Be the first to share!</span>
        </div>
      )}
    </div>
  );
}
