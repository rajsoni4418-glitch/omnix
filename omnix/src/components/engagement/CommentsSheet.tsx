import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import {
  X, Send, Heart, Reply, MoreHorizontal, Smile, Image as ImageIcon,
  CheckCircle2, Trash2, Edit2, Copy, Flag, Pin, Globe2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { renderMentions } from '../../lib/username';

export default function CommentsSheet({ post, onClose }: { post: any, onClose: () => void }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchComments();
    
    // Realtime subscription
    const channel = supabase.channel(`public:comments-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` }, payload => {
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
          *,
          profiles:user_id (id, username, avatar_url, display_name),
          
        `)
        .eq('post_id', post.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || submitting) return;
    
    setSubmitting(true);
    const content = newComment.trim();
    setNewComment('');
    
    // Optimistic UI
    const optimisticId = `temp-${Date.now()}`;
    const optimisticComment = {
      id: optimisticId,
      post_id: post.id,
      user_id: user.id,
      comment: content,
      parent_id: replyingTo?.id || null,
      created_at: new Date().toISOString(),
      likes: [],
      reply_count: 0,
      is_pinned: false,
      is_edited: false,
      profiles: {
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url
      }
    };
    
    setComments(prev => [...prev, optimisticComment]);
    
    try {
      const { data, error } = await supabase.from('comments').insert({
        post_id: post.id,
        user_id: user.id,
        comment: content,
        parent_id: replyingTo?.id || null
      }).select().single();
      
      if (error) throw error;
      
      // Notify post owner
      if (post.user_id !== user.id && !replyingTo) {
         await supabase.from('notifications').insert({ user_id: post.user_id, type: 'comment', title: `${user.user_metadata?.username || 'Someone'} commented on your post` });
      }
      
      // Notify reply target
      if (replyingTo && replyingTo.user_id !== user.id) {
         await supabase.from('notifications').insert({ user_id: replyingTo.user_id, type: 'comment', title: `${user.user_metadata?.username || 'Someone'} replied to your comment` });
      }
      
    } catch (error) {
      console.error('Error adding comment', error);
      // Remove optimistic comment
      setComments(prev => prev.filter(c => c.id !== optimisticId));
    } finally {
      setSubmitting(false);
      setReplyingTo(null);
    }
  };

  // Helper to build a tree
  const rootComments = comments.filter(c => !c.parent_id);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {} as Record<string, any[]>);

  const renderComment = (comment: any, isReply = false) => {
    const isLiked = comment.likes?.some((l: any) => l.user_id === user?.id);
    const likeCount = comment.likes?.length || 0;
    const isOwner = user?.id === comment.user_id;
    const isPostCreator = user?.id === post.user_id;
    
    const handleLike = async () => {
      if (!user) return;
      
      // Optimistic
      const updatedComments = comments.map(c => {
        if (c.id === comment.id) {
          const newLikes = isLiked 
            ? c.likes.filter((l: any) => l.user_id !== user.id)
            : [...c.likes, { user_id: user.id }];
          return { ...c, likes: newLikes };
        }
        return c;
      });
      setComments(updatedComments);
      
      try {
        if (isLiked) {
          // removed
        } else {
          // removed
          if (comment.user_id !== user.id) {
            await supabase.from('notifications').insert({ user_id: comment.user_id, type: 'like', title: `${user.user_metadata?.username || 'Someone'} liked your comment` });
          }
        }
      } catch (err) {
        console.error('Like error', err);
        // revert is handled by realtime or simple refetch in production
      }
    };

    return (
      <div key={comment.id} className={`flex gap-3 mb-4 ${isReply ? 'ml-10 mt-3' : 'mt-4'}`}>
        <Link to={`/@${comment.profiles?.username}`} className="flex-shrink-0">
          {comment.profiles?.avatar_url ? (
             <img src={comment.profiles.avatar_url} className="w-8 h-8 rounded-full object-cover" />
          ) : (
             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
               {comment.profiles?.username?.charAt(0).toUpperCase() || 'U'}
             </div>
          )}
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link to={`/@${comment.profiles?.username}`} className="font-bold text-sm text-white hover:underline">
              {comment.profiles?.username}
            </Link>
            {comment.user_id === post.user_id && (
              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold">Creator</span>
            )}
            <span className="text-xs text-zinc-500">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
            {comment.is_edited && <span className="text-[10px] text-zinc-500 font-medium">Edited</span>}
            {comment.is_pinned && <Pin className="w-3 h-3 text-yellow-500" />}
          </div>
          
          <p className="text-zinc-200 text-sm mt-0.5 leading-relaxed break-words whitespace-pre-wrap">{renderMentions(comment.content || comment.comment)}</p>
          
          <div className="flex items-center gap-4 mt-2">
            <button onClick={() => { setReplyingTo(comment); inputRef.current?.focus(); }} className="text-xs text-zinc-400 hover:text-white font-bold transition-colors">Reply</button>
            <button className="text-xs text-zinc-500 hover:text-white font-bold transition-colors">Translate</button>
          </div>
          
          {/* Nested Replies */}
          {repliesByParent[comment.id] && (
             <div className="mt-2">
               {repliesByParent[comment.id].map((reply: any) => renderComment(reply, true))}
             </div>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-1 pl-2">
          <button onClick={handleLike} className={`p-1.5 rounded-full transition-colors ${isLiked ? 'text-red-500 hover:bg-red-500/10' : 'text-zinc-500 hover:text-red-400 hover:bg-zinc-800'}`}>
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          {likeCount > 0 && <span className="text-xs text-zinc-500 font-medium">{likeCount}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-zinc-950 border-t border-zinc-800 rounded-t-3xl flex flex-col max-h-[85vh] h-[85vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
          <h2 className="text-white font-bold text-lg">Comments <span className="text-zinc-500 text-sm font-normal">({comments.length})</span></h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-800 rounded w-24" />
                    <div className="h-3 bg-zinc-800 rounded w-full max-w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : rootComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 py-10">
              <MessageCircleIcon className="w-12 h-12 mb-3 text-zinc-800" />
              <p className="font-medium text-white mb-1">No comments yet</p>
              <p className="text-sm">Be the first to share your thoughts.</p>
            </div>
          ) : (
            <div className="pb-20">
              {rootComments.map(comment => renderComment(comment))}
            </div>
          )}
        </div>
        
        {/* Comment Input */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 safe-bottom">
          {replyingTo && (
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-2 bg-zinc-800/50 py-1.5 rounded">
              <span>Replying to <span className="font-bold text-white">@{replyingTo.profiles?.username}</span></span>
              <button onClick={() => setReplyingTo(null)} className="hover:text-white"><X className="w-3 h-3" /></button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 bg-black/50 border border-zinc-800 rounded-2xl flex flex-col focus-within:border-purple-500/50 transition-colors">
              <input
                ref={inputRef}
                type="text"
                placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full bg-transparent text-white px-4 py-3 outline-none text-sm placeholder:text-zinc-600"
              />
              <div className="flex items-center justify-between px-3 pb-2 pt-1">
                <div className="flex items-center gap-2">
                  <button type="button" className="text-zinc-500 hover:text-purple-400 transition-colors p-1"><Smile className="w-4 h-4" /></button>
                  <button type="button" className="text-zinc-500 hover:text-blue-400 transition-colors p-1"><ImageIcon className="w-4 h-4" /></button>
                  <button type="button" className="text-zinc-500 hover:text-green-400 transition-colors p-1 font-bold text-xs uppercase">GIF</button>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={!newComment.trim() || submitting}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all h-[52px] w-[52px] shrink-0
                ${newComment.trim() ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:bg-purple-600' : 'bg-zinc-800 text-zinc-500'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function MessageCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  );
}
