import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Copy, MessageCircle, Send, Globe2, MessageSquare, QrCode } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function ShareSheet({ post, onClose }: { post: any, onClose: () => void }) {
  const { user } = useAuthStore();
  const postUrl = `${window.location.origin}/post/${post.id}`;
  
  const handleShare = async (platform: string) => {
    try {
      if (user) {
        await supabase.from('shares').insert({
          post_id: post.id,
          user_id: user.id,
          platform
        });
        
        if (post.user_id !== user.id) {
          await supabase.from('notifications').insert({ user_id: post.user_id, type: 'share', title: `${user.user_metadata?.username || 'Someone'} shared your post` });
        }
      }
      
      if (platform === 'copy') {
        await navigator.clipboard.writeText(postUrl);
        alert('Link copied to clipboard!');
      } else if (platform === 'native' && navigator.share) {
        await navigator.share({
          title: 'Check out this post on Omnix',
          url: postUrl
        });
      }
      onClose();
    } catch (err) {
      console.error('Error sharing', err);
    }
  };

  const [showQr, setShowQr] = useState(false);

  const shareOptions = [
    { id: 'chat', label: 'Send in Chat', icon: Send, color: 'bg-blue-500', textColor: 'text-white' },
    { id: 'communities', label: 'Communities', icon: Globe2, color: 'bg-purple-500', textColor: 'text-white' },
    { id: 'copy', label: 'Copy Link', icon: Copy, color: 'bg-zinc-800', textColor: 'text-white' },
    { id: 'native', label: 'More Options', icon: MoreHorizontalIcon, color: 'bg-zinc-800', textColor: 'text-white' },
    { id: 'qr', label: 'QR Code', icon: QrCode, color: 'bg-zinc-800', textColor: 'text-white' },
  ];

  if (showQr) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowQr(false)} />
        <div className="relative bg-zinc-900 rounded-3xl p-8 border border-zinc-800 flex flex-col items-center shadow-2xl max-w-sm w-full">
           <div className="bg-white p-4 rounded-2xl mb-6">
             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(postUrl)}`} alt="QR Code" className="w-48 h-48" />
           </div>
           <h3 className="text-white font-bold text-xl text-center mb-2">Scan to View Post</h3>
           <p className="text-zinc-400 text-sm text-center mb-6">Anyone can scan this code with their camera to open the post directly in Omnix.</p>
           <button onClick={() => setShowQr(false)} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors">
             Close
           </button>
        </div>
      </div>
    );
  }

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
        className="relative bg-zinc-950 border-t border-zinc-800 rounded-t-3xl flex flex-col pb-safe"
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
          <h2 className="text-white font-bold text-lg">Share</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleShare('copy')}>
               <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:scale-105 transition-transform">
                 <Copy className="w-6 h-6" />
               </div>
               <span className="text-xs text-zinc-400 font-medium text-center">Copy Link</span>
            </div>
            {navigator.share && (
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleShare('native')}>
                 <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:scale-105 transition-transform">
                   <MoreHorizontalIcon className="w-6 h-6" />
                 </div>
                 <span className="text-xs text-zinc-400 font-medium text-center">More</span>
              </div>
            )}
            <div className="flex flex-col items-center gap-2 cursor-pointer">
               <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 transition-transform">
                 <Send className="w-6 h-6" />
               </div>
               <span className="text-xs text-zinc-400 font-medium text-center">Chat</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer">
               <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform">
                 <Globe2 className="w-6 h-6" />
               </div>
               <span className="text-xs text-zinc-400 font-medium text-center">Community</span>
            </div>
          </div>
          
          <div className="bg-zinc-900 rounded-2xl p-4 flex items-center gap-4">
             <div className="w-12 h-12 bg-black rounded-xl overflow-hidden shrink-0 border border-zinc-800 flex items-center justify-center">
               {post.media_urls?.[0] ? (
                 <img src={post.media_urls[0]} className="w-full h-full object-cover" />
               ) : (
                 <MessageSquare className="w-5 h-5 text-zinc-600" />
               )}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-white text-sm font-bold truncate">@{Array.isArray(post.users) ? post.users[0]?.username : post.users?.username}</p>
               <p className="text-zinc-500 text-xs truncate mt-0.5">{post.caption || 'No caption'}</p>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MoreHorizontalIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
  );
}
