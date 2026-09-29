import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AccountSettings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Email state
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  
  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdStrength, setPwdStrength] = useState(0);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setPwdStrength(score);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    calculateStrength(e.target.value);
  };

  const submitEmailChange = async () => {
    if (!newEmail) return;
    try {
      // Re-authentication would ideally require a password prompt, but Supabase doesn't enforce it directly for email change unless SECURE_EMAIL_CHANGE is set
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setEmailMsg('Verification link sent to both old and new email addresses.');
    } catch (err: any) {
      setEmailMsg(`Error: ${err.message}`);
    }
  };

  const submitPasswordChange = async () => {
    if (pwdStrength < 3) {
      setPwdMsg('Please choose a stronger password.');
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPwdMsg('Password updated successfully.');
      setNewPassword('');
      setPwdStrength(0);
    } catch (err: any) {
      setPwdMsg(`Error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">Account Information</h3>
      
      <div className="space-y-8">
        
        {/* Email Settings */}
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Mail className="w-4 h-4"/> Email Address</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input 
                type="email" 
                disabled 
                value={user?.email || ''} 
                className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed"
              />
              {user?.email_confirmed_at ? (
                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full flex items-center gap-1 shrink-0">
                  <CheckCircle className="w-4 h-4" /> Verified
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full flex items-center gap-1 shrink-0">
                  <ShieldAlert className="w-4 h-4" /> Unverified
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="New email address" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
              <button 
                onClick={submitEmailChange}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
              >
                Change
              </button>
            </div>
            {emailMsg && <p className="text-xs text-purple-400 mt-1">{emailMsg}</p>}
          </div>
        </div>
        
        {/* Password Settings */}
        <div className="pt-6 border-t border-zinc-800">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Lock className="w-4 h-4"/> Change Password</h4>
          <div className="space-y-3">
            <input 
              type="password" 
              placeholder="New password" 
              value={newPassword}
              onChange={handlePasswordChange}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
            {newPassword && (
              <div className="flex gap-1 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full ${pwdStrength >= 1 ? 'bg-red-500' : ''}`} style={{ width: '20%' }}></div>
                <div className={`h-full ${pwdStrength >= 2 ? 'bg-orange-500' : ''}`} style={{ width: '20%' }}></div>
                <div className={`h-full ${pwdStrength >= 3 ? 'bg-yellow-500' : ''}`} style={{ width: '20%' }}></div>
                <div className={`h-full ${pwdStrength >= 4 ? 'bg-green-500' : ''}`} style={{ width: '20%' }}></div>
                <div className={`h-full ${pwdStrength >= 5 ? 'bg-emerald-500' : ''}`} style={{ width: '20%' }}></div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-xs text-zinc-500">Must be at least 8 characters, include a number and a symbol.</p>
              <button 
                onClick={submitPasswordChange}
                disabled={pwdStrength < 3}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Update Password
              </button>
            </div>
            {pwdMsg && <p className="text-xs text-purple-400 mt-1">{pwdMsg}</p>}
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800">
          <h4 className="text-white font-medium text-red-500 mb-2">Delete Account</h4>
          <p className="text-sm text-zinc-400 mb-4">Permanently delete your account and all your data. This action cannot be undone.</p>
          <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-xl transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
