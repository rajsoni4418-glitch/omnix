import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Highlight {
  id: string;
  title: string;
  cover_url: string;
}

interface StoryHighlightsProps {
  userId: string;
  isOwnProfile: boolean;
  highlights: Highlight[];
}

export default function StoryHighlights({ userId, isOwnProfile, highlights = [] }: StoryHighlightsProps) {
  const [isCreating, setIsCreating] = useState(false);
  
  return (
    <>
      <div className="px-4 py-4 overflow-x-auto scrollbar-hide flex gap-4">
        {isOwnProfile && (
          <div 
            className="flex flex-col items-center gap-2 cursor-pointer group min-w-[72px]"
            onClick={() => setIsCreating(true)}
          >
            <div className="w-16 h-16 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center transition-colors group-hover:bg-zinc-800">
              <Plus className="w-6 h-6 text-zinc-400" />
            </div>
            <span className="text-xs text-zinc-300 font-medium truncate w-16 text-center">New</span>
          </div>
        )}
        
        {highlights.map(h => (
          <div key={h.id} className="flex flex-col items-center gap-2 cursor-pointer group min-w-[72px]">
            <div className="w-16 h-16 rounded-full border border-zinc-700 bg-zinc-900 overflow-hidden flex items-center justify-center p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden relative bg-black">
                <img src={h.cover_url} alt={h.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-zinc-300 font-medium truncate w-16 text-center">{h.title}</span>
          </div>
        ))}
        
        {!isOwnProfile && highlights.length === 0 && (
          <div className="text-sm text-zinc-500 py-4 w-full text-center">No highlights yet</div>
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h3 className="text-lg font-bold text-white">New Highlight</h3>
                <button onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 flex-1 overflow-y-auto text-center">
                <p className="text-zinc-400 mb-4">Select stories to add to this highlight</p>
                <div className="grid grid-cols-3 gap-2">
                  {/* Empty state for demo */}
                  <div className="aspect-[9/16] bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-500">
                    No past stories
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-zinc-800">
                <button disabled className="w-full bg-purple-600/50 text-white/50 py-3 rounded-xl font-medium cursor-not-allowed">
                  Next
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
