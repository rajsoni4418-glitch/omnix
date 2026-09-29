import React, { useState, useEffect } from 'react';
import { Shield, Key, History, Smartphone, Mail, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SecurityDashboard() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [factors, setFactors] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [securityScore, setSecurityScore] = useState(50);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsEmailVerified(!!user.email_confirmed_at);

      // Fetch MFA factors
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.listFactors();
      if (!mfaError && mfaData) {
        setFactors(mfaData.totp || []);
      }

      // Fetch custom login history (dummy query for now, will return empty if table doesn't exist)
      const { data: historyData } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .order('login_time', { ascending: false })
        .limit(10);
      
      if (historyData) setHistory(historyData);

      // Fetch active sessions from our tracking
      const { data: sessionData } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .is('logout_time', null)
        .order('login_time', { ascending: false });

      if (sessionData) setSessions(sessionData);

      // Calculate score
      let score = 30; // base score
      if (user.email_confirmed_at) score += 30;
      if (mfaData?.totp && mfaData.totp.length > 0) score += 40;
      setSecurityScore(score);

    } catch (err) {
      console.warn('Security dashboard data unavailable', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollMfa = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      if (error) throw error;
      
      alert(`MFA Enrolled! Your secret is: ${data.totp.secret}. Please verify it using the Verify button (mock).`);
      fetchSecurityData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUnenrollMfa = async (factorId: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      fetchSecurityData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogoutSession = async (sessionId: string) => {
    try {
      await supabase.from('login_history').update({ logout_time: new Date().toISOString() }).eq('id', sessionId);
      fetchSecurityData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6 text-zinc-400">Loading security data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Security Score</h3>
          <p className="text-sm text-zinc-400">Your account security level</p>
        </div>
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-800" />
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={`${(securityScore / 100) * 175} 175`} className={securityScore > 70 ? 'text-green-500' : securityScore > 40 ? 'text-yellow-500' : 'text-red-500'} />
          </svg>
          <span className="absolute text-lg font-bold text-white">{securityScore}</span>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Key className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-zinc-400">Add an extra layer of security (TOTP).</p>
            </div>
          </div>
          {factors.length === 0 ? (
            <button onClick={handleEnrollMfa} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors">
              Enable
            </button>
          ) : (
            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Enabled
            </span>
          )}
        </div>
        {factors.length > 0 && (
          <div className="mt-4 space-y-2">
            {factors.map(f => (
              <div key={f.id} className="flex justify-between items-center p-3 bg-black rounded-lg border border-zinc-800">
                <span className="text-white text-sm">Authenticator App (Status: {f.status})</span>
                <button onClick={() => handleUnenrollMfa(f.id)} className="text-red-400 text-xs hover:underline">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Smartphone className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Active Sessions</h3>
              <p className="text-sm text-zinc-400">Manage devices logged into your account.</p>
            </div>
          </div>
          <button onClick={handleLogoutAll} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-xl transition-colors">
            Log out all
          </button>
        </div>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-sm text-zinc-500">No session data available.</div>
          ) : (
            sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-black rounded-xl border border-zinc-800">
                <div>
                  <h4 className="text-white font-medium">{s.os || 'Unknown OS'} • {s.browser || 'Unknown Browser'}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{s.location || 'Unknown Location'} • IP: {s.ip_address}</p>
                </div>
                <button onClick={() => handleLogoutSession(s.id)} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-lg">
                  Logout
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Login History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <History className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Login History</h3>
            <p className="text-sm text-zinc-400">Recent login attempts</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-xs text-zinc-500 uppercase bg-black border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Device / Browser</th>
                <th className="px-4 py-3">Location / IP</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-4 text-center">No history available</td></tr>
              ) : (
                history.map(h => (
                  <tr key={h.id} className="border-b border-zinc-800 bg-zinc-900/50">
                    <td className="px-4 py-3 font-medium text-white">{h.os} • {h.browser}</td>
                    <td className="px-4 py-3">{h.location}<br/><span className="text-xs">{h.ip_address}</span></td>
                    <td className="px-4 py-3">{new Date(h.login_time).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {h.is_success ? (
                        <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Success</span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Failed</span>
                      )}
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
