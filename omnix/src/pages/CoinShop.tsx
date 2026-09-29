import React, { useState, useEffect } from 'react';
import { 
  Coins, Wallet, Gift, Tag, Sparkles, Clock, CheckCircle2, 
  ChevronRight, CreditCard, ShieldCheck, HelpCircle, Loader2, 
  Search, ArrowDownLeft, AlertTriangle, RefreshCw, Plus, Trash2, 
  Edit3, Eye, FileText, Check, Download, AlertCircle, X, ShieldAlert,
  User, Settings, Database, ArrowUpRight, Percent, Award, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useCoinShopStore, CoinPack, CoinOffer, CoinCoupon, CoinPurchase } from '../store/coinShopStore';
import { usePaymentStore } from '../store/paymentStore';

export default function CoinShop() {
  const { user, profile } = useAuthStore();
  const { wallet, fetchWalletData } = useWalletStore();
  const { userSubscription, fetchUserSubscription } = useSubscriptionStore();
  const { 
    coinPacks, activeOffers, coupons, purchases, gateways, useLocalFallback, isLoading, error,
    fetchShopData, validateCoupon, simulatePurchase, createCoinPack, updateCoinPack, 
    deleteCoinPack, createOffer, deleteOffer, createCoupon, deleteCoupon, refundPurchase,
    updateGatewayConfig, exportReport
  } = useCoinShopStore();

  const {
    gateways: dbGateways,
    invoices,
    refundRequests,
    orders,
    paymentHistory,
    fetchPaymentData,
    fetchAdminPaymentData,
    createOrder: dbCreateOrder,
    processPayment: dbProcessPayment,
    createRefundRequest,
    approveRefund,
    rejectRefund,
    updateGatewayConfig: dbUpdateGatewayConfig,
    generateInvoicePDF
  } = usePaymentStore();

  const [activeTab, setActiveTab] = useState<'shop' | 'history' | 'admin'>('shop');
  
  // Refund states
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [selectedOrderIdForRefund, setSelectedOrderIdForRefund] = useState<string | null>(null);
  const [selectedOrderAmountForRefund, setSelectedOrderAmountForRefund] = useState<number>(0);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatedCoupon, setValidatedCoupon] = useState<CoinCoupon | null>(null);
  const [couponValidating, setCouponValidating] = useState(false);

  // Purchase Flow Wizard
  const [selectedPack, setSelectedPack] = useState<CoinPack | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'idle' | 'confirm' | 'gateway' | 'processing' | 'success'>('idle');
  const [chosenGateway, setChosenGateway] = useState<'razorpay' | 'google_play' | 'apple_pay' | 'stripe'>('razorpay');
  const [purchaseResult, setPurchaseResult] = useState<{ coinsAdded: number; finalPrice: number; txId: string } | null>(null);

  // Admin states
  const [bypassAdmin, setBypassAdmin] = useState(false);
  const [showAddPackModal, setShowAddPackModal] = useState(false);
  const [editingPack, setEditingPack] = useState<CoinPack | null>(null);
  const [newPackData, setNewPackData] = useState({
    name: '',
    coins: 100,
    price: 0.99,
    bonus_coins: 0,
    tag: '' as any,
    pack_type: 'standard' as any,
    is_active: true
  });

  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [newOfferData, setNewOfferData] = useState({
    pack_id: '',
    discount_percent: 15,
    extra_bonus_percent: 10,
    ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 16), // 2 days default
    description: ''
  });

  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCouponData, setNewCouponData] = useState({
    code: '',
    discount_percent: 10,
    is_active: true,
    ends_at: ''
  });

  // Countdown timer trigger
  const [timeRemaining, setTimeRemaining] = useState<string>('00:00:00');

  useEffect(() => {
    if (user) {
      fetchShopData(user.id);
      fetchWalletData(user.id);
      fetchUserSubscription(user.id);
      fetchPaymentData(user.id);
      fetchAdminPaymentData();
    }
  }, [user, fetchShopData, fetchWalletData, fetchUserSubscription, fetchPaymentData, fetchAdminPaymentData]);

  // Flash Sale Offer Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const activeOffer = activeOffers.find(o => o.is_active);
      if (activeOffer) {
        const diff = new Date(activeOffer.ends_at).getTime() - Date.now();
        if (diff <= 0) {
          setTimeRemaining('00:00:00');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(
            `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
          );
        }
      } else {
        setTimeRemaining('23:59:59'); // Demo countdown
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeOffers]);

  // Premium User check
  const isPremium = userSubscription && userSubscription.plan_id !== 'free' && userSubscription.status === 'active';

  // Apply Coupon Action
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    setCouponValidating(true);
    setCouponError(null);
    const valid = await validateCoupon(couponInput);
    setCouponValidating(false);
    if (valid) {
      setValidatedCoupon(valid);
      setCouponError(null);
    } else {
      setValidatedCoupon(null);
      setCouponError('Invalid, expired, or deactivated coupon code.');
    }
  };

  // Pricing & Breakdown Helper
  const getPricingBreakdown = (pack: CoinPack) => {
    const basePrice = pack.price;
    const premiumDiscount = isPremium ? 10 : 0;
    const couponDiscount = validatedCoupon ? validatedCoupon.discount_percent : 0;
    
    // Find active campaign offer
    const activeOffer = activeOffers.find(o => o.pack_id === pack.id);
    const offerDiscount = activeOffer ? activeOffer.discount_percent : 0;
    const extraBonusPercent = activeOffer ? activeOffer.extra_bonus_percent : 0;

    const totalDiscountPercent = Math.min(90, premiumDiscount + couponDiscount + offerDiscount);
    const finalPrice = Math.max(0.49, parseFloat((basePrice * (1 - totalDiscountPercent / 100)).toFixed(2)));

    const baseCoins = pack.coins;
    const standardBonus = pack.bonus_coins;
    const campaignBonus = Math.round(baseCoins * (extraBonusPercent / 100));
    const totalCoins = baseCoins + standardBonus + campaignBonus;

    return {
      basePrice,
      premiumDiscount,
      couponDiscount,
      offerDiscount,
      totalDiscountPercent,
      finalPrice,
      baseCoins,
      standardBonus,
      campaignBonus,
      totalCoins
    };
  };

  // Launch simulated gateway checkout workflow
  const handleInitiatePurchase = (pack: CoinPack) => {
    setSelectedPack(pack);
    setPurchaseStep('confirm');
  };

  const handleConfirmOrder = () => {
    setPurchaseStep('gateway');
  };

  const handleTriggerSimulatedPayment = async () => {
    if (!user || !selectedPack) return;
    setPurchaseStep('processing');

    const breakdown = getPricingBreakdown(selectedPack);

    // 1. Create secure payment order in Database/Store
    const ord = await dbCreateOrder(
      user.id,
      'coin_pack',
      selectedPack.id,
      selectedPack.name,
      breakdown.finalPrice,
      'USD',
      chosenGateway
    );

    if (!ord) {
      alert('Failed to register payment order.');
      setPurchaseStep('confirm');
      return;
    }

    // 2. Perform the server-side proxy verification simulation
    setTimeout(async () => {
      const paymentId = 'pay_' + Math.random().toString(36).substring(2, 12);
      const transactionId = 'tx_g_' + Math.random().toString(36).substring(2, 12);
      
      const res = await dbProcessPayment(
        ord.id,
        paymentId,
        transactionId,
        {
          checkout_mode: 'test',
          gateway: chosenGateway,
          client_ip: '127.0.0.1',
          signature_verified_by_server: true
        }
      );

      if (res.success) {
        setPurchaseResult({
          coinsAdded: breakdown.totalCoins,
          finalPrice: breakdown.finalPrice,
          txId: transactionId
        });
        setPurchaseStep('success');
        // Refresh states
        await fetchWalletData(user.id);
        await fetchPaymentData(user.id);
      } else {
        alert('Transaction verification failed: ' + (res.error || 'Unknown gateway exception.'));
        setPurchaseStep('confirm');
      }
    }, 2200);
  };

  // Admin Actions
  const handleAddPackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...newPackData,
      tag: newPackData.tag || null
    };
    if (editingPack) {
      await updateCoinPack(editingPack.id, data);
    } else {
      await createCoinPack(data);
    }
    setShowAddPackModal(false);
    setEditingPack(null);
    setNewPackData({ name: '', coins: 100, price: 0.99, bonus_coins: 0, tag: '', pack_type: 'standard', is_active: true });
  };

  const handleAddOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOffer({ ...newOfferData, is_active: true });
    setShowAddOfferModal(false);
    setNewOfferData({ pack_id: '', discount_percent: 15, extra_bonus_percent: 10, ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 16), description: '' });
  };

  const handleAddCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCoupon({
      ...newCouponData,
      ends_at: newCouponData.ends_at ? new Date(newCouponData.ends_at).toISOString() : null,
      created_at: new Date().toISOString()
    });
    setShowAddCouponModal(false);
    setNewCouponData({ code: '', discount_percent: 10, is_active: true, ends_at: '' });
  };

  const handleDownloadReport = (format: 'csv' | 'json') => {
    const content = exportReport(format);
    const mime = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnix_coin_purchases_report.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isAdmin = profile?.role === 'super_admin' || bypassAdmin;

  return (
    <div className="pb-24 min-h-screen bg-black text-white" id="omnix-coin-shop-container">
      {/* Top Navigation sticky bar */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/15 rounded-xl border border-purple-500/20">
            <ShoppingBag className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Omnix Coin Shop
            </h1>
            <p className="text-xs text-zinc-500 font-medium">Buy secure coins, support creators, and access premium networks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Admin Switcher for review */}
          <button 
            onClick={() => setBypassAdmin(!bypassAdmin)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer ${bypassAdmin ? 'bg-purple-600/15 border-purple-500 text-purple-300' : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-400'}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Demo Admin Bypass
          </button>
          <button 
            onClick={() => user && fetchShopData(user.id)}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
            title="Refresh storefront"
            id="refresh-shop-btn"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Balanced Dashboard Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* User Wallet Status */}
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 border border-zinc-850 p-5 rounded-2xl flex items-center justify-between shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Wallet Balance</span>
              <h3 className="text-3xl font-black text-white flex items-center gap-1.5">
                {wallet?.coin_balance.toLocaleString() || '0'}
                <Coins className="w-5 h-5 text-purple-400" />
              </h3>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">Durable Ledger Sync</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Wallet className="w-6 h-6 text-purple-400" />
            </div>
          </div>

          {/* Premium discount banner */}
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 border border-zinc-850 p-5 rounded-2xl flex items-center justify-between shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Premium Discount</span>
              <h3 className={`text-2xl font-black ${isPremium ? 'text-green-400' : 'text-zinc-500'}`}>
                {isPremium ? '10% Discount Active' : 'Not Active'}
              </h3>
              <p className="text-[10px] text-zinc-400 font-medium">
                {isPremium ? 'Automatic reduction on checkout' : 'Get premium for instant discounts'}
              </p>
            </div>
            <div className={`p-3 rounded-xl border ${isPremium ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Current Active Offers Promo Banner */}
          <div className="bg-gradient-to-br from-purple-950 via-black to-zinc-950 border border-purple-500/20 p-5 rounded-2xl flex items-center justify-between shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
              <Percent className="w-24 h-24 text-purple-400" />
            </div>
            <div className="space-y-1 z-10">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">Flash Sales Campaign</span>
              <h3 className="text-2xl font-black text-yellow-400 tracking-tight flex items-center gap-1.5 font-mono">
                {timeRemaining}
              </h3>
              <p className="text-[10px] text-zinc-400 font-medium">Limited time weekend offer countdown</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-400 z-10">
              <Clock className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Database sandbox warning */}
        {useLocalFallback && (
          <div className="p-4 bg-purple-950/20 border border-purple-500/15 rounded-2xl flex items-center gap-3 text-xs text-purple-300">
            <Database className="w-5 h-5 flex-shrink-0 animate-pulse text-purple-400" />
            <span>
              <strong>Secure Sandbox LocalStorage Active:</strong> Running on sandboxed client cache. All simulated gateway transactions, purchases, packs, and coupons sync securely in storage.
            </span>
          </div>
        )}

        {/* Navigation Selector Tabs */}
        <div className="flex border-b border-zinc-800" id="shop-tabs">
          <button 
            className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors relative cursor-pointer ${activeTab === 'shop' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            onClick={() => { setActiveTab('shop'); setSelectedPack(null); setPurchaseStep('idle'); }}
          >
            Storefront Home
          </button>
          <button 
            className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors relative cursor-pointer ${activeTab === 'history' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            onClick={() => setActiveTab('history')}
          >
            My Purchases
          </button>
          {isAdmin && (
            <button 
              className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors relative cursor-pointer ${activeTab === 'admin' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              onClick={() => setActiveTab('admin')}
            >
              Shop Administration
            </button>
          )}
        </div>

        {/* Main Storefront Area */}
        {activeTab === 'shop' && (
          <div className="space-y-6" id="shop-front-panel">
            
            {/* Promo Card Coupon Validation element */}
            <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-purple-400" /> Have a Special Promo Coupon?
                </h4>
                <p className="text-xs text-zinc-500">Enter coupon to apply compound percentage deductions upon checkout confirmation!</p>
              </div>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. OMNIX20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider focus:outline-none focus:border-purple-500 w-36 transition-all"
                />
                <button
                  type="submit"
                  disabled={couponValidating}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  {couponValidating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                </button>
              </form>
            </div>

            {/* Display validation result banner */}
            <AnimatePresence>
              {validatedCoupon && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between text-xs text-green-400"
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> 
                    Coupon "{validatedCoupon.code}" Activated: -{validatedCoupon.discount_percent}% Discount!
                  </span>
                  <button 
                    onClick={() => { setValidatedCoupon(null); setCouponInput(''); }}
                    className="p-1 hover:bg-green-500/20 rounded text-green-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
              {couponError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-1.5 text-xs text-red-400"
                >
                  <AlertCircle className="w-4 h-4" /> {couponError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Packs Grid list */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Featured Coin Bundles
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="shop-packs-grid">
                {coinPacks.filter(p => p.is_active).map(pack => {
                  const breakdown = getPricingBreakdown(pack);
                  const activeOffer = activeOffers.find(o => o.pack_id === pack.id);
                  const isPopular = pack.tag === 'popular';
                  const isBestValue = pack.tag === 'best_value';

                  return (
                    <div 
                      key={pack.id}
                      className={`relative bg-zinc-950 border rounded-3xl p-5 flex flex-col justify-between transition-all hover:scale-[1.02] duration-200 group ${isPopular ? 'border-purple-500/40 shadow-lg shadow-purple-500/5' : isBestValue ? 'border-yellow-500/30 shadow-lg shadow-yellow-500/5' : 'border-zinc-900 hover:border-purple-500/20'}`}
                    >
                      {/* Top Badges */}
                      {pack.tag && (
                        <div className={`absolute top-0 right-0 text-[8px] font-extrabold tracking-widest px-3 py-1 rounded-bl-xl uppercase text-black ${isPopular ? 'bg-purple-500 text-white' : 'bg-yellow-500'}`}>
                          {pack.tag}
                        </div>
                      )}
                      
                      {activeOffer && (
                        <div className="absolute top-0 left-0 bg-red-600 text-white text-[8px] font-black tracking-widest px-3 py-1 rounded-br-xl uppercase">
                          -{activeOffer.discount_percent}% Flash Sale
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{pack.name}</span>
                        <h4 className="text-3xl font-black text-white flex items-baseline gap-1.5">
                          {breakdown.totalCoins.toLocaleString()}
                          <span className="text-xs text-purple-400 uppercase font-extrabold font-mono">coins</span>
                        </h4>

                        {/* Coin breakdowns */}
                        <div className="space-y-1 py-2 border-t border-zinc-900/60 mt-2 text-[10px] text-zinc-400 font-medium">
                          <div className="flex justify-between">
                            <span>Base coins:</span>
                            <span className="text-white font-semibold">{pack.coins}</span>
                          </div>
                          {pack.bonus_coins > 0 && (
                            <div className="flex justify-between">
                              <span>Standard bonus:</span>
                              <span className="text-purple-400 font-semibold">+{pack.bonus_coins}</span>
                            </div>
                          )}
                          {breakdown.campaignBonus > 0 && (
                            <div className="flex justify-between text-yellow-400">
                              <span>Campaign bonus:</span>
                              <span className="font-semibold">+{breakdown.campaignBonus}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-zinc-900 flex items-center justify-between">
                        <div>
                          {breakdown.totalDiscountPercent > 0 ? (
                            <div className="space-y-0.5">
                              <span className="text-xs text-zinc-500 line-through">${pack.price.toFixed(2)}</span>
                              <p className="text-sm font-black text-green-400">${breakdown.finalPrice.toFixed(2)} USD</p>
                            </div>
                          ) : (
                            <p className="text-sm font-black text-white">${pack.price.toFixed(2)} USD</p>
                          )}
                        </div>

                        <button 
                          onClick={() => handleInitiatePurchase(pack)}
                          className="px-4 py-2 bg-zinc-900 hover:bg-purple-600 group-hover:bg-purple-600 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          Buy Bundle <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* User Purchase logs */}
        {activeTab === 'history' && (
          <div className="space-y-4" id="history-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" /> Secure Receipt Timeline
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Real-time cryptographic audit trail</p>
            </div>

            {paymentHistory.length === 0 && purchases.length === 0 ? (
              <div className="text-center py-16 bg-zinc-950 border border-zinc-900 rounded-3xl text-zinc-500">
                <Coins className="w-12 h-12 mx-auto text-zinc-750 mb-3" />
                <h4 className="text-sm font-bold text-zinc-400">No Purchases Recorded</h4>
                <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">Get coins to support creators, unlock sticker packs, and build premium networks!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Show dynamic DB paymentHistory records */}
                {paymentHistory.map((rec) => {
                  const inv = invoices.find(i => i.order_id === rec.order_id);
                  const refReq = refundRequests.find(r => r.order_id === rec.order_id);
                  const isCompleted = rec.status === 'completed';
                  const isRefunded = rec.status === 'refunded';

                  return (
                    <div 
                      key={rec.order_id}
                      className="p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                          isCompleted ? 'bg-green-500/10 border-green-500/10 text-green-400' : 
                          isRefunded ? 'bg-red-500/10 border-red-500/10 text-red-400' :
                          'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}>
                          {isCompleted ? <ArrowDownLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{rec.product}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-1">
                            <span className="uppercase text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-black tracking-wider">{rec.gateway}</span>
                            <span>•</span>
                            <span>{new Date(rec.payment_date).toLocaleString()}</span>
                            <span>•</span>
                            <span className="font-mono text-[9px] text-zinc-600 select-all">ID: {rec.transaction_id.slice(0, 12)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-zinc-900/50 pt-3 sm:pt-0">
                        {/* Status Pills and Action Buttons */}
                        <div className="flex items-center gap-2">
                          {inv && (
                            <button 
                              onClick={() => generateInvoicePDF(inv.id)}
                              className="px-2.5 py-1 bg-zinc-900 hover:bg-purple-600 border border-zinc-850 hover:border-purple-500 rounded-lg text-[10px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                              title="Download Tax Invoice Receipt"
                            >
                              <Download className="w-3 h-3" /> Invoice
                            </button>
                          )}

                          {isCompleted && !refReq && (
                            <button 
                              onClick={() => {
                                setSelectedOrderIdForRefund(rec.order_id);
                                setSelectedOrderAmountForRefund(rec.amount);
                                setRefundReason('');
                                setShowRefundModal(true);
                              }}
                              className="px-2.5 py-1 bg-zinc-900 hover:bg-red-950/40 border border-zinc-850 hover:border-red-900/30 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-red-400 transition-all cursor-pointer flex items-center gap-1"
                              title="File Refund Request"
                            >
                              <AlertCircle className="w-3 h-3" /> Refund
                            </button>
                          )}

                          {refReq && (
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-widest uppercase ${
                              refReq.status === 'approved' ? 'bg-red-500/10 text-red-400' :
                              refReq.status === 'rejected' ? 'bg-zinc-850 text-zinc-500 line-through' :
                              'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {refReq.status === 'approved' ? 'Refunded' :
                               refReq.status === 'rejected' ? 'Refund Rejected' :
                               'Refund Pending'}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className={`text-sm font-extrabold ${isCompleted ? 'text-green-400' : 'text-zinc-500 line-through'}`}>
                            {rec.product.includes('Coins') ? `+${rec.product}` : 'Verified'}
                          </span>
                          <p className="text-xs font-semibold text-zinc-450 mt-0.5">${rec.amount.toFixed(2)} USD</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Legacy fallback to purchases array */}
                {paymentHistory.length === 0 && purchases.map(purchase => (
                  <div 
                    key={purchase.id}
                    className="p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-2xl flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${purchase.payment_status === 'completed' ? 'bg-green-500/10 border-green-500/10 text-green-400' : 'bg-red-500/10 border-red-500/10 text-red-400'}`}>
                        {purchase.payment_status === 'completed' ? <ArrowDownLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{purchase.pack_name}</h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          <span className="uppercase text-[9px] bg-zinc-900 px-2 py-0.5 rounded text-zinc-400 font-bold tracking-wider">{purchase.payment_method}</span>
                          <span>•</span>
                          <span>{new Date(purchase.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-extrabold ${purchase.payment_status === 'completed' ? 'text-green-400' : 'text-zinc-500 line-through'}`}>
                        +{(purchase.coins_purchased + purchase.bonus_coins).toLocaleString()} coins
                      </span>
                      <p className="text-xs font-semibold text-zinc-400 mt-0.5">${purchase.price_paid.toFixed(2)} USD</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Administration Dashboard */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6" id="admin-panel">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-purple-950/15 border border-purple-500/10 rounded-2xl">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-purple-400" /> Shop Inventory & Audit Suite
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Manage packages, flash sale campaigns, coupons, and trigger client refunds.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownloadReport('csv')}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
                <button 
                  onClick={() => handleDownloadReport('json')}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </button>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => { setEditingPack(null); setShowAddPackModal(true); }}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Coin Pack
              </button>
              <button 
                onClick={() => setShowAddOfferModal(true)}
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-purple-400" /> Create Flash Sale Offer
              </button>
              <button 
                onClick={() => setShowAddCouponModal(true)}
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-purple-400" /> Create Promo Coupon
              </button>
            </div>

            {/* Existing Packs Administration table */}
            <div className="space-y-3 bg-zinc-950 border border-zinc-900 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Package Inventory</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 font-bold">
                      <th className="pb-2.5">Pack Name</th>
                      <th className="pb-2.5 text-center">Coins</th>
                      <th className="pb-2.5 text-center">Price</th>
                      <th className="pb-2.5 text-center">Bonus Coins</th>
                      <th className="pb-2.5 text-center">Status</th>
                      <th className="pb-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coinPacks.map(p => (
                      <tr key={p.id} className="border-b border-zinc-900/40 last:border-0 hover:bg-zinc-900/20 text-zinc-300 font-medium">
                        <td className="py-3 font-semibold text-white">{p.name}</td>
                        <td className="py-3 text-center">{p.coins.toLocaleString()}</td>
                        <td className="py-3 text-center">${p.price.toFixed(2)}</td>
                        <td className="py-3 text-center text-purple-400">+{p.bonus_coins}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${p.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {p.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setEditingPack(p); setNewPackData({ name: p.name, coins: p.coins, price: p.price, bonus_coins: p.bonus_coins, tag: (p.tag || '') as any, pack_type: p.pack_type, is_active: p.is_active }); setShowAddPackModal(true); }}
                              className="p-1 bg-zinc-900 hover:bg-purple-600/20 text-zinc-400 hover:text-purple-400 rounded transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteCoinPack(p.id)}
                              className="p-1 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Campaign & Offers administration panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Campaigns / Flash Sales</h4>
                {activeOffers.length === 0 ? (
                  <p className="text-xs text-zinc-500">No active campaigns.</p>
                ) : (
                  <div className="space-y-2">
                    {activeOffers.map(o => {
                      const associatedPack = coinPacks.find(p => p.id === o.pack_id);
                      return (
                        <div key={o.id} className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-center justify-between text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-white">{associatedPack?.name || 'Bundle Offer'}</p>
                            <p className="text-[10px] text-zinc-500">{o.description}</p>
                            <p className="text-[10px] text-yellow-500 font-mono">Ends at: {new Date(o.ends_at).toLocaleString()}</p>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div className="space-y-0.5 text-right">
                              <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[9px] font-bold">-{o.discount_percent}% off</span>
                              {o.extra_bonus_percent > 0 && (
                                <p className="text-[9px] text-purple-400 font-bold">+{o.extra_bonus_percent}% bonus</p>
                              )}
                            </div>
                            <button 
                              onClick={() => deleteOffer(o.id)}
                              className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Promo Coupons</h4>
                {coupons.length === 0 ? (
                  <p className="text-xs text-zinc-500">No coupons available.</p>
                ) : (
                  <div className="space-y-2">
                    {coupons.map(c => (
                      <div key={c.code} className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="font-mono font-black text-white uppercase bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{c.code}</span>
                          <p className="text-[10px] text-zinc-500 mt-1">Deduction: -{c.discount_percent}% Discount</p>
                        </div>
                        <button 
                          onClick={() => deleteCoupon(c.code)}
                          className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Global simulated purchases log list */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Purchases & Refund Portal</h4>
              {purchases.length === 0 ? (
                <p className="text-xs text-zinc-500">No purchases found in logs.</p>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500">
                        <th className="pb-2">Purchase ID</th>
                        <th className="pb-2">Coin Pack</th>
                        <th className="pb-2">Price Paid</th>
                        <th className="pb-2">Gateway</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map(p => (
                        <tr key={p.id} className="border-b border-zinc-900/40 last:border-0 hover:bg-zinc-900/10">
                          <td className="py-2.5 font-mono text-zinc-400">{p.id}</td>
                          <td className="py-2.5 text-white font-semibold">{p.pack_name}</td>
                          <td className="py-2.5 text-zinc-300">${p.price_paid.toFixed(2)}</td>
                          <td className="py-2.5 uppercase text-[10px] tracking-wider text-purple-400 font-black">{p.payment_method}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${p.payment_status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {p.payment_status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            {p.payment_status === 'completed' && (
                              <button 
                                onClick={async () => {
                                  const confirmed = window.confirm('Are you sure you want to refund this purchase? This will instantly reverse transaction ledger balances!');
                                  if (confirmed) {
                                    await refundPurchase(p.id);
                                  }
                                }}
                                className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-600 text-red-400 hover:text-white rounded-lg transition-all cursor-pointer"
                              >
                                Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 2. LIVE GATEWAY INTEGRATION & FEATURE FLAGS MANAGEMENT */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-purple-400" /> Integrated Payment Gateways & Flags
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Toggle gateway integrations, mock sandbox mode, and default settlement currencies.</p>
                </div>
                <span className="text-[9px] bg-zinc-900 border border-zinc-850 text-zinc-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">Config Engine Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbGateways.map(gw => (
                  <div key={gw.id} className="p-4 bg-zinc-900/30 border border-zinc-850 hover:border-zinc-800 rounded-2xl space-y-4 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-widest font-extrabold">{gw.id}</span>
                        <h5 className="text-xs font-bold text-white">{gw.name}</h5>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${gw.is_enabled ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {gw.is_enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900/45 text-xs text-zinc-400 font-medium">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <input 
                          type="checkbox" 
                          checked={gw.is_enabled}
                          onChange={(e) => dbUpdateGatewayConfig(gw.id, { is_enabled: e.target.checked })}
                          className="rounded border-zinc-800 text-purple-600 focus:ring-purple-500/20 bg-zinc-900 w-3.5 h-3.5 accent-purple-600"
                        />
                        <span>Enable Gateway</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <input 
                          type="checkbox" 
                          checked={gw.test_mode}
                          onChange={(e) => dbUpdateGatewayConfig(gw.id, { test_mode: e.target.checked })}
                          className="rounded border-zinc-800 text-purple-600 focus:ring-purple-500/20 bg-zinc-900 w-3.5 h-3.5 accent-purple-600"
                        />
                        <span className="text-yellow-400">Sandbox Mode</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-900/30 text-[10px]">
                      <span className="text-zinc-500 font-semibold uppercase tracking-wider">Settlement Currency:</span>
                      <select 
                        value={gw.currency}
                        onChange={(e) => dbUpdateGatewayConfig(gw.id, { currency: e.target.value })}
                        className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-300 font-mono rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. DYNAMIC REFUND CLAIMS APPROVAL CENTER */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-purple-400" /> Pending Refund Claim Requests
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Approve or deny submitted refund claims with integrated coin deduction and subscription revocation.</p>
                </div>
                <span className="text-[9px] bg-zinc-900 border border-zinc-850 text-zinc-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">Claims Hub</span>
              </div>

              {refundRequests.length === 0 ? (
                <div className="text-center py-8 text-zinc-650 text-xs">
                  <ShieldCheck className="w-8 h-8 mx-auto text-zinc-800 mb-2" />
                  No pending refund requests found. Omnix ledger is fully balanced!
                </div>
              ) : (
                <div className="space-y-3.5 text-xs">
                  {refundRequests.map(req => {
                    const matchedOrder = orders.find(o => o.id === req.order_id);
                    return (
                      <div key={req.id} className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 font-extrabold px-2 py-0.5 rounded tracking-wider uppercase">{req.status} CLAIM</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-500 font-mono text-[10px] select-all">Req ID: {req.id.slice(0, 12)}</span>
                          </div>
                          
                          <div>
                            <p className="text-xs text-white font-black">
                              Claim filed on order for: <span className="text-purple-400">"{matchedOrder?.product_name || req.product_name || 'Coin Pack'}"</span>
                            </p>
                            <p className="text-[11px] text-zinc-400 font-medium mt-1">
                              <strong>Client Claim Reason:</strong> "{req.reason || 'Not specified'}"
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              Submitted by: User_{req.user_id.slice(0, 5)} &bull; Amount: <span className="text-white font-bold">${req.amount.toFixed(2)} USD</span>
                            </p>
                          </div>
                        </div>

                        {req.status === 'pending' ? (
                          <div className="flex items-center gap-2 border-t md:border-t-0 border-zinc-900/40 pt-3 md:pt-0">
                            <button 
                              type="button"
                              onClick={async () => {
                                const notes = window.prompt('Add administrative approval notes:', 'Approved: Releasing funds.');
                                if (notes !== null) {
                                  await approveRefund(req.id, notes);
                                  await fetchWalletData(user?.id || '');
                                }
                              }}
                              className="px-3.5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-[11px] transition-all cursor-pointer"
                            >
                              Approve & Revoke
                            </button>
                            <button 
                              type="button"
                              onClick={async () => {
                                const notes = window.prompt('Add administrative rejection reason:', 'Rejected: Invalid refund reason.');
                                if (notes !== null) {
                                  await rejectRefund(req.id, notes);
                                }
                              }}
                              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-850 font-bold text-[11px] transition-all cursor-pointer"
                            >
                              Deny Claim
                            </button>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              req.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-850 text-zinc-500'
                            }`}>
                              Claim {req.status}
                            </span>
                            {req.admin_notes && (
                              <p className="text-[10px] text-zinc-500 mt-1 italic">"{req.admin_notes}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ========================================================
          PURCHASE WIZARD MODAL POPUP (Select -> Confirmation -> Payment -> Success)
          ======================================================== */}
      <AnimatePresence>
        {selectedPack && purchaseStep !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="purchase-wizard-backdrop">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative shadow-2xl shadow-purple-500/5"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5 border-b border-zinc-900 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-purple-400" /> Secure Checkout Wizard
                </h3>
                {purchaseStep !== 'processing' && (
                  <button 
                    onClick={() => { setSelectedPack(null); setPurchaseStep('idle'); }}
                    className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* STEP 1: CONFIRM BREAKDOWN */}
              {purchaseStep === 'confirm' && (
                <div className="space-y-5">
                  <div className="text-center p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Consolidated Balance Bundle</span>
                    <h4 className="text-4xl font-black text-white mt-1">
                      {getPricingBreakdown(selectedPack).totalCoins.toLocaleString()}
                    </h4>
                    <p className="text-[10px] text-purple-400 uppercase font-bold tracking-wider mt-0.5">Coins Bundle</p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-zinc-900 text-zinc-400">
                      <span>Standard Package Price</span>
                      <span className="text-white">${selectedPack.price.toFixed(2)} USD</span>
                    </div>

                    {isPremium && (
                      <div className="flex justify-between py-1.5 border-b border-zinc-900 text-green-400">
                        <span>Premium Client Benefit (-10%)</span>
                        <span>-${(selectedPack.price * 0.1).toFixed(2)} USD</span>
                      </div>
                    )}

                    {validatedCoupon && (
                      <div className="flex justify-between py-1.5 border-b border-zinc-900 text-green-400">
                        <span>Promo Coupon discount (-{validatedCoupon.discount_percent}%)</span>
                        <span>-${(selectedPack.price * (validatedCoupon.discount_percent / 100)).toFixed(2)} USD</span>
                      </div>
                    )}

                    {activeOffers.some(o => o.pack_id === selectedPack.id) && (
                      <div className="flex justify-between py-1.5 border-b border-zinc-900 text-green-400">
                        <span>Flash Sales Discount (-{activeOffers.find(o => o.pack_id === selectedPack.id)?.discount_percent}%)</span>
                        <span>-${(selectedPack.price * (activeOffers.find(o => o.pack_id === selectedPack.id)!.discount_percent / 100)).toFixed(2)} USD</span>
                      </div>
                    )}

                    <div className="flex justify-between py-2 text-sm font-bold text-white">
                      <span>Total Amount Payable</span>
                      <span className="text-purple-400">${getPricingBreakdown(selectedPack).finalPrice.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={handleConfirmOrder}
                      className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-bold text-sm text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Confirm Order Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: GATEWAY SELECT */}
              {purchaseStep === 'gateway' && (
                <div className="space-y-5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">Select Payment Gateway Integration</span>
                  
                  <div className="space-y-2">
                    {dbGateways.map(gw => (
                      <button 
                        key={gw.id}
                        onClick={() => gw.is_enabled && setChosenGateway(gw.id as any)}
                        disabled={!gw.is_enabled}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${!gw.is_enabled ? 'opacity-40 bg-zinc-950 border-zinc-900 cursor-not-allowed' : chosenGateway === gw.id ? 'bg-purple-600/10 border-purple-500 text-white shadow-md' : 'bg-zinc-900/30 border-zinc-850 text-zinc-400 hover:border-zinc-800 cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className={`w-5 h-5 ${chosenGateway === gw.id ? 'text-purple-400' : 'text-zinc-500'}`} />
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-white">{gw.name}</p>
                            <p className="text-[9px] text-zinc-500">{gw.test_mode ? 'Test Mode Active (Bypass Payments)' : 'Live Mode Enabled'}</p>
                          </div>
                        </div>
                        {chosenGateway === gw.id && gw.is_enabled && (
                          <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-white text-[9px] font-bold">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={handleTriggerSimulatedPayment}
                      className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-bold text-sm text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Process Payment Elements (${getPricingBreakdown(selectedPack).finalPrice.toFixed(2)})
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PROCESSING SINK */}
              {purchaseStep === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Contacting {chosenGateway.toUpperCase()} secure checkout...</h4>
                    <p className="text-[10px] text-zinc-500 mt-1 max-w-xs">Simulating payment gateway element handshake & generating cryptographic receipts.</p>
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS SHIELDS */}
              {purchaseStep === 'success' && purchaseResult && (
                <div className="space-y-5 py-4 text-center">
                  <div className="w-16 h-16 bg-green-500/15 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white">Payment Elements Verified!</h4>
                    <p className="text-xs text-zinc-500">Durable ledger state updated successfully.</p>
                  </div>

                  <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Coins Transferred</span>
                      <span className="font-extrabold text-green-400">+{purchaseResult.coinsAdded.toLocaleString()} Coins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Total Price Paid</span>
                      <span className="font-bold text-white">${purchaseResult.finalPrice.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Transaction ID</span>
                      <span className="font-mono text-[9px] text-zinc-400 select-all">{purchaseResult.txId}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setSelectedPack(null); setPurchaseStep('idle'); setPurchaseResult(null); }}
                    className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-bold text-sm text-white transition-all cursor-pointer"
                  >
                    Great, thank you!
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          ADMINISTRATOR MANAGEMENT MODAL DIALOGS
          ======================================================== */}
      {/* 1. Add/Edit Pack modal */}
      <AnimatePresence>
        {showAddPackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative"
            >
              <div className="flex justify-between items-center mb-5 border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-purple-400" /> {editingPack ? 'Edit Coin Pack' : 'Create New Coin Pack'}
                </h3>
                <button onClick={() => { setShowAddPackModal(false); setEditingPack(null); }} className="text-zinc-500 hover:text-white cursor-pointer">&times;</button>
              </div>

              <form onSubmit={handleAddPackSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Package Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Bronze Chest"
                    value={newPackData.name}
                    onChange={(e) => setNewPackData({ ...newPackData, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Base Coins</label>
                    <input 
                      type="number" 
                      required 
                      min={0}
                      value={newPackData.coins}
                      onChange={(e) => setNewPackData({ ...newPackData, coins: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Standard Bonus Coins</label>
                    <input 
                      type="number" 
                      required 
                      min={0}
                      value={newPackData.bonus_coins}
                      onChange={(e) => setNewPackData({ ...newPackData, bonus_coins: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">USD Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required 
                      min={0}
                      value={newPackData.price}
                      onChange={(e) => setNewPackData({ ...newPackData, price: parseFloat(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Featured Tag</label>
                    <select
                      value={newPackData.tag}
                      onChange={(e) => setNewPackData({ ...newPackData, tag: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="">None</option>
                      <option value="popular">Popular</option>
                      <option value="best_value">Best Value</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Pack Type</label>
                  <select
                    value={newPackData.pack_type}
                    onChange={(e) => setNewPackData({ ...newPackData, pack_type: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="standard">Standard</option>
                    <option value="festival">Festival Pack</option>
                    <option value="limited">Limited Time Pack</option>
                    <option value="creator">Creator Pro Pack</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input 
                    type="checkbox" 
                    id="pack_active"
                    checked={newPackData.is_active}
                    onChange={(e) => setNewPackData({ ...newPackData, is_active: e.target.checked })}
                    className="rounded border-zinc-800 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="pack_active" className="text-xs text-zinc-300 font-semibold cursor-pointer">Enable immediately in storefront</label>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  {editingPack ? 'Update Package' : 'Create Package'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Add Offer Modal */}
      <AnimatePresence>
        {showAddOfferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative"
            >
              <div className="flex justify-between items-center mb-5 border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-purple-400" /> Create Flash Sale / Offer
                </h3>
                <button onClick={() => setShowAddOfferModal(false)} className="text-zinc-500 hover:text-white cursor-pointer">&times;</button>
              </div>

              <form onSubmit={handleAddOfferSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Target Coin Pack</label>
                  <select
                    required
                    value={newOfferData.pack_id}
                    onChange={(e) => setNewOfferData({ ...newOfferData, pack_id: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="">Select Package...</option>
                    {coinPacks.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.coins} coins)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Discount (%)</label>
                    <input 
                      type="number" 
                      required 
                      min={0}
                      max={90}
                      value={newOfferData.discount_percent}
                      onChange={(e) => setNewOfferData({ ...newOfferData, discount_percent: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Extra Bonus (%)</label>
                    <input 
                      type="number" 
                      required 
                      min={0}
                      value={newOfferData.extra_bonus_percent}
                      onChange={(e) => setNewOfferData({ ...newOfferData, extra_bonus_percent: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Offer Ends At</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={newOfferData.ends_at}
                    onChange={(e) => setNewOfferData({ ...newOfferData, ends_at: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Campaign Description</label>
                  <textarea 
                    placeholder="Weekend Super Flash Offer!"
                    value={newOfferData.description}
                    onChange={(e) => setNewOfferData({ ...newOfferData, description: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-855 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 h-20 resize-none transition-colors"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Create Offer Campaign
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Add Coupon Modal */}
      <AnimatePresence>
        {showAddCouponModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative"
            >
              <div className="flex justify-between items-center mb-5 border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-purple-400" /> Create Promo Coupon
                </h3>
                <button onClick={() => setShowAddCouponModal(false)} className="text-zinc-500 hover:text-white cursor-pointer">&times;</button>
              </div>

              <form onSubmit={handleAddCouponSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Coupon Code (Uppercase)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. OMNIX40"
                    value={newCouponData.code}
                    onChange={(e) => setNewCouponData({ ...newCouponData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-purple-500 uppercase transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Discount Percent (%)</label>
                  <input 
                    type="number" 
                    required 
                    min={1}
                    max={90}
                    value={newCouponData.discount_percent}
                    onChange={(e) => setNewCouponData({ ...newCouponData, discount_percent: parseInt(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Ends At (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={newCouponData.ends_at}
                    onChange={(e) => setNewCouponData({ ...newCouponData, ends_at: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Create Coupon
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Refund Claim Request Modal Popup */}
      <AnimatePresence>
        {showRefundModal && selectedOrderIdForRefund && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative"
            >
              <div className="flex justify-between items-center mb-5 border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-5 h-5 text-red-400" /> Request Transaction Refund
                </h3>
                <button onClick={() => setShowRefundModal(false)} className="text-zinc-500 hover:text-white cursor-pointer">&times;</button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1">
                  <p className="text-[11px] text-zinc-400 font-medium">Refund Target Order:</p>
                  <p className="font-mono text-xs text-white select-all font-bold">{selectedOrderIdForRefund}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Estimated refund value: <span className="text-red-400 font-bold">${selectedOrderAmountForRefund.toFixed(2)} USD</span></p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Reason for Requesting Refund</label>
                  <textarea 
                    required
                    placeholder="Provide a detailed explanation. E.g., accidental purchase, coins didn't credit properly, subscription duplicate."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 h-24 resize-none transition-colors"
                  />
                </div>

                <p className="text-[10px] text-zinc-500 leading-normal">
                  *Disclaimer: Standard refunds reverse currency tokens/coin balances immediately upon administrative approval. Subscription claims revoke premium status on confirmation.
                </p>

                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="w-1/2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-zinc-850"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={async () => {
                      if (!user) return;
                      if (!refundReason.trim()) {
                        alert('Please specify your refund reason.');
                        return;
                      }
                      const success = await createRefundRequest(
                        selectedOrderIdForRefund,
                        user.id,
                        refundReason,
                        selectedOrderAmountForRefund
                      );
                      if (success) {
                        alert('Your refund claim was successfully filed and is currently pending review.');
                        setShowRefundModal(false);
                        await fetchPaymentData(user.id);
                      } else {
                        alert('Could not register refund request. Please verify the order status.');
                      }
                    }}
                    className="w-1/2 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Submit Claim
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
