import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Loader2, Video as VideoIcon, Play, Clock, Eye } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { timeAgo } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Videos() {
  const { user } = useAuthStore();
  
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select(`
            id,
            title,
            description,
            video_url,
            thumbnail_url,
            duration,
            view_count,
            created_at,
            user_id,
            users:user_id (id, username, display_name:full_name, is_verified:verified)
          `)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        return data?.map(video => ({
          ...video,
          profile: Array.isArray(video.users) ? video.users[0] : video.users
        })) || [];
      } catch (err) {
        console.error("Videos table might not exist:", err);
        return [];
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold text-white">Videos</h1>
      </div>

      {!videos || videos.length === 0 ? (
        <div className="flex flex-col h-[60vh] items-center justify-center text-zinc-500 gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
            <VideoIcon className="w-8 h-8 text-zinc-700" />
          </div>
          <p>No videos available right now.</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="group cursor-pointer">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 mb-3">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoIcon className="w-12 h-12 text-zinc-800" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-purple-600/90 backdrop-blur flex items-center justify-center pl-1">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                    {video.duration}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Link to={`/@${video.profile?.username}`} className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">
                    {video.profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </Link>
                <div>
                  <h3 className="text-white font-semibold line-clamp-2 leading-tight mb-1 group-hover:text-purple-400 transition-colors">
                    {video.title}
                  </h3>
                  <Link to={`/@${video.profile?.username}`} className="text-zinc-400 text-sm hover:text-white transition-colors" onClick={e => e.stopPropagation()}>
                    {video.profile?.display_name || video.profile?.username}
                  </Link>
                  <div className="text-zinc-500 text-xs flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {video.view_count || 0} views</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(video.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
