import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore, Plan } from '../store/subscriptionStore';
import { 
  Crown, 
  Check, 
  X, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle, 
  Calendar, 
  History, 
  Terminal, 
  ArrowUpRight, 
  Cpu, 
  Star, 
  CheckCircle2, 
  Coins, 
  Zap, 
  HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Premium() {
  const { user } = useAuthStore();
  const { 
    plans, 
    userSubscription, 
    history, 
    logs, 
    isLoading, 
    error,
    fetchPlans, 
    fetchUserSubscription, 
    subscribe, 
    cancelSubscription, 
    renewSubscription, 
    fetchHistory, 
    fetchLogs 
  } = useSubscriptionStore();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    if (user?.id) {
      fetchUserSubscription(user.id);
      fetchHistory(user.id);
      fetchLogs(user.id);
    }
  }, [user?.id]);

  const handleSubscribe = async (plan: Plan) => {
    if (!user?.id) return;
    try {
      if (plan.id === 'free') {
        // Handle cancel back to free or error
        return;
      }
      
      const pId = plan.id;
      // Map to monthly/yearly plan IDs
      let finalPlanId = pId;
      if (pId === 'premium_monthly' && billingPeriod === 'yearly') {
        finalPlanId = 'premium_yearly';
      } else if (pId === 'premium_yearly' && billingPeriod === 'monthly') {
        finalPlanId = 'premium_monthly';
      }

      await subscribe(user.id, finalPlanId, billingPeriod);
      setSuccessMsg(`Successfully upgraded to ${plan.name}! Enjoy your premium perks.`);
      setTimeout(() => setSuccessMsg(null), 5000);
      
      // Refresh details
      fetchUserSubscription(user.id);
      fetchHistory(user.id);
      fetchLogs(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async () => {
    if (!user?.id) return;
    if (window.confirm('Are you sure you want to cancel your automatic renewal? You will retain access to your benefits until the end of your billing cycle.')) {
      await cancelSubscription(user.id);
      setSuccessMsg('Your automatic subscription renewal has been canceled.');
      setTimeout(() => setSuccessMsg(null), 5000);
      
      fetchUserSubscription(user.id);
      fetchHistory(user.id);
      fetchLogs(user.id);
    }
  };

  const handleRenew = async () => {
    if (!user?.id) return;
    await renewSubscription(user.id);
    setSuccessMsg('Your subscription has been successfully set to auto-renew.');
    setTimeout(() => setSuccessMsg(null), 5000);
    
    fetchUserSubscription(user.id);
    fetchHistory(user.id);
    fetchLogs(user.id);
  };

  const currentPlan = plans.find(p => p.id === userSubscription?.plan_id) || plans.find(p => p.id === 'free');
  const isPremiumUser = userSubscription && userSubscription.plan_id !== 'free';

  // Get active tier visual options
  const getTierVisuals = (planId: string) => {
    switch (planId) {
      case 'premium_monthly':
      case 'premium_yearly':
        return {
          bg: 'bg-gradient-to-br from-purple-900/40 via-purple-950/20 to-black',
          border: 'border-purple-500/50',
          accentText: 'text-purple-400',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          buttonBg: 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20'
        };
      case 'creator_pro':
        return {
          bg: 'bg-gradient-to-br from-indigo-900/40 via-indigo-950/20 to-black',
          border: 'border-indigo-500/50',
          accentText: 'text-indigo-400',
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          buttonBg: 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
        };
      case 'business':
        return {
          bg: 'bg-gradient-to-br from-emerald-900/40 via-emerald-950/20 to-black',
          border: 'border-emerald-500/50',
          accentText: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          buttonBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'
        };
      default:
        return {
          bg: 'bg-zinc-900/40',
          border: 'border-zinc-800',
          accentText: 'text-zinc-400',
          badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          buttonBg: 'bg-zinc-800 hover:bg-zinc-700 text-white'
        };
    }
  };

  return (
    <div className="pb-12 min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-900 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Crown className="w-6 h-6 text-purple-500 animate-pulse" />
          Omnix Premium
        </h1>
        {isPremiumUser && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getTierVisuals(userSubscription.plan_id).badge}`}>
            ACTIVE: {currentPlan?.name}
          </span>
        )}
      </div>

      <div className="p-4 md:p-6 space-y-8">
        
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-purple-950/50 via-zinc-950 to-zinc-950 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_50%)]" />
          <div className="relative z-10 space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Unleash Absolute Power
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Elevate Your Creative Journey with <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Omnix Elite</span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Unlock ad-free streaming, premium custom user frames, unique animated chat themes, higher limits, custom colors, and priority AI Studio tools.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-2xl shadow-purple-500/20 rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center">
                <Crown className="w-12 h-12 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Status / Alerts */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-950/30 border border-emerald-500/50 text-emerald-400 p-4 rounded-2xl flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <p className="text-sm font-medium">{successMsg}</p>
            </motion.div>
          )}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-950/30 border border-red-500/50 text-red-400 p-4 rounded-2xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subscription Detail Center */}
        {userSubscription && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" /> Your Current Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Plan & Cost</span>
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    {currentPlan?.name} 
                    {userSubscription.plan_id !== 'free' && <Crown className="w-4 h-4 text-purple-400" />}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    {userSubscription.plan_id === 'free' ? 'Completely Free tier' : `${userSubscription.billing_period === 'monthly' ? '$9.99 / Month' : '$89.99 / Year'}`}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Status & Auto-Renew</span>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    userSubscription.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {userSubscription.status === 'active' ? 'Active' : 'Canceled / Pending Expiry'}
                  </span>
                  <p className="text-xs text-zinc-400 mt-2">
                    {userSubscription.cancel_at_period_end ? 'Will terminate at end of cycle' : 'Auto-renew is active'}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Expiry / Renewal Date</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-sm font-bold text-white">
                      {userSubscription.current_period_end 
                        ? new Date(userSubscription.current_period_end).toLocaleDateString(undefined, { dateStyle: 'medium' }) 
                        : 'Never'}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">End of current period</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Manage Actions */}
            {userSubscription.plan_id !== 'free' && (
              <div className="flex flex-wrap gap-3 pt-2">
                {userSubscription.cancel_at_period_end ? (
                  <button 
                    onClick={handleRenew}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Resume Auto-Renewal
                  </button>
                ) : (
                  <button 
                    onClick={handleCancel}
                    className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Cancel Auto-Renewal
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pricing & Comparison Suite */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Choose the Perfect Tier</h3>
              <p className="text-sm text-zinc-400">Cancel or switch tiers easily at any time.</p>
            </div>

            {/* Monthly / Yearly Billing Toggle */}
            <div className="bg-zinc-950 p-1 border border-zinc-800 rounded-xl flex items-center">
              <button 
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  billingPeriod === 'monthly' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
                  billingPeriod === 'yearly' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Yearly <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-500/30">Save 25%</span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans
              .filter(p => p.id !== 'free') // Let's list premium plans
              .map(plan => {
                const isSelected = userSubscription?.plan_id === plan.id || 
                  (plan.id === 'premium_monthly' && (userSubscription?.plan_id === 'premium_monthly' || userSubscription?.plan_id === 'premium_yearly'));
                
                const planPrice = billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly;
                const visuals = getTierVisuals(plan.id);

                return (
                  <div 
                    key={plan.id}
                    className={`relative overflow-hidden rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                      isSelected 
                        ? `border-purple-500 ring-2 ring-purple-500/20 ${visuals.bg}` 
                        : 'border-zinc-900 hover:border-zinc-800 bg-zinc-950/40'
                    }`}
                  >
                    {/* Glowing Accent */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full" />
                    )}

                    <div className="p-6 space-y-6 flex-1">
                      {/* Badge / Title */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                        {isSelected && (
                          <span className="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 bg-purple-500 text-black rounded-md">
                            Current Plan
                          </span>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="space-y-1">
                        <div className="flex items-baseline">
                          <span className="text-3xl font-black text-white">
                            ${planPrice > 0 ? planPrice : (billingPeriod === 'monthly' ? '9.99' : '89.99')}
                          </span>
                          <span className="text-zinc-500 text-xs ml-1 font-medium">
                            /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          {billingPeriod === 'monthly' ? 'Billed every month' : 'Charged annually in full'}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="border-t border-zinc-900 pt-6 space-y-4">
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Features Included</span>
                        <ul className="space-y-3">
                          {plan.features.slice(0, 8).map((f, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                              <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-6 border-t border-zinc-900/50 bg-black/20">
                      <button
                        onClick={() => handleSubscribe(plan)}
                        disabled={isSelected || !plan.is_active}
                        className={`w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                            : !plan.is_active 
                              ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                              : visuals.buttonBg
                        }`}
                      >
                        {isSelected ? 'Your Active Tier' : !plan.is_active ? 'Temporarily Disabled' : 'Upgrade Now'}
                        {!isSelected && plan.is_active && <ArrowUpRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Audit Trail & History Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          
          {/* Billing Transaction Log */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" /> Transaction Billing History
            </h3>
            <div className="overflow-x-auto">
              {history.length > 0 ? (
                <table className="w-full text-left text-xs text-zinc-400 border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 pb-2">
                      <th className="py-2 font-bold uppercase text-zinc-500">Action</th>
                      <th className="py-2 font-bold uppercase text-zinc-500">Tier</th>
                      <th className="py-2 font-bold uppercase text-zinc-500">Cost</th>
                      <th className="py-2 font-bold uppercase text-zinc-500">Period</th>
                      <th className="py-2 font-bold uppercase text-zinc-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={h.id || i} className="border-b border-zinc-900/40 hover:bg-zinc-900/20 transition-colors">
                        <td className="py-3 font-semibold text-white capitalize">{h.action.replace('_', ' ')}</td>
                        <td className="py-3">{plans.find(p => p.id === h.plan_id)?.name || h.plan_id}</td>
                        <td className="py-3 text-white">${Number(h.amount).toFixed(2)}</td>
                        <td className="py-3 capitalize">{h.billing_period}</td>
                        <td className="py-3">{new Date(h.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-zinc-500 text-sm">
                  No previous transactions found.
                </div>
              )}
            </div>
          </div>

          {/* Security & Access Logs */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-purple-400" /> Subscription Event Logs
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={log.id || i} className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
                        {log.event_type.replace('_', ' ')}
                      </span>
                      <p className="text-zinc-400">{log.details}</p>
                    </div>
                    <span className="text-zinc-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-zinc-500 text-sm">
                  No subscription events recorded.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
