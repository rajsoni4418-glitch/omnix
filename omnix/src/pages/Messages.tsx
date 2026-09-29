import React, { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Phone, Video, Users, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const { user } = useAuthStore();
  const sessions = useChatStore(state => state.sessions);
  const createGroup = useChatStore(state => state.createGroup);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const navigate = useNavigate();

  const onlineUsers = useChatStore(state => state.onlineUsers);

  const getMockedUser = (userId: string, isGroup?: boolean, groupName?: string, groupAvatar?: string) => {
    if (isGroup) {
      return {
        id: userId,
        username: groupName?.toLowerCase().replace(/\s+/g, '_') || 'group',
        display_name: groupName || 'Group',
        avatar_url: groupAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userId}`,
        isOnline: true
      };
    }
    return {
      id: userId,
      username: 'user_' + userId.slice(0, 4),
      display_name: 'User ' + userId.slice(0, 4),
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      isOnline: !!onlineUsers[userId]
    };
  };

  const chatList = Object.entries(sessions).map(([userId, session]) => {
    const chatUser = getMockedUser(userId, session.isGroup, session.groupName, session.groupAvatar);
    const lastMessage = session.messages[session.messages.length - 1];
    return { ...session, chatUser, lastMessage };
  }).filter(chat => 
    chat.chatUser.username.includes(searchQuery.toLowerCase()) || 
    chat.chatUser.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());

  const handleNewChat = () => {
    const newId = Math.random().toString(36).substring(7);
    navigate(`/chat/${newId}`);
  };

  const handleNewGroup = () => {
    const newId = 'group_' + Math.random().toString(36).substring(7);
    const name = prompt("Enter group name:");
    if (name) {
      createGroup(newId, name);
      navigate(`/chat/${newId}`);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4 relative">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <button 
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
          
          {showNewMenu && (
            <div className="absolute right-0 top-12 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
              <button 
                onClick={() => { setShowNewMenu(false); handleNewChat(); }}
                className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> New Chat
              </button>
              <button 
                onClick={() => { setShowNewMenu(false); handleNewGroup(); }}
                className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" /> New Group
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full bg-zinc-900 text-white rounded-xl pl-10 pr-4 py-2 text-sm border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Overlay to close menu */}
      {showNewMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNewMenu(false)} />
      )}

      {chatList.length === 0 ? (
        <div className="flex flex-col h-[50vh] items-center justify-center text-zinc-500 gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-zinc-700" />
          </div>
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {chatList.map(chat => (
            <Link 
              key={chat.userId} 
              to={`/chat/${chat.userId}`}
              className="flex items-center gap-4 p-4 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden">
                  <img src={chat.chatUser.avatar_url} alt="" className="w-full h-full object-cover" />
                </div>
                {chat.chatUser.isOnline && !chat.isGroup && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-bold truncate flex items-center gap-1">
                    {chat.isGroup && <Users className="w-3 h-3 text-zinc-500" />}
                    {chat.chatUser.display_name}
                  </h3>
                  <span className="text-xs text-zinc-500 whitespace-nowrap ml-2">
                    {chat.lastMessage ? formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true }) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-white font-semibold' : 'text-zinc-500'}`}>
                    {chat.lastMessage?.type === 'image' ? '📷 Photo' : 
                     chat.lastMessage?.type === 'voice' ? '🎤 Voice message' : 
                     chat.lastMessage?.content}
                  </p>
                  {chat.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                      <span className="text-[10px] font-bold text-white">{chat.unreadCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
