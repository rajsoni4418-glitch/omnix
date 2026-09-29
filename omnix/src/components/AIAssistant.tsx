import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, Mic, ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

type Message = {
  role: 'user' | 'ai';
  content: string;
};

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hi! I am your Omnix AI Assistant. I can help you navigate, search for users, create clips, and summarize chats.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('ai_chats')
        .select('role, content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
        
      if (!error && data && data.length > 0) {
        setMessages(data as Message[]);
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);
    
    if (user) {
      supabase.from('ai_chats').insert({ user_id: user.id, role: 'user', content: userMessage }).then();
    }

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      let aiResponseText = '';
      setMessages(prev => [...prev, { role: 'ai', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'text') {
                aiResponseText += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = aiResponseText;
                  return updated;
                });
              } else if (data.type === 'functionCall') {
                for (const call of data.functionCalls) {
                  if (call.name === 'navigate') {
                    const path = call.args?.path;
                    if (path) {
                      navigate(path);
                      aiResponseText += `\n[Navigated to ${path}]`;
                    }
                  } else if (call.name === 'search') {
                    const { query, type } = call.args;
                    navigate(`/search?q=${encodeURIComponent(query)}&type=${type}`);
                    aiResponseText += `\n[Searching for ${query} in ${type}]`;
                  } else if (call.name === 'create_post') {
                    navigate('/ai-studio');
                    aiResponseText += `\n[Opening AI Studio to create ${call.args.type}]`;
                  }
                }
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = aiResponseText;
                  return updated;
                });
              } else if (data.type === 'error') {
                aiResponseText += `\n[Error: ${data.error}]`;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = aiResponseText;
                  return updated;
                });
              }
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }
      
      if (user && aiResponseText) {
        supabase.from('ai_chats').insert({ user_id: user.id, role: 'ai', content: aiResponseText }).then();
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full w-full bg-black flex flex-col z-50">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="md:hidden text-zinc-400 hover:text-white p-1 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Omnix AI</h3>
          <p className="text-xs text-purple-400">Personal Assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-zinc-800' : 'bg-gradient-to-tr from-purple-600 to-indigo-600'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
            </div>
            <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-zinc-800 text-white rounded-tr-none' : 'bg-purple-900/20 text-purple-100 border border-purple-500/20 rounded-tl-none whitespace-pre-wrap'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="p-3 bg-purple-900/20 text-purple-400 border border-purple-500/20 rounded-2xl rounded-tl-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-75" />
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/80 backdrop-blur-xl border-t border-zinc-800 pb-20 md:pb-4">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-zinc-900/50 text-white text-sm rounded-xl px-4 py-3 border border-zinc-800 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600"
          />
          <button
            type="button"
            className="p-3 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-all"
            onClick={() => alert("Voice mode coming soon!")}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:scale-100 hover:scale-105 shadow-lg shadow-purple-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
