import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Flag, Check, X, AlertTriangle, Ban } from 'lucide-react';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let q = supabase.from('user_reports')
        .select('*, reporter:profiles!reporter_id(username)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (filter !== 'all') {
        q = q.eq('reason', filter);
      }
      
      const { data } = await q;
      if (data) setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reasons = ['Spam', 'Harassment', 'Copyright', 'Fake Account', 'Violence', 'Adult', 'Scam'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Reports</h2>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Reasons</option>
          {reasons.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-zinc-500 animate-pulse">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-zinc-500 bg-zinc-900 p-8 rounded-2xl text-center border border-zinc-800">
            No reports found for this filter.
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded uppercase tracking-wider">
                    {report.target_type}
                  </span>
                  <span className="text-xs text-zinc-400">
                    Reported by @{report.reporter?.username || 'unknown'} • {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-white font-medium mb-1">Target ID: {report.target_id}</h4>
                <p className="text-zinc-400 text-sm">Reason: <span className="text-white">{report.reason}</span></p>
                {report.status !== 'open' && (
                  <p className="text-xs text-zinc-500 mt-2">Status: {report.status}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 md:self-start">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-sm font-medium transition-colors">
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors">
                  <X className="w-4 h-4" /> Reject
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg text-sm font-medium transition-colors">
                  <AlertTriangle className="w-4 h-4" /> Warn
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors">
                  <Ban className="w-4 h-4" /> Ban User
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
