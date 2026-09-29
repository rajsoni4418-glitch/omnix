import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const EMOJI_CATEGORIES = [
  { name: 'Smileys & Emotion', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😶‍🌫️', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', ' yawning_face:', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'] },
  { name: 'Animals & Nature', emojis: ['🙈', '🙉', '🙊', '🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫', '🦔', '🦇', '熊', '🐻', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️', '🕸️', '🦂', '🦟', '🪰', '🪱', '🦠', '💐', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'] },
];

export default function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void, onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-zinc-950/95 backdrop-blur-xl rounded-t-3xl z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col p-4 border-b border-zinc-800">
        <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4" />
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search emojis..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 text-white rounded-full py-2 pl-10 pr-4 outline-none border border-zinc-800 focus:border-purple-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {EMOJI_CATEGORIES.map(category => {
          const emojis = category.emojis.filter(e => e.includes(searchQuery));
          if (emojis.length === 0 && searchQuery) return null;
          return (
            <div key={category.name} className="mb-6">
              {!searchQuery && <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 sticky top-0 bg-zinc-950/95 py-2">{category.name}</h4>}
              <div className="grid grid-cols-7 gap-2">
                {emojis.map((emoji, i) => (
                  <button 
                    key={i} 
                    onClick={() => onSelect(emoji)}
                    className="text-3xl hover:bg-zinc-800 rounded-lg p-1 transition-colors flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
