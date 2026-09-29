import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, ShieldAlert, ShieldCheck, Ban, Trash2, Eye } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let q = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
      
      if (filter === 'verified') q = q.eq('is_verified', true);
      // Other filters (banned, suspended) depend on schema extensions
      
      const { data } = await q;
      if (data) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await supabase.from('profiles')
        .select('*')
        .or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
        .limit(50);
      if (data) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
          />
        </form>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Users</option>
          <option value="verified">Verified</option>
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 animate-pulse">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No users found.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}&background=random`} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="text-white font-medium flex items-center gap-1">
                            {u.display_name} 
                            {u.is_verified && <ShieldCheck className="w-3 h-3 text-blue-500" />}
                          </div>
                          <div className="text-zinc-500 text-xs">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-medium">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-md transition-colors" title="View Profile">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 rounded-md transition-colors" title="Suspend/Ban">
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
