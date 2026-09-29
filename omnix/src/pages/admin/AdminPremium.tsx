import React, { useState, useEffect } from 'react';
import { useSubscriptionStore, SubscriberDetail, Plan } from '../../store/subscriptionStore';
import { 
  Crown, 
  Users, 
  Settings, 
  Plus, 
  AlertCircle, 
  Check, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  UserPlus, 
  X, 
  ArrowRightLeft, 
  Trash2, 
  Edit3,
  Calendar,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function AdminPremium() {
  const { 
    plans, 
    subscribers, 
    isLoading, 
    error, 
    fetchPlans, 
    fetchAdminData, 
    grantManualPremium, 
    removePremium, 
    updatePlanPricing, 
    setPlanActiveState 
  } = useSubscriptionStore();

  const [activeSubTab, setActiveSubTab] = useState<'subscribers' | 'plans' | 'grant'>('subscribers');
  
  // Grant Form states
  const [grantUserId, setGrantUserId] = useState('');
  const [grantPlanId, setGrantPlanId] = useState('premium_monthly');
  const [grantDuration, setGrantDuration] = useState('30');
  const [grantSuccess, setGrantSuccess] = useState('');
  const [grantError, setGrantError] = useState('');

  // Editing Plan Pricing states
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPriceMonthly, setEditPriceMonthly] = useState('');
  const [editPriceYearly, setEditPriceYearly] = useState('');

  useEffect(() => {
    fetchPlans();
    fetchAdminData();
  }, []);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantSuccess('');
    setGrantError('');

    if (!grantUserId.trim()) {
      setGrantError('Please enter a valid User ID.');
      return;
    }

    try {
      await grantManualPremium(grantUserId, grantPlanId, parseInt(grantDuration));
      setGrantSuccess('Premium plan successfully granted to the user!');
      setGrantUserId('');
      fetchAdminData();
    } catch (err: any) {
      setGrantError(err.message || 'Failed to grant premium.');
    }
  };

  const handleRemove = async (userId: string) => {
    if (window.confirm('Are you sure you want to revoke this user\'s premium subscription? This will set them back to the Free plan immediately.')) {
      try {
        await removePremium(userId);
        fetchAdminData();
      } catch (err: any) {
        alert(err.message || 'Failed to remove premium.');
      }
    }
  };

  const handleStartEditPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setEditPriceMonthly(plan.price_monthly.toString());
    setEditPriceYearly(plan.price_yearly.toString());
  };

  const handleSavePlanPrice = async (planId: string) => {
    try {
      const pm = parseFloat(editPriceMonthly);
      const py = parseFloat(editPriceYearly);
      if (isNaN(pm) || isNaN(py)) {
        alert('Please enter valid numerical prices.');
        return;
      }
      await updatePlanPricing(planId, pm, py);
      setEditingPlanId(null);
      fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to update plan pricing.');
    }
  };

  const handleTogglePlanActive = async (planId: string, currentActive: boolean) => {
    try {
      await setPlanActiveState(planId, !currentActive);
      fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to change plan state.');
    }
  };

  // Compute stats securely with no fake placeholders
  const activePaidSubscribers = subscribers.filter(s => s.plan_id !== 'free');
  const totalSubscribersCount = activePaidSubscribers.length;
  
  // Calculate MRR (Monthly Recurring Revenue) estimate based on current active subscribers
  const estimatedMRR = activePaidSubscribers.reduce((acc, sub) => {
    const plan = plans.find(p => p.id === sub.plan_id);
    if (!plan) return acc;
    if (sub.billing_period === 'monthly') {
      return acc + (plan.price_monthly || 9.99);
    } else if (sub.billing_period === 'yearly') {
      return acc + ((plan.price_yearly || 89.99) / 12);
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Crown className="w-7 h-7 text-purple-400 animate-pulse" />
            Premium Subscription Control
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Create, edit, toggle billing tiers, manage premium overrides, and view subscriber audit records.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-zinc-900/60 p-1 border border-zinc-800 rounded-xl max-w-max self-start">
          <button
            onClick={() => setActiveSubTab('subscribers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'subscribers' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Subscribers ({totalSubscribersCount})
          </button>
          <button
            onClick={() => setActiveSubTab('plans')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'plans' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Manage Tiers
          </button>
          <button
            onClick={() => setActiveSubTab('grant')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'grant' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Manual Grant
          </button>
        </div>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-1.5">
          <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Estimated MRR</span>
          <div className="flex items-center gap-1">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <h3 className="text-2xl font-black text-white">{estimatedMRR.toFixed(2)}</h3>
          </div>
          <p className="text-[10px] text-zinc-400">Calculated from currently active paid tiers</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-1.5">
          <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Paid Subscribers</span>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-2xl font-black text-white">{totalSubscribersCount}</h3>
          </div>
          <p className="text-[10px] text-zinc-400">Total users on Premium, Creator Pro, or Business</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-1.5">
          <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Active Plans</span>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="text-2xl font-black text-white">{plans.filter(p => p.is_active).length}</h3>
          </div>
          <p className="text-[10px] text-zinc-400">Configured and enabled pricing tiers</p>
        </div>
      </div>

      {/* Error displays */}
      {error && (
        <div className="bg-red-950/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Primary Tab Content */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6">
        {activeSubTab === 'subscribers' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-400" /> Active Subscriber Database
            </h3>

            {isLoading ? (
              <div className="py-12 text-center text-zinc-500 text-sm animate-pulse">
                Loading subscribers...
              </div>
            ) : subscribers.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-sm">
                No active paid subscribers found in system.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 pb-2 text-zinc-500">
                      <th className="py-3 font-bold uppercase">Subscriber</th>
                      <th className="py-3 font-bold uppercase">Tier</th>
                      <th className="py-3 font-bold uppercase">Period</th>
                      <th className="py-3 font-bold uppercase">Status</th>
                      <th className="py-3 font-bold uppercase">Renewal End</th>
                      <th className="py-3 font-bold uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.subscription_id} className="border-b border-zinc-900/60 hover:bg-zinc-900/20 transition-colors">
                        <td className="py-4">
                          <div className="font-semibold text-white">@{sub.username || 'unknown'}</div>
                          <div className="text-[10px] text-zinc-500">{sub.email || sub.user_id}</div>
                        </td>
                        <td className="py-4 font-medium text-purple-300">{sub.plan_name}</td>
                        <td className="py-4 capitalize">{sub.billing_period}</td>
                        <td className="py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            sub.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-4">
                          {sub.current_period_end 
                            ? new Date(sub.current_period_end).toLocaleDateString() 
                            : 'Unlimited'}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleRemove(sub.user_id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 rounded-lg transition-all cursor-pointer"
                            title="Revoke Premium Plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'plans' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" /> Configure Billing Tiers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => {
                const isEditing = editingPlanId === plan.id;
                
                return (
                  <div key={plan.id} className="p-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {plan.name} 
                          <span className="text-[10px] text-zinc-500 capitalize">({plan.id})</span>
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          {plan.features.length} features enabled
                        </p>
                      </div>

                      {/* Enable/Disable Toggle */}
                      {plan.id !== 'free' && (
                        <button
                          onClick={() => handleTogglePlanActive(plan.id, plan.is_active)}
                          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-all cursor-pointer"
                        >
                          {plan.is_active ? (
                            <ToggleRight className="w-8 h-8 text-purple-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-zinc-600" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Pricing Edit Form */}
                    {plan.id !== 'free' && (
                      <div className="bg-black/30 p-3 rounded-xl space-y-3">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Monthly Price</label>
                                <input
                                  type="text"
                                  value={editPriceMonthly}
                                  onChange={(e) => setEditPriceMonthly(e.target.value)}
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Yearly Price</label>
                                <input
                                  type="text"
                                  value={editPriceYearly}
                                  onChange={(e) => setEditPriceYearly(e.target.value)}
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSavePlanPrice(plan.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold rounded-lg cursor-pointer"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingPlanId(null)}
                                className="px-3 py-1 bg-zinc-850 hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex gap-4">
                              <div>
                                <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Monthly Price</span>
                                <span className="text-sm font-black text-white">${plan.price_monthly}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Yearly Price</span>
                                <span className="text-sm font-black text-white">${plan.price_yearly}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleStartEditPlan(plan)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSubTab === 'grant' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" /> Manual Subscription Bypass
              </h3>
              <p className="text-zinc-500 text-xs mt-1">
                Directly force-grant specific premium subscriptions to users by entering their internal UUID.
              </p>
            </div>

            <form onSubmit={handleGrant} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Target User ID (UUID)</label>
                <input
                  type="text"
                  placeholder="e.g. 8fb7f5ae-b1d5-4ee7-8652-b757393173a5"
                  value={grantUserId}
                  onChange={(e) => setGrantUserId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">Select Premium Plan</label>
                  <select
                    value={grantPlanId}
                    onChange={(e) => setGrantPlanId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    {plans
                      .filter(p => p.id !== 'free')
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">Duration (Days)</label>
                  <select
                    value={grantDuration}
                    onChange={(e) => setGrantDuration(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="7">7 Days (Weekly)</option>
                    <option value="30">30 Days (1 Month)</option>
                    <option value="90">90 Days (3 Months)</option>
                    <option value="365">365 Days (1 Year)</option>
                    <option value="3650">3650 Days (Lifetime)</option>
                  </select>
                </div>
              </div>

              {grantSuccess && (
                <div className="bg-emerald-950/20 border border-emerald-500/50 p-3 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{grantSuccess}</span>
                </div>
              )}

              {grantError && (
                <div className="bg-red-950/20 border border-red-500/50 p-3 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{grantError}</span>
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow shadow-purple-500/20 cursor-pointer"
              >
                Grant Free Subscription
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
