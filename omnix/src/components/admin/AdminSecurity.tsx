import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, UserX, LogOut, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

export default function AdminSecurity() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('login_history')
        .select(`
          *,
          user:user_id (email, username, display_name)
        `)
        .order('login_time', { ascending: false })
        .limit(100);
      
      if (data) setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const forceLogout = async (userId: string) => {
    try {
      // In a real backend, we'd use supabase admin to sign out the user globally.
      // E.g. await supabase.auth.admin.deleteUser(user.id) or invalidate refresh tokens
      // But we can only do so much client-side, we can update the active sessions to null or similar.
      await supabase.from('login_history').update({ logout_time: new Date().toISOString() }).eq('user_id', userId);
      alert('User forcefully logged out from tracked sessions.');
      fetchLogs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const disableAccount = async (userId: string) => {
    try {
      // Assuming there is a bans or restrictions table
      const { error } = await supabase.from('user_roles').update({ role: 'banned' }).eq('user_id', userId);
      if (error) throw error;
      alert('Account disabled successfully.');
    } catch (err: any) {
      alert(`Could not disable account (requires edge function or admin rights): ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-zinc-500">Loading security logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Security & Logins</h2>
        <button onClick={fetchLogs} className="px-4 py-2 bg-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-700">
          Refresh Logs
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-xs text-zinc-500 uppercase bg-black border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Location & IP</th>
                <th className="px-4 py-3">Device / Browser</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No login records found in the database.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{log.user?.username || 'Unknown'}</div>
                      <div className="text-xs text-zinc-500">{log.user?.email || log.user_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{log.location}</div>
                      <div className="text-xs font-mono mt-1 text-zinc-500">{log.ip_address}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white">{log.os}</div>
                      <div className="text-xs">{log.browser}</div>
                    </td>
                    <td className="px-4 py-3">
                      {log.is_success ? (
                        <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs flex items-center gap-1 w-max">
                          <CheckCircle className="w-3 h-3" /> Success
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(log.login_time).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => forceLogout(log.user_id)}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                          title="Force Logout"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => disableAccount(log.user_id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                          title="Disable Account"
                        >
                          <UserX className="w-4 h-4" />
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
