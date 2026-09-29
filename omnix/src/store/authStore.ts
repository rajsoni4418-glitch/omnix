import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: any | null;
  dbUser: any | null;
  session: Session | null;
  isLoading: boolean;
  _initialized?: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  setDbUser: (dbUser: any | null) => void;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  dbUser: null,
  session: null,
  isLoading: true,
  _initialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setDbUser: (dbUser) => set({ dbUser }),
  setSession: (session) => set({ session }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, dbUser: null, session: null });
  },
  initialize: async () => {
    if (useAuthStore.getState()._initialized) return;
    try {
      set({ _initialized: true });
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      set({ session, user: session?.user ?? null, isLoading: false });

      const handleUserSession = async (currentSession: Session | null) => {
        if (!currentSession?.user) {
          set({ profile: null, dbUser: null });
          return;
        }
        
        // 1. Fetch current user's profile
        let { data: profile } = await supabase.from('profiles').select('*').eq('id', currentSession.user.id).single();

        // 2. If no profile exists, it might be due to replication lag of the trigger.
        if (!profile && currentSession.user.email) {
          let username = currentSession.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          if (!username) username = 'user';
          username = username.slice(0, 24) + '_' + Date.now().toString().slice(-4);
          
          // Use a dummy profile to prevent app from breaking, while DB trigger finishes in background
          profile = { id: currentSession.user.id, username, display_name: username, role: 'user', is_verified: false };
        }
        
        if (profile) {
           set({ profile, dbUser: profile });
        }
      };

      if (session) {
        handleUserSession(session);
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
        handleUserSession(session);
      });
    } catch (error) {
      console.warn('Auth initialization notice:', error);
      set({ isLoading: false });
    }
  },
}));
