import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, Volume2, SwitchCamera, Maximize2 } from 'lucide-react';

export default function Call() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'audio';
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === 'audio');
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);

  // Mock user
  const chatUser = {
    id: id,
    username: 'user_' + (id?.slice(0, 4) || '1234'),
    display_name: 'User ' + (id?.slice(0, 4) || '1234'),
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
  };

  useEffect(() => {
    // Simulate connection process
    const ringTimer = setTimeout(() => setCallStatus('ringing'), 1500);
    const connectTimer = setTimeout(() => setCallStatus('connected'), 5000);

    return () => {
      clearTimeout(ringTimer);
      clearTimeout(connectTimer);
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (callStatus === 'connected') {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const endCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      navigate(-1);
    }, 1500);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (callStatus === 'ended') {
    return (
      <div className="flex h-screen bg-black items-center justify-center flex-col gap-4 text-white">
        <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden opacity-50 grayscale">
          <img src={chatUser.avatar_url} alt="" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold">Call Ended</h2>
        <p className="text-zinc-500">{formatDuration(duration)}</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-zinc-900 text-white overflow-hidden flex flex-col">
      {/* Background (either video or blurred avatar) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
        {isVideoOff || callStatus !== 'connected' ? (
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={chatUser.avatar_url} 
              alt="" 
              className="w-full h-full object-cover blur-3xl opacity-30 scale-125"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-zinc-800 animate-pulse flex items-center justify-center text-zinc-500">
            [Remote Video Feed]
          </div>
        )}
      </div>

      {/* Local Video Thumbnail */}
      {callStatus === 'connected' && !isVideoOff && (
        <div className="absolute top-16 right-4 w-28 h-40 bg-zinc-800 rounded-xl border-2 border-zinc-700 z-10 overflow-hidden shadow-2xl">
           <div className="w-full h-full bg-black flex items-center justify-center text-xs text-zinc-500 text-center px-2">
             [Local Feed]
           </div>
        </div>
      )}

      {/* Header Info */}
      <div className="relative z-10 p-8 flex flex-col items-center gap-4 mt-8">
        {(isVideoOff || callStatus !== 'connected') && (
          <div className="w-32 h-32 rounded-full border-4 border-zinc-800/50 overflow-hidden shadow-2xl relative">
            <img src={chatUser.avatar_url} alt="" className="w-full h-full object-cover relative z-10" />
            {callStatus === 'ringing' && (
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-ping opacity-75" />
            )}
          </div>
        )}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-1">{chatUser.display_name}</h1>
          <p className={`text-lg font-medium tracking-widest uppercase text-sm ${
            callStatus === 'connected' ? 'text-green-400' : 'text-zinc-400 animate-pulse'
          }`}>
            {callStatus === 'connecting' && 'Connecting...'}
            {callStatus === 'ringing' && 'Ringing...'}
            {callStatus === 'connected' && formatDuration(duration)}
          </p>
        </div>
      </div>

      <div className="flex-1" />

      {/* Controls */}
      <div className="relative z-10 bg-gradient-to-t from-black via-black/80 to-transparent p-8 pb-12">
        <div className="flex items-center justify-center gap-6 max-w-sm mx-auto">
          {type === 'video' && (
            <button className="p-4 rounded-full bg-zinc-800/80 backdrop-blur hover:bg-zinc-700 transition-colors hidden md:block">
              <SwitchCamera className="w-6 h-6" />
            </button>
          )}
          
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full backdrop-blur transition-all duration-300 ${
              isMuted ? 'bg-white text-black' : 'bg-zinc-800/80 text-white hover:bg-zinc-700'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full backdrop-blur transition-all duration-300 ${
              isVideoOff ? 'bg-white text-black' : 'bg-zinc-800/80 text-white hover:bg-zinc-700'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button 
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-4 rounded-full backdrop-blur transition-all duration-300 ${
              isSpeaker ? 'bg-white text-black' : 'bg-zinc-800/80 text-white hover:bg-zinc-700'
            }`}
          >
            <Volume2 className="w-6 h-6" />
          </button>
          
          <button 
            onClick={endCall}
            className="p-5 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 text-white transition-all hover:scale-105"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}
