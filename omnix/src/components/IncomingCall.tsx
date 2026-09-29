import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Video } from 'lucide-react';

export default function IncomingCall() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [caller, setCaller] = useState<{ id: string; name: string; avatar: string; type: 'audio' | 'video' } | null>(null);

  useEffect(() => {
    // Listen for real incoming call events via WebSocket/Supabase Realtime
    // Set caller and isVisible when a real call event is received.
  }, []);

  if (!isVisible || !caller) return null;

  const handleAccept = () => {
    setIsVisible(false);
    navigate(`/call/${caller.id}?type=${caller.type}`);
  };

  const handleDecline = () => {
    setIsVisible(false);
    // Maybe add to call history / missed calls
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-[100] p-4 flex items-center gap-4 animate-in slide-in-from-top-10 fade-in duration-300">
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-zinc-800 overflow-hidden">
          <img src={caller.avatar} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center border-2 border-zinc-900">
          {caller.type === 'video' ? <Video className="w-3 h-3 text-white" /> : <Phone className="w-3 h-3 text-white" />}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-bold truncate">{caller.name}</h3>
        <p className="text-zinc-400 text-sm">Incoming {caller.type} call...</p>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={handleDecline}
          className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
        >
          <PhoneOff className="w-5 h-5 text-white" />
        </button>
        <button 
          onClick={handleAccept}
          className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors animate-pulse"
        >
          <Phone className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
