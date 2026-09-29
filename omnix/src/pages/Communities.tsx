import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Loader2, Users, Search, PlusSquare } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

import OptimizedImage from '../components/performance/OptimizedImage';

export default function Communities() {
  const { user } = useAuthStore();
  
  const { data: communities, isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn('Communities not supported yet', err);
        return [];
      }
    }
  });

  return (
    <>
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Communities</h1>
          <button className="text-purple-500 hover:text-purple-400 font-semibold text-sm flex items-center gap-1">
            <PlusSquare className="w-4 h-4" /> Create
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search communities..."
            className="w-full bg-zinc-900 text-white rounded-xl pl-10 pr-4 py-2 text-sm border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : !communities || communities.length === 0 ? (
        <div className="flex flex-col h-[50vh] items-center justify-center text-zinc-500 gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
            <Users className="w-8 h-8 text-zinc-700" />
          </div>
          <p>No communities found. Create one!</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {communities.map((community: any) => (
            <div key={community.id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
              <div className="h-24 bg-zinc-800 relative">
                {community.banner_url && (
                  <OptimizedImage src={community.banner_url} alt="Banner" className="w-full h-full object-cover opacity-50" />
                )}
              </div>
              <div className="p-4 relative">
                <div className="absolute -top-10 w-16 h-16 rounded-xl bg-zinc-900 border-4 border-zinc-900 overflow-hidden flex items-center justify-center">
                  {community.avatar_url ? (
                    <OptimizedImage src={community.avatar_url} alt={community.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-zinc-600" />
                  )}
                </div>
                <div className="mt-8">
                  <h3 className="text-white font-bold text-lg">{community.name || 'Unnamed Community'}</h3>
                  <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
                    {community.description || 'No description provided.'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {community.member_count || 0} members
                    </span>
                    <button className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-full transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
