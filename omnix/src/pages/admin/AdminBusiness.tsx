import React, { useEffect } from 'react';
import { useBusinessStore } from '../../store/businessStore';
import { Building2, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminBusiness() {
  const { allProfiles, fetchAllBusinessProfiles, approveBusinessProfile } = useBusinessStore();

  useEffect(() => {
    fetchAllBusinessProfiles();
  }, [fetchAllBusinessProfiles]);

  const pending = allProfiles.filter(p => p.status === 'pending');
  const approved = allProfiles.filter(p => p.status === 'approved');

  return (
    <div className="space-y-6">
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-400" /> Pending Business Approvals
        </h2>

        {pending.length === 0 ? (
          <p className="text-zinc-500 text-center py-4">No pending business approvals.</p>
        ) : (
          <div className="space-y-4">
            {pending.map(profile => (
              <div key={profile.id} className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{profile.business_name}</h3>
                  <p className="text-xs text-zinc-400">Category: {profile.category} • Email: {profile.email}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => approveBusinessProfile(profile.id)}
                    className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                    title="Approve"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Reject">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Approved Businesses</h2>
        <div className="space-y-2">
          {approved.map(profile => (
            <div key={profile.id} className="p-3 bg-zinc-900/20 rounded-lg flex justify-between items-center text-sm">
              <span className="font-medium text-white">{profile.business_name}</span>
              <span className="text-zinc-500 text-xs">{profile.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
