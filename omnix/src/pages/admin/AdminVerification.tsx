import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Check, X, FileText } from 'lucide-react';

export default function AdminVerification() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Assuming a verification_requests table exists. If not, this will gracefully fail.
      const { data, error } = await supabase.from('verification_requests').select('*, user:profiles!user_id(username, display_name)').eq('status', 'pending');
      if (data) {
        setRequests(data);
      }
    } catch (err) {
      console.error("No verification requests table found, or other error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-500" />
          Verification Requests
        </h2>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-zinc-500 animate-pulse">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">No Pending Requests</h3>
            <p className="text-zinc-500 text-sm">All verification requests have been reviewed.</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h4 className="text-white font-medium">{req.user?.display_name || 'Unknown User'} <span className="text-zinc-500 text-sm font-normal">@{req.user?.username}</span></h4>
                <p className="text-zinc-400 text-sm mt-1">Type: <span className="text-white capitalize">{req.type || 'Blue Badge'}</span></p>
                <p className="text-zinc-500 text-xs mt-1">Requested on {new Date(req.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 self-start md:self-center">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-sm font-medium transition-colors">
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors">
                  <X className="w-4 h-4" /> Reject
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors">
                  <FileText className="w-4 h-4" /> Request Docs
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
