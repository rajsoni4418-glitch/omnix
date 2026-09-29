import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { X, Send, MoreHorizontal, Smile, Trash2, Flag, Image as ImageIcon } from 'lucide-react';
import { timeAgo } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface CommentsModalProps {
  post: any;
  onClose: () => void;
  onUpdateCount: (count: number) => void;
}

export default function CommentsModal({ post, onClose, onUpdateCount }: CommentsModalProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
    
    const channel = supabase
      .channel(`public:comments:post_id=eq.${post.id}-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content:comment,
          created_at,
          user_id,
          users:user_id (id, username, display_name:full_name)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
      onUpdateCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          comment: newComment.trim()
        });

      if (error) throw error;
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await supabase.from('comments').delete().eq('id', commentId);
      fetchComments();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative flex-1 sm:max-w-xl w-full mx-auto bg-zinc-950 flex flex-col sm:rounded-2xl sm:max-h-[85vh] mt-auto sm:mt-10 overflow-hidden border border-zinc-800 shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-white text-center flex-1">Comments</h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors absolute right-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-zinc-800 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-zinc-500 p-8">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => {
              const profile = Array.isArray(comment.users) ? comment.users[0] : comment.users;
              const isOwnComment = user?.id === comment.user_id;

              return (
                <div key={comment.id} className="flex gap-3 group">
                  <Link to={`/@${profile?.username}`} className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold bg-zinc-800 text-xs">
                        {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <div className="bg-zinc-900 rounded-2xl rounded-tl-none p-3 relative">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/@${profile?.username}`} className="font-semibold text-white text-sm hover:underline">
                          {profile?.display_name || profile?.username}
                        </Link>
                        <span className="text-xs text-zinc-500">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-zinc-200 whitespace-pre-wrap">{comment.content}</p>
                      
                      {isOwnComment && (
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 text-red-500 p-2 hover:bg-zinc-800 rounded-full transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-zinc-500 font-medium">
                      <button className="hover:text-zinc-300">Reply</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 mb-1">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="You" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold bg-zinc-800 text-xs">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 relative bg-zinc-900 rounded-3xl border border-zinc-800 focus-within:border-zinc-700 transition-colors">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-transparent text-white text-sm resize-none outline-none max-h-32 min-h-[44px] py-3 px-4 pr-12 scrollbar-hide"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="absolute right-2 bottom-1.5 p-2 text-purple-500 hover:text-purple-400 disabled:opacity-50 disabled:hover:text-purple-500 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
