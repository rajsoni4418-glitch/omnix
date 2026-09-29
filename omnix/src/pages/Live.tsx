import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Users, Play, Radio, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const MOCK_STREAMS = [
  { id: 'stream_1', title: 'Late Night Coding 💻', host: 'Alex Dev', viewers: 1240, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80' },
  { id: 'stream_2', title: 'Q&A: Building Startups', host: 'Sarah Jane', viewers: 856, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', thumbnail: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=500&q=80' },
  { id: 'stream_3', title: 'Gaming Lounge 🎮', host: 'GamerX', viewers: 3420, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gamerx', thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80' },
  { id: 'stream_4', title: 'Music Production Live', host: 'DJ Beatz', viewers: 432, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dj', thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&q=80' },
];

export default function Live() {
  const navigate = useNavigate();

  const handleGoLive = () => {
    const id = 'my_stream_' + Math.random().toString(36).substring(7);
    navigate(`/live/${id}?mode=host`);
  };

  return (
    <div className="pb-8 min-h-screen bg-black">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-500 animate-pulse" />
            Live Now
          </h1>
          <button 
            onClick={handleGoLive}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full transition-colors"
          >
            <Video className="w-4 h-4" />
            Go Live
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOCK_STREAMS.map(stream => (
            <Link key={stream.id} to={`/live/${stream.id}`} className="group relative rounded-2xl overflow-hidden aspect-video bg-zinc-900 border border-zinc-800 hover:border-purple-500 transition-colors">
              <img src={stream.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <Radio className="w-3 h-3" /> LIVE
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
                    <Users className="w-3 h-3" /> {stream.viewers.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-purple-500 overflow-hidden bg-zinc-800">
                    <img src={stream.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold leading-tight group-hover:text-purple-400 transition-colors line-clamp-1">{stream.title}</h3>
                    <p className="text-sm text-zinc-300">{stream.host}</p>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-purple-600/90 flex items-center justify-center backdrop-blur-md">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
