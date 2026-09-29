import React, { useState } from 'react';
import { X, Link2, MessageCircle, Users, Check, Share } from 'lucide-react';

export default function ShareModal({ clip, onClose }: { clip: any, onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  
  const clipUrl = `${window.location.origin}/omniclips/${clip.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(clipUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `OmniClip by @${clip.profile?.username}`,
          text: clip.caption,
          url: clipUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full max-w-sm flex flex-col shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8">
        
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-white font-bold text-lg">Share</h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white rounded-full flex items-center justify-center transition-colors">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs text-zinc-400 font-medium">Chat</span>
          </button>

          <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white rounded-full flex items-center justify-center transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs text-zinc-400 font-medium">Community</span>
          </button>

          <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700'}`}>
              {copied ? <Check className="w-6 h-6" /> : <Link2 className="w-6 h-6" />}
            </div>
            <span className="text-xs text-zinc-400 font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          {navigator.share && (
            <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700 rounded-full flex items-center justify-center transition-colors">
                <Share className="w-6 h-6" />
              </div>
              <span className="text-xs text-zinc-400 font-medium">More</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
