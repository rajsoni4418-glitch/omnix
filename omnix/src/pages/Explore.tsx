import React, { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { supabase } from '../lib/supabase';
import { Loader2, Compass, Play, Heart, MessageCircle, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/performance/OptimizedImage';
import OptimizedVideo from '../components/performance/OptimizedVideo';


export default function Explore() {
  const { ref, inView } = useInView();

  const fetchExploreContent = async ({ pageParam = 0 }) => {
    // We'll fetch a mix of videos and images
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(pageParam * 20, (pageParam + 1) * 20 - 1);

    if (error) {
      console.warn('[Explore] query notice:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))];
    let profilesMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, display_name, is_verified')
        .in('id', userIds);

      if (profilesData) {
        profilesMap = profilesData.reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    return data.map(post => ({
      ...post,
      profiles: profilesMap[post.user_id] || { username: 'Unknown' }
    }));

  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['explore'],
    queryFn: fetchExploreContent,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length : undefined;
    }
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const items = data?.pages.flat() || [];

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-purple-500" />
          <h1 className="text-xl font-bold text-white">Explore</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors">
            Trending
          </button>
          <button className="px-4 py-1.5 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors">
            For You
          </button>
        </div>
      </div>

      <div className="p-2 sm:p-4">
        {status === 'pending' ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center p-8 text-zinc-500">
            No content found.
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
            {items.map((item, i) => (
              <ExploreCard key={`${item.id}-${i}`} item={item} />
            ))}
          </div>
        )}

        <div ref={ref} className="h-20 flex items-center justify-center mt-4">
          {isFetchingNextPage && <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />}
        </div>
      </div>
    </div>
  );
}

function ExploreCard({ item }: { item: any }) {
  const isVideo = item.video_url || (item.media_urls && item.media_urls[0]?.includes('.mp4'));
  const mediaUrl = item.media_urls?.[0] || item.video_url;

  return (
    <Link to={`/@${item.profiles?.username}`} className="break-inside-avoid block relative group rounded-2xl overflow-hidden bg-zinc-900">
      {mediaUrl ? (
        isVideo ? (
          <div className="relative aspect-[9/16]">
            <OptimizedVideo src={mediaUrl} className="w-full h-full object-cover" muted loop playsInline onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />
            <div className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full backdrop-blur-md">
              <Play className="w-4 h-4 text-white" />
            </div>
          </div>
        ) : (
          <OptimizedImage src={mediaUrl} alt="Explore" className="w-full h-auto" objectFit="cover" />
        )
      ) : (
        <div className="p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center aspect-square">
          <p className="text-white text-lg font-medium line-clamp-4">{item.content}</p>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="flex items-center gap-2 mb-2">
          <img loading="lazy"  src={item.profiles?.avatar_url} className="w-6 h-6 rounded-full object-cover border border-zinc-700" alt="" />
          <span className="text-white font-semibold text-sm truncate">{item.profiles?.username}</span>
          {item.profiles?.is_verified && <div className="text-blue-400 text-[10px]">✓</div>}
        </div>
        <p className="text-zinc-300 text-xs line-clamp-2">{item.content}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1 text-white text-sm font-medium">
            <Heart className="w-4 h-4" /> 
            <span>{Math.floor(Math.random() * 500) + 10}</span>
          </div>
          <div className="flex items-center gap-1 text-white text-sm font-medium">
            <MessageCircle className="w-4 h-4" /> 
            <span>{Math.floor(Math.random() * 50)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
