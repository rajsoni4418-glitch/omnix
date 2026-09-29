import React, { useState } from 'react';
import { X, Send, Heart, MoreHorizontal } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

export default function CommentsModal({ clip, onClose }: { clip: any, onClose: () => void }) {
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  
  // Mock comments since we don't have omniclip_comments table
  const [comments, setComments] = useState([
    { id: 1, user: { username: 'alex', avatar: null }, text: 'This is amazing! 🔥', likes: 12, time: '2h' },
    { id: 2, user: { username: 'sarah', avatar: null }, text: 'Where was this filmed?', likes: 4, time: '5h' }
  ]);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    
    setComments([{
      id: Date.now(),
      user: { username: user.user_metadata?.username || 'user', avatar: null },
      text: commentText.trim(),
      likes: 0,
      time: 'Just now'
    }, ...comments]);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md h-[70vh] sm:h-[600px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="w-8" />
          <h3 className="text-white font-bold text-lg">{clip.comments_count || comments.length} Comments</h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3 group">
              <Link to={`/@${c.user.username}`} className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 flex items-center justify-center overflow-hidden">
                <span className="text-white text-xs font-bold">{c.user.username.charAt(0).toUpperCase()}</span>
              </Link>
              <div className="flex-1">
                <Link to={`/@${c.user.username}`} className="text-zinc-400 text-xs font-medium hover:underline">@{c.user.username}</Link>
                <p className="text-white text-sm mt-0.5">{c.text}</p>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-zinc-500 font-medium">
                  <span>{c.time}</span>
                  <button className="hover:text-zinc-300">Reply</button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0 px-2 pt-1">
                <button className="text-zinc-500 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-zinc-500 font-medium">{c.likes || ''}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 sm:rounded-b-2xl">
          <form onSubmit={handlePost} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
               <span className="text-white text-xs font-bold">{user?.user_metadata?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-black border border-zinc-800 rounded-full pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-500 hover:text-purple-400 disabled:opacity-50 disabled:hover:text-purple-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
