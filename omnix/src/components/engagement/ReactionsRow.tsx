import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { X } from 'lucide-react';

const REACTIONS = ['❤️', '🔥', '😂', '😍', '😮', '😢', '👏', '👍', '👎'];

export default function ReactionsRow({ post }: { post: any }) {
  const { user } = useAuthStore();
  const [reactions, setReactions] = useState<any[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchReactions();
    

  }, [post.id]);

  const fetchReactions = async () => {
    if ((window as any).__REACTIONS_MISSING) return;
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('post_id', post.id);
        
      if (error) {
        if (error.message.includes('find the table') || error.message.includes('relation') || error.message.includes('does not exist')) {
          (window as any).__REACTIONS_MISSING = true;
          return;
        }
        throw error;
      }
      
      setReactions(data || []);
      
      if (user) {
        const ur = (data || []).find(r => r.user_id === user.id);
        setUserReaction(ur ? ur.reaction_type : null);
      }
    } catch (err: any) {
      if (err?.message?.includes('find the table') || err?.message?.includes('does not exist')) {
        (window as any).__REACTIONS_MISSING = true;
        return;
      }
      console.warn('Error fetching reactions', err);
    }
  };

  const handleReact = async (reaction: string) => {
    if (!user) return;
    
    try {
      if (userReaction === reaction) {
        // Toggle off
        setUserReaction(null);
        setReactions(prev => prev.filter(r => !(r.user_id === user.id && r.reaction_type === reaction)));
        const { error } = await supabase.from('reactions').delete().eq('post_id', post.id).eq('user_id', user.id).eq('reaction_type', reaction);
        if (error && error.message.includes('find the table')) {
             (window as any).__REACTIONS_MISSING = true;
             console.warn('Reactions table missing, migration needed.');
        }
      } else {
        // Optimistic
        setUserReaction(reaction);
        setReactions(prev => {
          const filtered = prev.filter(r => r.user_id !== user.id);
          return [...filtered, { user_id: user.id, reaction_type: reaction }];
        });
        
        // Upsert basically (delete existing for user then insert)
        await supabase.from('reactions').delete().eq('post_id', post.id).eq('user_id', user.id);
        const { error } = await supabase.from('reactions').insert({ post_id: post.id, user_id: user.id, reaction_type: reaction });
        if (error && error.message.includes('find the table')) {
             (window as any).__REACTIONS_MISSING = true;
             console.warn('Reactions table missing, migration needed.');
        }
      }
    } catch (err) {
      console.error('Reaction error', err);
    }
  };

  const reactionCounts = REACTIONS.reduce((acc, emoji) => {
    acc[emoji] = reactions.filter(r => r.reaction_type === emoji).length;
    return acc;
  }, {} as Record<string, number>);

  const activeReactions = REACTIONS.filter(r => reactionCounts[r] > 0);

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {activeReactions.map(emoji => (
        <button 
          key={emoji}
          onClick={() => handleReact(emoji)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold transition-all border
            ${userReaction === emoji 
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
        >
          <span>{emoji}</span>
          <span>{reactionCounts[emoji]}</span>
        </button>
      ))}
      <div className="relative group/reaction">
         <button className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-zinc-400 text-sm">
           +
         </button>
         <div className="absolute bottom-full left-0 mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex gap-1 opacity-0 group-hover/reaction:opacity-100 pointer-events-none group-hover/reaction:pointer-events-auto transition-opacity z-10 w-max">
           {REACTIONS.map(emoji => (
             <button
               key={emoji}
               onClick={() => handleReact(emoji)}
               className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded-full hover:scale-110 transition-all text-lg"
             >
               {emoji}
             </button>
           ))}
         </div>
      </div>
      {user && post.user_id === user.id && reactions.length > 0 && (
        <button onClick={() => setShowAnalytics(true)} className="ml-auto flex items-center text-xs text-zinc-500 font-medium cursor-pointer hover:text-white transition-colors">
          View Analytics
        </button>
      )}

      <AnimatePresence>
        {showAnalytics && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAnalytics(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[70vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
                <h2 className="text-white font-bold text-lg">Reaction Analytics</h2>
                <button onClick={() => setShowAnalytics(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                <div className="flex flex-col gap-3">
                  {activeReactions.sort((a, b) => reactionCounts[b] - reactionCounts[a]).map(emoji => (
                    <div key={emoji} className="flex items-center justify-between p-3 bg-black/50 rounded-xl border border-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{emoji}</span>
                        <div className="h-2 w-32 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full" 
                            style={{ width: `${(reactionCounts[emoji] / reactions.length) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-white font-bold">{reactionCounts[emoji]}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/50 text-center text-xs text-zinc-500">
                  Total Reactions: {reactions.length}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
