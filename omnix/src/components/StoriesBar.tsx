import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Plus, User, Sparkles } from 'lucide-react';
import StoryCreator from './story/StoryCreator';
import StoryViewer from './story/StoryViewer';

export default function StoriesBar() {
  const { user } = useAuthStore();
  
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [viewerState, setViewerState] = useState<{ isOpen: boolean, initialUserIndex: number, initialStoryIndex: number }>({
    isOpen: false,
    initialUserIndex: 0,
    initialStoryIndex: 0
  });

  const { data: currentUserProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, username')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: stories, refetch } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          media_url,
          music,
          view_count,
          caption,
          created_at,
          user_id,
          user:users!stories_user_id_fkey(username, full_name)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data || [];
    }
  });

  const storyGroups = useMemo(() => {
    if (!stories) return [];
    
    const groupsMap = new Map();
    
    stories.forEach(story => {
      // Filter out close friends stories if not close friends... (Simplified for now, assuming public or own)
      // In a real app, backend RLS handles 'close_friends' privacy filtering.
      
      const dbUserRecord = Array.isArray(story.user) ? story.user[0] : story.user;
      
      if (!groupsMap.has(story.user_id)) {
        groupsMap.set(story.user_id, {
          userId: story.user_id,
          username: dbUserRecord?.username || 'Unknown',
          avatar_url: null, // Since users table doesn't have avatar_url
          stories: [],
          hasCloseFriends: false
        });
      }
      
      const group = groupsMap.get(story.user_id);
      group.stories.push(story);
    });
    
    const groupsArray = Array.from(groupsMap.values());
    const currentUserGroup = groupsArray.find(g => g.userId === user?.id);
    const otherGroups = groupsArray.filter(g => g.userId !== user?.id);
    
    return currentUserGroup ? [currentUserGroup, ...otherGroups] : otherGroups;
  }, [stories, user?.id]);

  const currentUserGroup = storyGroups.find(g => g.userId === user?.id);
  const currentUserHasStory = !!currentUserGroup;
  
  const getRingColor = (hasCloseFriends: boolean) => {
    return hasCloseFriends 
      ? 'from-green-400 via-emerald-500 to-teal-500' // Close friends ring
      : 'from-pink-500 via-purple-500 to-yellow-500'; // Standard ring
  };

  return (
    <>
      <div className="w-full bg-zinc-950 border-b border-zinc-900 pb-2">
        <div className="flex overflow-x-auto gap-4 p-4 scrollbar-hide items-center">
          {/* Create Story Button (always first) */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer relative min-w-[76px] group">
            <div 
              className={`w-[72px] h-[72px] rounded-full p-[2px] transition-transform group-hover:scale-105 ${
                currentUserHasStory ? `bg-gradient-to-tr ${getRingColor(currentUserGroup.hasCloseFriends)}` : 'bg-zinc-800'
              }`}
              onClick={() => {
                if (currentUserHasStory) {
                  setViewerState({ isOpen: true, initialUserIndex: 0, initialStoryIndex: 0 });
                } else {
                  setIsCreatorOpen(true);
                }
              }}
            >
              <div className="w-full h-full rounded-full bg-zinc-950 p-[3px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 shadow-inner">
                  {currentUserProfile?.avatar_url ? (
                    <img src={currentUserProfile.avatar_url} alt="Your story" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsCreatorOpen(true);
              }}
              className="absolute bottom-6 right-0 bg-purple-500 hover:bg-purple-400 rounded-full p-1.5 border-[3px] border-zinc-950 shadow-lg transition-transform hover:scale-110 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
            </button>
            
            <span className="text-xs text-zinc-400 font-medium tracking-tight">Your Story</span>
          </div>

          {/* Other Users' Stories */}
          {storyGroups.filter(g => g.userId !== user?.id).map((group, index) => (
            <div 
              key={group.userId} 
              className="flex flex-col items-center gap-1.5 cursor-pointer group min-w-[76px]"
              onClick={() => setViewerState({ isOpen: true, initialUserIndex: currentUserHasStory ? index + 1 : index, initialStoryIndex: 0 })}
            >
              <div className={`w-[72px] h-[72px] rounded-full p-[2px] bg-gradient-to-tr ${getRingColor(group.hasCloseFriends)} transition-transform group-hover:scale-105`}>
                <div className="w-full h-full rounded-full bg-zinc-950 p-[3px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 relative shadow-inner">
                    <img src={group.stories[0].media_url} alt="" className="w-full h-full object-cover opacity-60 absolute inset-0 mix-blend-overlay" />
                    {group.avatar_url ? (
                      <img src={group.avatar_url} alt="Avatar" className="w-full h-full object-cover relative z-10" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300 font-bold bg-black/60 relative z-10">
                        {group.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {group.hasCloseFriends && <Sparkles className="w-2.5 h-2.5 text-green-400" />}
                <span className="text-xs text-zinc-300 font-medium truncate w-16 text-center tracking-tight">
                  {group.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isCreatorOpen && (
        <StoryCreator 
          onClose={() => setIsCreatorOpen(false)} 
          onSuccess={() => {
            setIsCreatorOpen(false);
            refetch();
          }} 
        />
      )}

      {viewerState.isOpen && (
        <StoryViewer
          storyGroups={storyGroups}
          initialUserIndex={viewerState.initialUserIndex}
          initialStoryIndex={viewerState.initialStoryIndex}
          onClose={() => setViewerState({ ...viewerState, isOpen: false })}
        />
      )}
    </>
  );
}
