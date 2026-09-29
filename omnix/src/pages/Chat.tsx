import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { ArrowLeft, Phone, Video, Info, Image as ImageIcon, Mic, Send, MoreVertical, Check, CheckCheck, Trash2, Edit2, X, Paperclip } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { renderMentions } from '../lib/username';

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { sessions, addMessage, markAsRead, onlineUsers, deleteMessage, editMessage } = useChatStore();
  const session = sessions[id || ''];
  const messages = session?.messages || [];

  // Mock user for now since we don't have real users
  const chatUser = {
    id: id,
    username: session?.isGroup ? (session.groupName?.toLowerCase().replace(/\s+/g, '_') || 'group') : 'user_' + (id?.slice(0, 4) || '1234'),
    display_name: session?.isGroup ? (session.groupName || 'Group') : 'User ' + (id?.slice(0, 4) || '1234'),
    avatar_url: session?.isGroup ? session.groupAvatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    isOnline: session?.isGroup ? true : !!onlineUsers[id || '']
  };

  useEffect(() => {
    if (id) {
      markAsRead(id);
    }
    scrollToBottom();
  }, [id, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!text.trim() || !user || !id) return;

    if (editingId) {
      editMessage(id, editingId, text);
      setEditingId(null);
      setText('');
      return;
    }

    addMessage(id, {
      id: Math.random().toString(36).substring(7),
      senderId: user.id,
      receiverId: id,
      content: text,
      type: 'text',
      createdAt: new Date().toISOString(),
      read: false,
      status: 'sent'
    });
    
    setText('');
    
    // Simulate reply
    setTimeout(() => {
      addMessage(id, {
        id: Math.random().toString(36).substring(7),
        senderId: id,
        receiverId: user.id,
        content: `This is an automated reply to: "${text}"`,
        type: 'text',
        createdAt: new Date().toISOString(),
        read: false,
        status: 'sent'
      });
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startCall = (type: 'audio' | 'video') => {
    navigate(`/call/${id}?type=${type}`);
  };

  const startEdit = (msgId: string, content: string) => {
    setEditingId(msgId);
    setText(content);
  };

  const handleDelete = (msgId: string) => {
    if (confirm("Delete this message?")) {
      deleteMessage(id || '', msgId);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen">
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/messages" className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <Link to={`/@${chatUser.username}`} className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                <img src={chatUser.avatar_url} alt="" className="w-full h-full object-cover" />
              </div>
              {chatUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
              )}
            </div>
            <div>
              <h2 className="text-white font-bold">{chatUser.display_name}</h2>
              <p className="text-xs text-zinc-400">{chatUser.isOnline ? 'Active now' : 'Offline'}</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => startCall('audio')} className="p-2 rounded-full hover:bg-zinc-800 transition-colors text-purple-400">
            <Phone className="w-5 h-5" />
          </button>
          <button onClick={() => startCall('video')} className="p-2 rounded-full hover:bg-zinc-800 transition-colors text-purple-400">
            <Video className="w-5 h-5" />
          </button>
          <div className="relative group hidden md:block">
            <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400">
              <MoreVertical className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm transition-colors rounded-t-xl">
                View Profile
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm transition-colors">
                Search in Conversation
              </button>
              <div className="h-px bg-zinc-800 my-1" />
              <button className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm text-red-400 transition-colors">
                Report
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm text-red-500 transition-colors rounded-b-xl font-medium">
                Block User
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isSelf = msg.senderId === user?.id;
          const showTime = index === 0 || new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000;
          
          return (
            <React.Fragment key={`${msg.id}-${index}`}>
              {showTime && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full">
                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
              )}
              <div className={`flex flex-col group ${isSelf ? 'items-end' : 'items-start'}`}>
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!isSelf && (
                    <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 mb-1">
                      <img src={chatUser.avatar_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`px-4 py-2 rounded-2xl relative ${
                    isSelf 
                      ? 'bg-purple-600 text-white rounded-br-sm' 
                      : 'bg-zinc-800 text-white rounded-bl-sm'
                  }`}>
                    {msg.type === 'text' && <p className="whitespace-pre-wrap break-words text-sm">{renderMentions(msg.content)}</p>}
                    
                    {isSelf && (
                      <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-zinc-900 rounded-lg border border-zinc-800 p-1 shadow-lg">
                        <button onClick={() => startEdit(msg.id, msg.content)} className="p-1 hover:text-purple-400 text-zinc-400 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(msg.id)} className="p-1 hover:text-red-400 text-zinc-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {isSelf && (
                  <div className="flex items-center gap-1 mt-1 pr-1 text-xs text-zinc-500">
                    <span>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                    {msg.status === 'sent' ? <Check className="w-3 h-3" /> : <CheckCheck className={`w-3 h-3 ${msg.status === 'read' ? 'text-blue-400' : ''}`} />}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
        {isTyping && (
          <div className="flex items-start gap-2 max-w-[80%]">
            <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 mt-1">
              <img src={chatUser.avatar_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-zinc-800 text-zinc-400 rounded-bl-sm flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-black/90 backdrop-blur-xl border-t border-zinc-800 pb-safe">
        {editingId && (
          <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 rounded-t-xl border-b border-zinc-800 -mx-2 -mt-6 mb-2 mx-2">
            <div className="flex items-center gap-2 text-sm text-purple-400">
              <Edit2 className="w-4 h-4" />
              <span>Editing message...</span>
            </div>
            <button 
              onClick={() => { setEditingId(null); setText(''); }}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 bg-zinc-900 rounded-2xl p-2 border border-zinc-800 focus-within:border-purple-500 transition-colors">
          <button className="p-2 text-zinc-400 hover:text-purple-400 transition-colors flex-shrink-0">
            <ImageIcon className="w-5 h-5" />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message..."
            className="w-full bg-transparent text-white focus:outline-none resize-none max-h-32 py-2 text-sm no-scrollbar"
            rows={1}
            style={{ minHeight: '40px' }}
          />
          {text.trim() ? (
            <button 
              onClick={handleSend}
              className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button className="p-2 text-zinc-400 hover:text-purple-400 transition-colors flex-shrink-0">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
