import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Coins } from 'lucide-react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { X, Users, MessageSquare, Heart, Gift, Send, Radio, Settings, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LiveStream() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'viewer';
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showGifts, setShowGifts] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      supabase.from('wallet_balances').select('coins').eq('user_id', user.id).single().then(({data}) => {
        if (data) setWalletBalance(data.coins);
      });
    }
  }, [user]);

  const sendGift = async (giftName: string, cost: number) => {
    if (!user) return alert('Please login to send gifts');
    if (walletBalance < cost) return alert('Not enough coins!');
    
    try {
      // Optimistic update
      setWalletBalance(prev => prev - cost);
      
      // Update DB
      await supabase.from('wallet_balances').update({ coins: walletBalance - cost }).eq('user_id', user.id);
      
      await supabase.from('wallet_transactions').insert([
        { user_id: user.id, type: 'debit', amount: cost, currency: 'COINS', title: `Sent ${giftName} Gift`, status: 'completed' }
      ]);
      
      await supabase.from('sent_gifts').insert([
        { sender_id: user.id, gift_name: giftName, coin_cost: cost }
      ]);
      
      // Send chat message
      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        user: user?.user_metadata?.display_name || user?.user_metadata?.username || 'Me',
        text: `Sent a ${giftName} 🎁!`,
        isSelf: true,
        isGift: true
      }]);
      setShowGifts(false);
    } catch (err) {
      console.error(err);
      alert('Failed to send gift');
    }
  };


  useEffect(() => {
    // Mock incoming messages
    const interval = setInterval(() => {
      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        user: `Viewer_${Math.floor(Math.random() * 1000)}`,
        text: ['Awesome!', 'Love this ❤️', 'Hello from Brazil', 'How do you do that?', '🔥'][Math.floor(Math.random() * 5)]
      }].slice(-50));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setChatMessages(prev => [...prev, {
      id: Math.random().toString(),
      user: user?.user_metadata?.display_name || 'Me',
      text: message,
      isSelf: true
    }]);
    setMessage('');
  };

  const endStream = () => {
    if (confirm("Are you sure you want to end the stream?")) {
      navigate('/live');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row">
      {/* Video Area */}
      <div className="relative flex-1 bg-zinc-900 flex items-center justify-center overflow-hidden">
        {mode === 'host' && !isVideoOff ? (
          <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-zinc-500 animate-pulse">
            [Camera Feed]
          </div>
        ) : mode === 'viewer' ? (
          <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-zinc-500">
            [Remote Stream Feed]
          </div>
        ) : (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-zinc-500">
            Camera Off
          </div>
        )}

        {/* Overlay Top */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
              <Radio className="w-3 h-3" /> LIVE
            </div>
            <div className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
              <Users className="w-3 h-3" /> 1,240
            </div>
            {mode === 'host' && (
              <div className="bg-black/60 backdrop-blur-md text-green-400 text-xs font-medium px-2 py-1 rounded-md">
                00:15:30
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/live')}
            className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Host Controls */}
        {mode === 'host' && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-6">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full backdrop-blur-md transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-zinc-800/80 text-white hover:bg-zinc-700'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-4 rounded-full backdrop-blur-md transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-zinc-800/80 text-white hover:bg-zinc-700'}`}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
            <button className="p-4 rounded-full bg-zinc-800/80 backdrop-blur-md text-white hover:bg-zinc-700 transition-colors">
              <Settings className="w-6 h-6" />
            </button>
            <button onClick={endStream} className="px-6 py-4 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">
              End Stream
            </button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="w-full md:w-80 lg:w-96 h-1/2 md:h-full bg-black border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-bold">Live Chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`text-sm ${msg.isGift ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-2 rounded-lg border border-purple-500/30' : ''}`}>
              <span className={`font-bold mr-2 ${msg.isSelf ? 'text-purple-400' : 'text-zinc-400'}`}>
                {msg.user}
              </span>
              <span className={`text-white break-words ${msg.isGift ? 'font-bold text-purple-200' : ''}`}>{msg.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          {mode === 'viewer' && (
            <div className="relative">
              {showGifts && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white font-bold text-sm">Send Gift</h3>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-500/10 px-2 py-1 rounded-full">
                      <Coins className="w-3 h-3" /> {walletBalance}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'Rose', cost: 10, emoji: '🌹' },
                      { name: 'Coffee', cost: 50, emoji: '☕' },
                      { name: 'Heart', cost: 100, emoji: '💖' },
                      { name: 'Crown', cost: 500, emoji: '👑' },
                      { name: 'Rocket', cost: 1000, emoji: '🚀' },
                      { name: 'Diamond', cost: 5000, emoji: '💎' },
                    ].map(gift => (
                      <button 
                        key={gift.name}
                        onClick={() => sendGift(gift.name, gift.cost)}
                        className="bg-black border border-zinc-800 rounded-xl p-2 flex flex-col items-center justify-center gap-1 hover:border-purple-500 transition-colors"
                      >
                        <span className="text-2xl">{gift.emoji}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">{gift.cost}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between mb-3 px-2">
                <button className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 text-pink-500 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowGifts(!showGifts)}
                  className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 text-yellow-500 transition-colors flex items-center gap-2 px-4"
                >
                  <Gift className="w-5 h-5" />
                  <span className="text-xs font-bold text-white">Send Gift</span>
                </button>
              </div>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say something..."
              className="flex-1 bg-zinc-900 text-white rounded-xl px-4 py-2 text-sm border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!message.trim()}
              className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
