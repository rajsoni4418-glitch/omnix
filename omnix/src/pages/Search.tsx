import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Search as SearchIcon, Loader2, User, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { useAuthStore } from '../store/authStore';

type SearchTab = 'posts' | 'users' | 'videos' | 'stories' | 'communities' | 'hashtags' | 'music' | 'locations';

export default function Search() {
  const [query, setQuery] = useState('');
  const [isAISearch, setIsAISearch] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('posts');
  const { user } = useAuthStore();

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, activeTab],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];

      if (activeTab === 'posts' || activeTab === 'videos' || activeTab === 'locations' || activeTab === 'hashtags') {
        let q = supabase
          .from('posts')
          .select(`
            id,
            content:caption,
            caption,
            image_url,
            video_url,
            location,
            created_at,
            user_id,

            likes (id, user_id),
            comments (id)
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (activeTab === 'videos') {
          q = q.not('video_url', 'is', null).or(`caption.ilike.%${debouncedQuery}%`);
        } else if (activeTab === 'locations') {
          q = q.ilike('location', `%${debouncedQuery}%`);
        } else if (activeTab === 'hashtags') {
          q = q.ilike('caption', `%#${debouncedQuery}%`);
        } else {
          q = q.or(`caption.ilike.%${debouncedQuery}%,location.ilike.%${debouncedQuery}%`);
        }

        const { data, error } = await q;
        if (error) throw error;

        let profilesData: any[] = [];
        if (data && data.length > 0) {
          const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))];
          if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, username, display_name:full_name, is_verified:verified, avatar_url')
              .in('id', userIds);
            if (!profilesError && profiles) {
              profilesData = profiles;
            }
          }
        }

        const results = data?.map((post: any) => {
          return {
            ...post,
            content: post.content || '',
            users: profilesData.find(p => p.id === post.user_id) || { username: 'unknown' }
          };
        }) || [];

        return results;
      } else if (activeTab === 'users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, display_name:full_name, is_verified:verified, avatar_url')
          .or(`username.ilike.%${debouncedQuery}%,full_name.ilike.%${debouncedQuery}%`)
          .limit(20);

        if (error) throw error;
        return data || [];
      } else {
        // Mock data for other tabs that lack tables
        return [];
      }
    },
    enabled: !!debouncedQuery.trim()
  });

  const tabs: { id: SearchTab, label: string }[] = [
    { id: 'posts', label: 'Posts' },
    { id: 'users', label: 'Users' },
    { id: 'videos', label: 'Videos' },
    { id: 'stories', label: 'Stories' },
    { id: 'communities', label: 'Communities' },
    { id: 'hashtags', label: 'Hashtags' },
    { id: 'music', label: 'Music' },
    { id: 'locations', label: 'Locations' },
  ];

  const renderTrending = () => (
    <div className="p-4">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-purple-500" />
        Trending Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {['#summer2026', 'AI Art', 'Gaming Moments', 'Tech News', 'Travel Vlogs'].map(tag => (
          <button 
            key={tag}
            onClick={() => setQuery(tag)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <div className="relative">
          {isAISearch && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl pointer-events-none animate-pulse" />
          )}
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Omnix..."
            className="w-full bg-zinc-900 text-white rounded-2xl pl-12 pr-4 py-3 border border-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            autoFocus
            aria-label="Search"
          />
        </div>

        <div className="flex gap-4 mt-4 overflow-x-auto no-scrollbar pb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 text-sm font-semibold transition-colors whitespace-nowrap relative flex items-center gap-1 ${
                activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {!debouncedQuery.trim() ? (
          renderTrending()
        ) : isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : searchResults?.length === 0 ? (
          <div className="text-center p-8 text-zinc-500">
            No results found for "{debouncedQuery}" in {activeTab}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(activeTab === 'posts' || activeTab === 'videos' || activeTab === 'locations' || activeTab === 'hashtags') ? (
              searchResults?.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : activeTab === 'users' ? (
              <div className="grid gap-4">
                {searchResults?.map((profile: any) => (
                  <Link
                    key={profile.id}
                    to={`/@${profile.username}`}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800"
                  >
                    <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-zinc-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-white">{profile.display_name || profile.username}</span>
                        {profile.is_verified && <span className="text-purple-500 text-sm">✓</span>}
                      </div>
                      <span className="text-zinc-500 text-sm">@{profile.username}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-zinc-500">
                {activeTab} search is coming soon.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
