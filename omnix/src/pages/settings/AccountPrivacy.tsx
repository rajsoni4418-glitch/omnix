import React, { useState, useEffect } from 'react';
import { Lock, EyeOff, UserX, UserMinus, ShieldOff, Eye, Clock, Users, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AccountPrivacy() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    is_private_account: false,
    hide_online_status: false,
    hide_last_seen: false,
    hide_followers: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setSettings(data);
      } else if (error && error.code === 'PGRST116') {
        // Not found, create it
        const { data: newData } = await supabase
          .from('user_security_settings')
          .insert({ user_id: user.id })
          .select()
          .single();
        if (newData) setSettings(newData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_security_settings')
        .update({ [key]: newValue })
        .eq('user_id', user.id);
    } catch (err) {
      console.error(err);
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !newValue }));
    }
  };

  if (loading) {
    return <div className="text-zinc-500 p-4">Loading account privacy...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5" /> Account Privacy
          </h3>
        </div>
        <div className="divide-y divide-zinc-800">
          
          <div className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
            <div>
              <h4 className="text-white font-medium flex items-center gap-2"><Lock className="w-4 h-4 text-zinc-400"/> Private Account</h4>
              <p className="text-xs text-zinc-400 mt-1">Only approved followers can see your posts and stories.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.is_private_account} onChange={() => toggleSetting('is_private_account')} />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
            <div>
              <h4 className="text-white font-medium flex items-center gap-2"><Eye className="w-4 h-4 text-zinc-400"/> Hide Online Status</h4>
              <p className="text-xs text-zinc-400 mt-1">Other users won't see when you are online.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.hide_online_status} onChange={() => toggleSetting('hide_online_status')} />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
            <div>
              <h4 className="text-white font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-zinc-400"/> Hide Last Seen</h4>
              <p className="text-xs text-zinc-400 mt-1">Hide the timestamp of when you were last active.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.hide_last_seen} onChange={() => toggleSetting('hide_last_seen')} />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
            <div>
              <h4 className="text-white font-medium flex items-center gap-2"><Users className="w-4 h-4 text-zinc-400"/> Hide Followers / Following</h4>
              <p className="text-xs text-zinc-400 mt-1">Keep your follower and following lists private.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.hide_followers} onChange={() => toggleSetting('hide_followers')} />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

        </div>
      </div>

      {/* Blocks and Restrictions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UserX className="w-5 h-5" /> Connections & Blocks
          </h3>
        </div>
        <div className="divide-y divide-zinc-800">
          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left">
            <div>
              <h4 className="text-white font-medium">Blocked Users</h4>
              <p className="text-xs text-zinc-400 mt-1">Manage users you have blocked.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-zinc-800 text-white rounded-lg">Manage</span>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left">
            <div>
              <h4 className="text-white font-medium">Muted Users</h4>
              <p className="text-xs text-zinc-400 mt-1">Users whose posts and stories are muted.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-zinc-800 text-white rounded-lg">Manage</span>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left">
            <div>
              <h4 className="text-white font-medium">Restricted Accounts</h4>
              <p className="text-xs text-zinc-400 mt-1">Protect yourself from unwanted interactions without blocking.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-zinc-800 text-white rounded-lg">Manage</span>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left">
            <div>
              <h4 className="text-white font-medium">Hide Stories From</h4>
              <p className="text-xs text-zinc-400 mt-1">Select users who cannot view your stories.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-zinc-800 text-white rounded-lg">Manage</span>
          </button>
        </div>
      </div>

    </div>
  );
}

// Ensure Lock is imported for AccountPrivacy
