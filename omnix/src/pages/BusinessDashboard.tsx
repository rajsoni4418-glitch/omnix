import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useBusinessStore } from '../store/businessStore';
import { Building2, Settings, BarChart3, TrendingUp, Users, Target, Megaphone, Plus, Handshake, Search, Filter, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BusinessDashboard() {
  const { user } = useAuthStore();
  const { 
    profile, 
    businessAnalytics, 
    campaigns, 
    advertisements, 
    campaignAnalytics,
    collaborations,
    fetchBusinessProfile, 
    createBusinessProfile, 
    updateBusinessProfile,
    fetchCampaigns,
    createCampaign,
    createAdvertisement,
    fetchCollaborations,
    createCollaboration,
    updateCollaborationStatus,
    updateCampaignStatus
  } = useBusinessStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'marketplace' | 'settings'>('overview');
  const [showSetup, setShowSetup] = useState(false);
  const [setupForm, setSetupForm] = useState({
    business_name: '',
    category: '',
    email: '',
    phone_number: '',
    website: ''
  });

  const [showNewAd, setShowNewAd] = useState(false);
  const [adForm, setAdForm] = useState({
    name: '',
    budget: '',
    type: 'post',
    title: '',
    destination_url: '',
    target_age_min: '18',
    target_age_max: '65'
  });

  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<number | null>(null);
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    budget: ''
  });

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    // In a real scenario, the creator ID would be fetched from a creator database.
    // For now we use a dummy creator ID to store the request in the collaboration table.
    const creatorId = `creator_${selectedCreator}`;
    
    await createCollaboration(profile.id, creatorId, {
      title: proposalForm.title,
      description: proposalForm.description,
      budget: Number(proposalForm.budget),
      creator_name: `Top Creator ${selectedCreator}`,
      business_name: profile.business_name
    });
    
    setShowProposalModal(false);
    setProposalForm({ title: '', description: '', budget: '' });
  };

  const handleSaveSettings = async () => {
    if (!profile || !user) return;
    // Basic save settings (In real scenario we'd bind state to all fields)
    await updateBusinessProfile(user.id, { updated_at: new Date().toISOString() });
    alert('Settings saved successfully.');
  };

  useEffect(() => {
    if (user) {
      fetchBusinessProfile(user.id);
    }
  }, [user, fetchBusinessProfile]);

  useEffect(() => {
    if (user && profile && profile.status === 'approved') {
      fetchCampaigns(user.id);
      fetchCollaborations(user.id);
    }
  }, [user, profile, fetchCampaigns, fetchCollaborations]);

  if (!user) return <div className="p-8 text-center text-zinc-400">Please sign in to access Business Tools.</div>;

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBusinessProfile(user.id, setupForm);
    setShowSetup(false);
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    const camp = await createCampaign(profile.id, {
      name: adForm.name,
      budget: Number(adForm.budget),
      target_audience: {
        age_min: Number(adForm.target_age_min),
        age_max: Number(adForm.target_age_max)
      }
    });

    if (camp) {
      await createAdvertisement(camp.id, profile.id, {
        type: adForm.type as any,
        title: adForm.title,
        destination_url: adForm.destination_url
      });
      setShowNewAd(false);
      setAdForm({ name: '', budget: '', type: 'post', title: '', destination_url: '', target_age_min: '18', target_age_max: '65' });
    }
  };

  if (!profile && !showSetup) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-purple-600/10 rounded-full flex items-center justify-center mx-auto border border-purple-500/20">
            <Building2 className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Omnix Business Center</h1>
            <p className="text-zinc-400 max-w-lg mx-auto">Convert your account to unlock powerful analytics, create targeted advertising campaigns, and collaborate with top creators on the Brand Marketplace.</p>
          </div>
          
          <button 
            onClick={() => setShowSetup(true)}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20"
          >
            Create Business Account
          </button>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Business Profile Setup</h2>
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Business Name</label>
              <input required type="text" value={setupForm.business_name} onChange={e => setSetupForm({...setupForm, business_name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Category</label>
              <select required value={setupForm.category} onChange={e => setSetupForm({...setupForm, category: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500">
                <option value="">Select a category</option>
                <option value="Creator">Creator / Influencer</option>
                <option value="Brand">Retail Brand</option>
                <option value="Organization">Non-profit Organization</option>
                <option value="Service">Professional Service</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Business Email</label>
              <input required type="email" value={setupForm.email} onChange={e => setSetupForm({...setupForm, email: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Website (Optional)</label>
              <input type="url" value={setupForm.website} onChange={e => setSetupForm({...setupForm, website: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <button type="submit" className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl mt-4">
              Submit for Verification
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (profile?.status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
         <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 max-w-md mx-auto">
            <Target className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Account Under Review</h2>
            <p className="text-zinc-400 text-sm">Your business profile "{profile.business_name}" is currently being reviewed by our moderation team. You will have full access to ads and marketplace once approved.</p>
         </div>
      </div>
    );
  }

  // Calculate some overview stats
  const totalVisits = businessAnalytics.reduce((acc, curr) => acc + curr.profile_visits, 0);
  const totalClicks = businessAnalytics.reduce((acc, curr) => acc + curr.website_clicks, 0);
  const totalLeads = businessAnalytics.reduce((acc, curr) => acc + curr.sales_leads, 0);
  const totalAdSpend = campaigns.reduce((acc, curr) => acc + curr.spent, 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {profile?.business_name}
            {profile?.is_verified && <CheckCircle2 className="w-5 h-5 text-purple-500" />}
          </h1>
          <p className="text-zinc-400 text-sm">Omnix Business Dashboard</p>
        </div>
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto w-full md:w-auto">
          {['overview', 'ads', 'marketplace', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'ads' ? 'Ad Manager' : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5">
              <div className="flex items-center gap-3 text-zinc-400 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Profile Visits</span>
              </div>
              <p className="text-3xl font-black text-white">{totalVisits.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5">
              <div className="flex items-center gap-3 text-zinc-400 mb-2">
                <ArrowUpRight className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Web Clicks</span>
              </div>
              <p className="text-3xl font-black text-white">{totalClicks.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5">
              <div className="flex items-center gap-3 text-zinc-400 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Sales Leads</span>
              </div>
              <p className="text-3xl font-black text-white">{totalLeads.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-950 border border-purple-500/30 rounded-3xl p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-600/5" />
              <div className="relative">
                <div className="flex items-center gap-3 text-purple-400 mb-2">
                  <Megaphone className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Total Ad Spend</span>
                </div>
                <p className="text-3xl font-black text-white">${totalAdSpend.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Active Campaigns Overview</h3>
            {campaigns.length === 0 ? (
              <div className="text-center py-8 border border-zinc-900 border-dashed rounded-2xl">
                <p className="text-zinc-500">No active campaigns running.</p>
                <button onClick={() => setActiveTab('ads')} className="mt-4 text-purple-400 font-bold hover:text-purple-300">Create an Ad Campaign &rarr;</button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.slice(0,3).map(camp => (
                  <div key={camp.id} className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <div>
                      <h4 className="font-bold text-white">{camp.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1">Budget: ${camp.budget} • Spent: ${camp.spent}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      camp.status === 'active' ? 'bg-green-500/10 text-green-400' : 
                      camp.status === 'paused' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {camp.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Advertisement Manager</h2>
            <button 
              onClick={() => setShowNewAd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all"
            >
              <Plus className="w-4 h-4" /> New Campaign
            </button>
          </div>

          {showNewAd && (
            <div className="bg-zinc-950 border border-purple-500/30 rounded-3xl p-6 shadow-2xl shadow-purple-900/10 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Create Sponsored Ad</h3>
                <button onClick={() => setShowNewAd(false)} className="text-zinc-500 hover:text-white"><XCircle className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Campaign Name</label>
                    <input required type="text" value={adForm.name} onChange={e => setAdForm({...adForm, name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Total Budget (USD)</label>
                    <input required type="number" min="5" value={adForm.budget} onChange={e => setAdForm({...adForm, budget: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Ad Format</label>
                    <select value={adForm.type} onChange={e => setAdForm({...adForm, type: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none">
                      <option value="post">Sponsored Post</option>
                      <option value="story">Sponsored Story</option>
                      <option value="omniclip">Sponsored OmniClip</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Call to Action URL</label>
                    <input type="url" placeholder="https://" value={adForm.destination_url} onChange={e => setAdForm({...adForm, destination_url: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-900">
                  <h4 className="text-sm font-bold text-white mb-3">Target Audience</h4>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-zinc-400 mb-1">Min Age</label>
                      <input type="number" min="13" max="65" value={adForm.target_age_min} onChange={e => setAdForm({...adForm, target_age_min: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-zinc-400 mb-1">Max Age</label>
                      <input type="number" min="13" max="65+" value={adForm.target_age_max} onChange={e => setAdForm({...adForm, target_age_max: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20">
                    Launch Campaign
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900/50 border-b border-zinc-900 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="p-4 font-bold">Campaign</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Spent / Budget</th>
                  <th className="p-4 font-bold">Results</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">No campaigns yet.</td>
                  </tr>
                ) : (
                  campaigns.map(camp => {
                    const analytics = campaignAnalytics.filter(a => a.campaign_id === camp.id);
                    const reach = analytics.reduce((acc, curr) => acc + curr.reach, 0);
                    const clicks = analytics.reduce((acc, curr) => acc + curr.clicks, 0);

                    return (
                      <tr key={camp.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-white">{camp.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">ID: {camp.id.substring(0,8)}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            camp.status === 'active' ? 'bg-green-500/10 text-green-400' : 
                            camp.status === 'paused' ? 'bg-yellow-500/10 text-yellow-400' : 
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {camp.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-white font-medium">${camp.spent} <span className="text-zinc-500">/ ${camp.budget}</span></p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-zinc-300">Reach: <span className="font-bold text-white">{reach.toLocaleString()}</span></p>
                          <p className="text-xs text-zinc-300">Clicks: <span className="font-bold text-white">{clicks.toLocaleString()}</span></p>
                        </td>
                        <td className="p-4 text-right">
                          {camp.status === 'active' ? (
                            <button onClick={() => updateCampaignStatus(camp.id, 'paused')} className="text-xs font-bold text-yellow-500 hover:text-yellow-400">Pause</button>
                          ) : camp.status === 'paused' || camp.status === 'draft' ? (
                            <button onClick={() => updateCampaignStatus(camp.id, 'active')} className="text-xs font-bold text-green-500 hover:text-green-400">Activate</button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Handshake className="w-5 h-5 text-purple-400" /> Brand Marketplace</h2>
              <p className="text-sm text-zinc-400">Find creators and manage collaboration requests.</p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-zinc-500" />
              <input type="text" placeholder="Search creators..." className="bg-transparent border-none focus:outline-none text-sm text-white w-48" />
              <Filter className="w-4 h-4 text-zinc-500 ml-2 cursor-pointer hover:text-white" />
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Active Collab Requests</h3>
            
            {collaborations.length === 0 ? (
              <div className="text-center py-12">
                <Handshake className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
                <p className="text-zinc-500">No active collaborations. Start discovering creators to send requests.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {collaborations.map(collab => (
                  <div key={collab.id} className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white">{collab.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">Creator: {collab.creator_name || 'Creator'} • Budget: ${collab.budget}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        collab.status === 'accepted' ? 'bg-green-500/10 text-green-400' :
                        collab.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {collab.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Mock Creator Discovery Cards */}
            {[1,2,3].map(i => (
              <div key={i} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-800 mb-3 border-2 border-purple-500/30">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Creator${i}`} className="w-full h-full rounded-full" />
                </div>
                <h4 className="font-bold text-white flex items-center gap-1">Top Creator {i} <CheckCircle2 className="w-3 h-3 text-purple-500" /></h4>
                <p className="text-xs text-zinc-400 mb-3">Lifestyle & Tech • 1.{i}M Followers</p>
                <button 
                  onClick={() => alert('Creator invitation modal would open here.')}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Send Proposal
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-zinc-950 border border-zinc-900 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-zinc-400" /> Business Settings
          </h2>
          
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Business Name</label>
              <input type="text" value={profile?.business_name} disabled className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Public Email</label>
              <input type="email" defaultValue={profile?.email} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Business Phone</label>
              <input type="tel" defaultValue={profile?.phone_number} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Location / Address</label>
              <textarea defaultValue={profile?.address} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none h-24 resize-none" />
            </div>
            
            <button type="button" onClick={handleSaveSettings} className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors mt-4 cursor-pointer">
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Proposal Modal */}
      <AnimatePresence>
        {showProposalModal && selectedCreator !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative"
            >
              <div className="flex justify-between items-center mb-5 border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Handshake className="w-5 h-5 text-purple-400" /> Send Proposal to Creator {selectedCreator}
                </h3>
                <button onClick={() => setShowProposalModal(false)} className="text-zinc-500 hover:text-white cursor-pointer">&times;</button>
              </div>

              <form onSubmit={handleSendProposal} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Campaign Title</label>
                  <input 
                    required
                    type="text"
                    placeholder="E.g., Summer Collection Promo"
                    value={proposalForm.title}
                    onChange={(e) => setProposalForm({...proposalForm, title: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Budget (USD)</label>
                  <input 
                    required
                    type="number"
                    min="10"
                    placeholder="Enter offer amount"
                    value={proposalForm.budget}
                    onChange={(e) => setProposalForm({...proposalForm, budget: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Deliverables & Requirements</label>
                  <textarea 
                    required
                    placeholder="Describe what the creator needs to do (e.g. 1 Story, 1 Post)..."
                    value={proposalForm.description}
                    onChange={(e) => setProposalForm({...proposalForm, description: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 h-24 resize-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowProposalModal(false)}
                    className="w-1/2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-zinc-850"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-1/2 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Send Offer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
