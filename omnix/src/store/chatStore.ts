import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  mediaUrl?: string;
  createdAt: string;
  read: boolean;
  replyTo?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface ChatSession {
  userId: string;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  messages: Message[];
  unreadCount: number;
  lastActive: string;
}

interface ChatState {
  sessions: Record<string, ChatSession>;
  onlineUsers: Record<string, boolean>;
  setOnlineUsers: (users: Record<string, boolean>) => void;
  addMessage: (userId: string, message: Message) => void;
  createGroup: (groupId: string, name: string) => void;
  markAsRead: (userId: string) => void;
  deleteMessage: (userId: string, messageId: string) => void;
  editMessage: (userId: string, messageId: string, content: string) => void;
  clearSession: (userId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      sessions: {},
      onlineUsers: {},
      setOnlineUsers: (users) => set({ onlineUsers: users }),
      createGroup: (groupId, name) => set((state) => ({
        sessions: {
          ...state.sessions,
          [groupId]: {
            userId: groupId,
            isGroup: true,
            groupName: name,
            groupAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
            messages: [],
            unreadCount: 0,
            lastActive: new Date().toISOString()
          }
        }
      })),
      addMessage: (userId, message) => set((state) => {
        const session = state.sessions[userId] || { userId, messages: [], unreadCount: 0, lastActive: new Date().toISOString() };
        const isSelf = message.senderId !== userId; // if we didn't send it, it's unread
        return {
          sessions: {
            ...state.sessions,
            [userId]: {
              ...session,
              messages: [...session.messages, message],
              unreadCount: isSelf && message.status !== 'read' ? session.unreadCount + 1 : session.unreadCount,
              lastActive: new Date().toISOString()
            }
          }
        };
      }),
      markAsRead: (userId) => set((state) => {
        const session = state.sessions[userId];
        if (!session) return state;
        return {
          sessions: {
            ...state.sessions,
            [userId]: {
              ...session,
              unreadCount: 0,
              messages: session.messages.map(m => m.senderId === userId ? { ...m, read: true, status: 'read' as const } : m)
            }
          }
        };
      }),
      deleteMessage: (userId, messageId) => set((state) => {
        const session = state.sessions[userId];
        if (!session) return state;
        return {
          sessions: {
            ...state.sessions,
            [userId]: {
              ...session,
              messages: session.messages.filter(m => m.id !== messageId)
            }
          }
        };
      }),
      editMessage: (userId, messageId, content) => set((state) => {
        const session = state.sessions[userId];
        if (!session) return state;
        return {
          sessions: {
            ...state.sessions,
            [userId]: {
              ...session,
              messages: session.messages.map(m => m.id === messageId ? { ...m, content } : m)
            }
          }
        };
      }),
      clearSession: (userId) => set((state) => {
        const newSessions = { ...state.sessions };
        delete newSessions[userId];
        return { sessions: newSessions };
      })
    }),
    {
      name: 'omnix-chats',
    }
  )
);
