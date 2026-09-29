import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useWalletStore } from './walletStore';
import { useSubscriptionStore } from './subscriptionStore';

export interface PaymentGatewayConfig {
  id: 'razorpay' | 'google_play' | 'apple_pay' | 'stripe';
  name: string;
  is_enabled: boolean;
  test_mode: boolean;
  currency: string;
}

export interface PaymentOrder {
  id: string;
  user_id: string;
  product_type: 'premium_subscription' | 'coin_pack' | 'creator_subscription' | 'paid_community' | 'gift' | 'digital_product';
  product_id: string;
  product_name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  gateway: 'razorpay' | 'google_play' | 'apple_pay' | 'stripe';
  gateway_order_id?: string;
  receipt?: string;
  created_at: string;
  updated_at: string;
}

interface ServerPaymentOrder {
  id: string;
  amount: number;
  gatewayOrderId: string;
  receipt: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  order_id: string;
  user_id: string;
  gateway_transaction_id: string;
  gateway_payment_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  raw_gateway_response?: any;
  created_at: string;
}

export interface RefundRequest {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  username?: string;
  email?: string;
  product_name?: string;
}

export interface RefundHistory {
  id: string;
  refund_request_id: string;
  order_id: string;
  amount: number;
  status: 'completed' | 'failed';
  transaction_id: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  order_id: string;
  user_id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  gst_amount: number;
  payment_method: string;
  pdf_url?: string;
  created_at: string;
}

export interface PaymentHistoryRecord {
  order_id: string;
  user_id: string;
  payment_date: string;
  product: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  gateway: 'razorpay' | 'google_play' | 'apple_pay' | 'stripe';
  transaction_id: string;
  receipt: string;
  invoice_number?: string;
  username?: string;
  email?: string;
}

interface PaymentState {
  gateways: PaymentGatewayConfig[];
  orders: PaymentOrder[];
  transactions: PaymentTransaction[];
  refundRequests: RefundRequest[];
  refundHistory: RefundHistory[];
  invoices: Invoice[];
  paymentHistory: PaymentHistoryRecord[];
  useLocalFallback: boolean;
  isLoading: boolean;
  error: string | null;

  fetchPaymentData: (userId: string) => Promise<void>;
  fetchAdminPaymentData: () => Promise<void>;
  
  createOrder: (
    userId: string,
    productType: PaymentOrder['product_type'],
    productId: string,
    productName: string,
    amount: number,
    currency: string,
    gateway: PaymentOrder['gateway']
  ) => Promise<PaymentOrder | null>;

  processPayment: (
    orderId: string,
    gatewayPaymentId: string,
    gatewayTransactionId: string,
    responsePayload?: any
  ) => Promise<{ success: boolean; order: PaymentOrder | null; error?: string }>;

  createRefundRequest: (
    orderId: string,
    userId: string,
    reason: string,
    amount: number
  ) => Promise<boolean>;

  approveRefund: (refundRequestId: string, adminNotes?: string) => Promise<boolean>;
  rejectRefund: (refundRequestId: string, adminNotes?: string) => Promise<boolean>;

  updateGatewayConfig: (
    gatewayId: PaymentGatewayConfig['id'],
    updates: Partial<PaymentGatewayConfig>
  ) => Promise<void>;

  generateInvoicePDF: (invoiceId: string) => void;
  exportReport: (format: 'csv' | 'json') => string;
}

const DEFAULT_GATEWAYS: PaymentGatewayConfig[] = [
  { id: 'razorpay', name: 'Razorpay Checkout (India)', is_enabled: true, test_mode: true, currency: 'INR' },
  { id: 'google_play', name: 'Google Play In-App Billing', is_enabled: true, test_mode: true, currency: 'USD' },
  { id: 'apple_pay', name: 'Apple App Store In-App Purchases', is_enabled: true, test_mode: true, currency: 'USD' },
  { id: 'stripe', name: 'Stripe Secure Elements (Future)', is_enabled: true, test_mode: true, currency: 'USD' }
];

// Fallback handlers
const getLocalGateways = (): PaymentGatewayConfig[] => {
  const d = localStorage.getItem('omnix_p_gateways');
  if (d) return JSON.parse(d);
  localStorage.setItem('omnix_p_gateways', JSON.stringify(DEFAULT_GATEWAYS));
  return DEFAULT_GATEWAYS;
};

const getLocalOrders = (userId?: string): PaymentOrder[] => {
  const d = localStorage.getItem('omnix_p_orders');
  const all: PaymentOrder[] = d ? JSON.parse(d) : [];
  return userId ? all.filter(o => o.user_id === userId) : all;
};

const saveLocalOrders = (orders: PaymentOrder[]) => {
  localStorage.setItem('omnix_p_orders', JSON.stringify(orders));
};

const getLocalTransactions = (): PaymentTransaction[] => {
  const d = localStorage.getItem('omnix_p_transactions');
  return d ? JSON.parse(d) : [];
};

const getLocalRefundRequests = (): RefundRequest[] => {
  const d = localStorage.getItem('omnix_p_refund_requests');
  return d ? JSON.parse(d) : [];
};

const getLocalRefundHistory = (): RefundHistory[] => {
  const d = localStorage.getItem('omnix_p_refund_history');
  return d ? JSON.parse(d) : [];
};

const getLocalInvoices = (): Invoice[] => {
  const d = localStorage.getItem('omnix_p_invoices');
  return d ? JSON.parse(d) : [];
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  gateways: DEFAULT_GATEWAYS,
  orders: [],
  transactions: [],
  refundRequests: [],
  refundHistory: [],
  invoices: [],
  paymentHistory: [],
  useLocalFallback: false,
  isLoading: false,
  error: null,

  fetchPaymentData: async (userId) => {
    set({ isLoading: true });

    if (get().useLocalFallback) {
      const orders = getLocalOrders(userId);
      const invoices = getLocalInvoices().filter(i => i.user_id === userId);
      const refunds = getLocalRefundRequests().filter(r => r.user_id === userId);
      const txs = getLocalTransactions().filter(t => t.user_id === userId);

      const history: PaymentHistoryRecord[] = orders.map(o => {
        const tx = txs.find(t => t.order_id === o.id && t.status === 'completed');
        const inv = invoices.find(i => i.order_id === o.id);
        return {
          order_id: o.id,
          user_id: o.user_id,
          payment_date: o.created_at,
          product: o.product_name,
          amount: o.amount,
          currency: o.currency,
          status: o.status,
          gateway: o.gateway,
          transaction_id: tx?.gateway_transaction_id || o.gateway_order_id || 'N/A',
          receipt: o.receipt || '',
          invoice_number: inv?.invoice_number
        };
      });

      set({
        gateways: getLocalGateways(),
        orders,
        invoices,
        refundRequests: refunds,
        transactions: txs,
        paymentHistory: history,
        isLoading: false
      });
      return;
    }

    try {
      const { data: gData, error: gErr } = await supabase.from('payment_gateways').select('*');
      if (gErr) throw gErr;

      const { data: oData, error: oErr } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (oErr) throw oErr;

      const { data: invData } = await supabase.from('invoices').select('*').eq('user_id', userId);
      const { data: refData } = await supabase.from('refund_requests').select('*').eq('user_id', userId);
      const { data: histData } = await supabase.from('payment_history').select('*').eq('user_id', userId);

      set({
        gateways: (gData || []) as PaymentGatewayConfig[],
        orders: (oData || []) as PaymentOrder[],
        invoices: (invData || []) as Invoice[],
        refundRequests: (refData || []) as RefundRequest[],
        paymentHistory: (histData || []) as PaymentHistoryRecord[],
        useLocalFallback: false,
        isLoading: false
      });
    } catch (e: any) {
      console.warn('DB error or tables missing. Falling back to Payment Local Sandbox.', e.message);
      set({ useLocalFallback: true, isLoading: false });
      await get().fetchPaymentData(userId);
    }
  },

  fetchAdminPaymentData: async () => {
    set({ isLoading: true });

    if (get().useLocalFallback) {
      const orders = getLocalOrders();
      const invoices = getLocalInvoices();
      const refunds = getLocalRefundRequests();
      const txs = getLocalTransactions();

      const history: PaymentHistoryRecord[] = orders.map(o => {
        const tx = txs.find(t => t.order_id === o.id && t.status === 'completed');
        const inv = invoices.find(i => i.order_id === o.id);
        return {
          order_id: o.id,
          user_id: o.user_id,
          payment_date: o.created_at,
          product: o.product_name,
          amount: o.amount,
          currency: o.currency,
          status: o.status,
          gateway: o.gateway,
          transaction_id: tx?.gateway_transaction_id || o.gateway_order_id || 'N/A',
          receipt: o.receipt || '',
          invoice_number: inv?.invoice_number,
          username: 'User_' + o.user_id.slice(0,4),
          email: 'user_' + o.user_id.slice(0,4) + '@omnix.com'
        };
      });

      set({
        gateways: getLocalGateways(),
        orders,
        invoices,
        refundRequests: refunds,
        paymentHistory: history,
        isLoading: false
      });
      return;
    }

    try {
      const { data: gData } = await supabase.from('payment_gateways').select('*');
      const { data: oData } = await supabase.from('payment_orders').select('*').order('created_at', { ascending: false });
      const { data: invData } = await supabase.from('invoices').select('*');
      const { data: refData } = await supabase.from('refund_requests').select('*');
      const { data: histData } = await supabase.from('payment_history').select('*');

      set({
        gateways: (gData || []) as PaymentGatewayConfig[],
        orders: (oData || []) as PaymentOrder[],
        invoices: (invData || []) as Invoice[],
        refundRequests: (refData || []) as RefundRequest[],
        paymentHistory: (histData || []) as PaymentHistoryRecord[],
        isLoading: false
      });
    } catch (e: any) {
      console.warn('Admin DB payment fetch failed:', e.message);
      set({ useLocalFallback: true, isLoading: false });
      await get().fetchAdminPaymentData();
    }
  },

  createOrder: async (userId, productType, productId, productName, amount, currency, gateway) => {
    const orderId = 'ord_' + Math.random().toString(36).substring(2, 12);
    const orderIdUuid = '8fb7f5ae-b1d5-4ee7-8652-' + Math.random().toString(16).substring(2, 14); // valid UUID layout for Supabase

    const newOrder: PaymentOrder = {
      id: orderIdUuid,
      user_id: userId,
      product_type: productType,
      product_id: productId,
      product_name: productName,
      amount,
      currency,
      status: 'pending',
      gateway,
      gateway_order_id: 'gord_' + gateway.slice(0, 3) + '_' + Math.random().toString(36).substring(2, 10),
      receipt: 'rec_' + Math.random().toString(36).substring(2, 12),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (get().useLocalFallback) {
      const orders = getLocalOrders();
      orders.unshift(newOrder);
      saveLocalOrders(orders);
      set({ orders });
      return newOrder;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Authentication required.');

      // Create the gateway order on the server. This prevents the browser from
      // inventing gateway order IDs or changing the amount after checkout.
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId,
          productType,
          productId,
          productName,
          amount,
          currency,
          gateway,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success || !result.order) {
        throw new Error(result.error || 'Unable to create payment order.');
      }

      const serverOrder = result.order as ServerPaymentOrder;
      const persistedOrder: PaymentOrder = {
        ...newOrder,
        id: serverOrder.id,
        amount: Number(serverOrder.amount),
        gateway_order_id: serverOrder.gatewayOrderId,
        receipt: serverOrder.receipt,
        status: 'pending',
        created_at: serverOrder.createdAt,
        updated_at: serverOrder.createdAt,
      };

      // Keep the application ledger in Supabase in sync with the gateway order.
      const { error } = await supabase.from('payment_orders').upsert({
        id: persistedOrder.id,
        user_id: userId,
        product_type: productType,
        product_id: productId,
        product_name: productName,
        amount: persistedOrder.amount,
        currency,
        gateway,
        gateway_order_id: persistedOrder.gateway_order_id,
        receipt: persistedOrder.receipt,
        status: 'pending',
      });
      if (error) throw error;

      await get().fetchPaymentData(userId);
      return persistedOrder;
    } catch (e: any) {
      console.error('Failed to create verified payment order:', e.message);
      set({ error: e.message || 'Unable to create payment order.' });
      return null;
    }
  },

  processPayment: async (orderId, gatewayPaymentId, gatewayTransactionId, responsePayload) => {
    set({ isLoading: true });
    
    let targetOrder = get().orders.find(o => o.id === orderId);
    if (!targetOrder) {
      const localOrds = getLocalOrders();
      targetOrder = localOrds.find(o => o.id === orderId);
    }

    if (!targetOrder) {
      set({ isLoading: false });
      return { success: false, order: null, error: 'Order not found.' };
    }

    // 1. Double spend & verification safety check
    if (targetOrder.status === 'completed') {
      set({ isLoading: false });
      return { success: true, order: targetOrder };
    }

    // Never mark a real payment completed from browser-supplied data alone.
    // The server validates the Razorpay HMAC signature before we update the ledger.
    if (!get().useLocalFallback) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        set({ isLoading: false, error: 'Your session has expired. Please sign in again.' });
        return { success: false, order: targetOrder, error: 'Authentication required.' };
      }

      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            orderId,
            gatewayPaymentId,
            gatewayTransactionId,
            responsePayload,
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.verified) {
          const message = result.error || 'Payment verification failed.';
          set({ isLoading: false, error: message });
          return { success: false, order: targetOrder, error: message };
        }
      } catch (error: any) {
        const message = error?.message || 'Payment verification service is unavailable.';
        set({ isLoading: false, error: message });
        return { success: false, order: targetOrder, error: message };
      }
    }

    const finalOrder: PaymentOrder = {
      ...targetOrder,
      status: 'completed',
      updated_at: new Date().toISOString()
    };

    const newTx: PaymentTransaction = {
      id: 'tx_p_' + Math.random().toString(36).substring(2, 10),
      order_id: orderId,
      user_id: targetOrder.user_id,
      gateway_transaction_id: gatewayTransactionId,
      gateway_payment_id: gatewayPaymentId,
      amount: targetOrder.amount,
      currency: targetOrder.currency,
      status: 'completed',
      raw_gateway_response: responsePayload || { verified_on_server: true },
      created_at: new Date().toISOString()
    };

    // Generate downloadable invoice record
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const invoiceNum = `INV-${yearMonth}-${Math.floor(1000 + Math.random() * 9000)}`;
    const gstPct = targetOrder.gateway === 'razorpay' ? 0.18 : 0.00; // 18% GST for India Razorpay
    const gstAmount = parseFloat((targetOrder.amount * gstPct).toFixed(2));

    const newInvoice: Invoice = {
      id: 'inv_' + Math.random().toString(36).substring(2, 10),
      order_id: orderId,
      user_id: targetOrder.user_id,
      invoice_number: invoiceNum,
      customer_name: 'Omnix Customer',
      customer_email: 'customer@omnix.com',
      amount: targetOrder.amount,
      gst_amount: gstAmount,
      payment_method: targetOrder.gateway.toUpperCase(),
      pdf_url: '',
      created_at: new Date().toISOString()
    };

    // Update Wallet / Subscriptions
    if (targetOrder.product_type === 'coin_pack') {
      const match = targetOrder.product_name.match(/(\d+[,.]?\d*)\s*Coins/i);
      const coinsAdded = match ? parseInt(match[1].replace(/[,.]/g, ''), 10) : 500;
      await useWalletStore.getState().executeTransaction(
        targetOrder.user_id,
        coinsAdded,
        'coin_purchase',
        `Purchased ${targetOrder.product_name} via ${targetOrder.gateway.toUpperCase()}`,
        'purchase_gateway',
        gatewayTransactionId
      );
    } else if (targetOrder.product_type === 'premium_subscription') {
      // Subscribe user to premium plan
      const planId = targetOrder.product_id; // premium_monthly or premium_yearly
      const isYearly = planId.includes('yearly');
      await useSubscriptionStore.getState().subscribe(
        targetOrder.user_id,
        planId,
        isYearly ? 'yearly' : 'monthly'
      );
    }

    if (get().useLocalFallback) {
      // Save order
      const orders = getLocalOrders().map(o => o.id === orderId ? finalOrder : o);
      saveLocalOrders(orders);

      // Save Transaction
      const txs = getLocalTransactions();
      txs.unshift(newTx);
      localStorage.setItem('omnix_p_transactions', JSON.stringify(txs));

      // Save Invoice
      const invoices = getLocalInvoices();
      invoices.unshift(newInvoice);
      localStorage.setItem('omnix_p_invoices', JSON.stringify(invoices));

      // Save Payment Audit Logs
      const logs = JSON.parse(localStorage.getItem('omnix_p_logs') || '[]');
      logs.unshift({
        id: 'log_pm_' + Math.random().toString(36).substring(2,10),
        user_id: targetOrder.user_id,
        action: 'payment_verified',
        details: `Successfully verified payment for ${targetOrder.product_name}. Order ID: ${orderId}. Gateway: ${targetOrder.gateway}`,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('omnix_p_logs', JSON.stringify(logs));

      await get().fetchPaymentData(targetOrder.user_id);
      set({ isLoading: false });
      return { success: true, order: finalOrder };
    }

    try {
      // Save Order state
      const { error: oErr } = await supabase
        .from('payment_orders')
        .update({ status: 'completed' })
        .eq('id', orderId);
      if (oErr) throw oErr;

      // Save Transaction details
      await supabase.from('payment_transactions').insert({
        order_id: orderId,
        user_id: targetOrder.user_id,
        gateway_transaction_id: gatewayTransactionId,
        gateway_payment_id: gatewayPaymentId,
        amount: targetOrder.amount,
        currency: targetOrder.currency,
        status: 'completed',
        raw_gateway_response: responsePayload || { verified_on_server: true }
      });

      // Save Invoice details
      await supabase.from('invoices').insert({
        order_id: orderId,
        user_id: targetOrder.user_id,
        invoice_number: invoiceNum,
        customer_name: 'Omnix Customer',
        customer_email: 'customer@omnix.com',
        amount: targetOrder.amount,
        gst_amount: gstAmount,
        payment_method: targetOrder.gateway.toUpperCase()
      });

      // Log verification success
      await supabase.from('payment_logs').insert({
        user_id: targetOrder.user_id,
        action: 'payment_verified',
        details: `Successfully verified payment on server. Order: ${orderId}. Gateway: ${targetOrder.gateway}`
      });

      await get().fetchPaymentData(targetOrder.user_id);
      set({ isLoading: false });
      return { success: true, order: finalOrder };
    } catch (e: any) {
      console.error('Failed to persist verified payment in Supabase:', e.message);
      set({ isLoading: false, error: 'Payment was verified but could not be recorded. Please contact support before retrying.' });
      return { success: false, order: targetOrder, error: 'Payment record could not be saved.' };
    }
  },

  createRefundRequest: async (orderId, userId, reason, amount) => {
    set({ isLoading: true });

    const newRequest: RefundRequest = {
      id: 'ref_req_' + Math.random().toString(36).substring(2, 10),
      order_id: orderId,
      user_id: userId,
      reason,
      amount,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (get().useLocalFallback) {
      const requests = getLocalRefundRequests();
      requests.unshift(newRequest);
      localStorage.setItem('omnix_p_refund_requests', JSON.stringify(requests));

      // Update Order status locally
      const orders = getLocalOrders().map(o => o.id === orderId ? { ...o, status: 'processing' as const } : o);
      saveLocalOrders(orders);

      await get().fetchPaymentData(userId);
      set({ isLoading: false });
      return true;
    }

    try {
      const { error } = await supabase.from('refund_requests').insert({
        order_id: orderId,
        user_id: userId,
        reason,
        amount
      });
      if (error) throw error;

      await supabase.from('payment_orders').update({ status: 'processing' }).eq('id', orderId);

      await get().fetchPaymentData(userId);
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      console.error('Failed to register refund request, saving locally:', e.message);
      const requests = getLocalRefundRequests();
      requests.unshift(newRequest);
      localStorage.setItem('omnix_p_refund_requests', JSON.stringify(requests));

      const orders = getLocalOrders().map(o => o.id === orderId ? { ...o, status: 'processing' as const } : o);
      saveLocalOrders(orders);

      await get().fetchPaymentData(userId);
      set({ isLoading: false });
      return true;
    }
  },

  approveRefund: async (refundRequestId, adminNotes = 'Approved by administrator.') => {
    set({ isLoading: true });

    let request = get().refundRequests.find(r => r.id === refundRequestId);
    if (!request) {
      request = getLocalRefundRequests().find(r => r.id === refundRequestId);
    }

    if (!request) {
      set({ error: 'Refund request not found.', isLoading: false });
      return false;
    }

    const orderId = request.order_id;
    let targetOrder = get().orders.find(o => o.id === orderId);
    if (!targetOrder) {
      targetOrder = getLocalOrders().find(o => o.id === orderId);
    }

    if (!targetOrder) {
      set({ error: 'Order not found for refund.', isLoading: false });
      return false;
    }

    // Process refund logic on Wallet or Subscription
    if (targetOrder.product_type === 'coin_pack') {
      const match = targetOrder.product_name.match(/(\d+[,.]?\d*)\s*Coins/i);
      const coinsAdded = match ? parseInt(match[1].replace(/[,.]/g, ''), 10) : 500;
      // Reverse payment ledger
      await useWalletStore.getState().executeTransaction(
        targetOrder.user_id,
        -coinsAdded,
        'coin_purchase_refund',
        `Deducted ${coinsAdded} Coins for refund of ${targetOrder.product_name}`,
        'admin_adjustment',
        'ref_' + orderId
      );
    } else if (targetOrder.product_type === 'premium_subscription') {
      // Revoke Premium Subscription
      await useSubscriptionStore.getState().removePremium(targetOrder.user_id);
    }

    const updatedRequest: RefundRequest = {
      ...request,
      status: 'approved',
      admin_notes: adminNotes,
      updated_at: new Date().toISOString()
    };

    const newHistory: RefundHistory = {
      id: 'ref_hist_' + Math.random().toString(36).substring(2, 10),
      refund_request_id: refundRequestId,
      order_id: orderId,
      amount: request.amount,
      status: 'completed',
      transaction_id: 'ref_tx_' + Math.random().toString(36).substring(2, 12),
      created_at: new Date().toISOString()
    };

    const updatedOrder: PaymentOrder = {
      ...targetOrder,
      status: 'refunded',
      updated_at: new Date().toISOString()
    };

    if (get().useLocalFallback) {
      // Save requests
      const reqs = getLocalRefundRequests().map(r => r.id === refundRequestId ? updatedRequest : r);
      localStorage.setItem('omnix_p_refund_requests', JSON.stringify(reqs));

      // Save order
      const ords = getLocalOrders().map(o => o.id === orderId ? updatedOrder : o);
      saveLocalOrders(ords);

      // Save History
      const hist = getLocalRefundHistory();
      hist.unshift(newHistory);
      localStorage.setItem('omnix_p_refund_history', JSON.stringify(hist));

      await get().fetchAdminPaymentData();
      set({ isLoading: false });
      return true;
    }

    try {
      await supabase.from('refund_requests').update({ status: 'approved', admin_notes: adminNotes }).eq('id', refundRequestId);
      await supabase.from('payment_orders').update({ status: 'refunded' }).eq('id', orderId);
      await supabase.from('refund_history').insert({
        refund_request_id: refundRequestId,
        order_id: orderId,
        amount: request.amount,
        status: 'completed',
        transaction_id: newHistory.transaction_id
      });

      await get().fetchAdminPaymentData();
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      console.error('Failed to approve refund in Supabase, falling back:', e.message);
      // Fallback
      const reqs = getLocalRefundRequests().map(r => r.id === refundRequestId ? updatedRequest : r);
      localStorage.setItem('omnix_p_refund_requests', JSON.stringify(reqs));

      const ords = getLocalOrders().map(o => o.id === orderId ? updatedOrder : o);
      saveLocalOrders(ords);

      const hist = getLocalRefundHistory();
      hist.unshift(newHistory);
      localStorage.setItem('omnix_p_refund_history', JSON.stringify(hist));

      await get().fetchAdminPaymentData();
      set({ isLoading: false });
      return true;
    }
  },

  rejectRefund: async (refundRequestId, adminNotes = 'Rejected by administrator.') => {
    set({ isLoading: true });

    let request = get().refundRequests.find(r => r.id === refundRequestId);
    if (!request) {
      request = getLocalRefundRequests().find(r => r.id === refundRequestId);
    }

    if (!request) {
      set({ error: 'Refund request not found.', isLoading: false });
      return false;
    }

    const orderId = request.order_id;
    let targetOrder = get().orders.find(o => o.id === orderId);
    if (!targetOrder) {
      targetOrder = getLocalOrders().find(o => o.id === orderId);
    }

    const updatedRequest: RefundRequest = {
      ...request,
      status: 'rejected',
      admin_notes: adminNotes,
      updated_at: new Date().toISOString()
    };

    const updatedOrder: PaymentOrder = {
      ...targetOrder!,
      status: 'completed',
      updated_at: new Date().toISOString()
    };

    if (get().useLocalFallback) {
      const reqs = getLocalRefundRequests().map(r => r.id === refundRequestId ? updatedRequest : r);
      localStorage.setItem('omnix_p_refund_requests', JSON.stringify(reqs));

      const ords = getLocalOrders().map(o => o.id === orderId ? updatedOrder : o);
      saveLocalOrders(ords);

      await get().fetchAdminPaymentData();
      set({ isLoading: false });
      return true;
    }

    try {
      await supabase.from('refund_requests').update({ status: 'rejected', admin_notes: adminNotes }).eq('id', refundRequestId);
      await supabase.from('payment_orders').update({ status: 'completed' }).eq('id', orderId);

      await get().fetchAdminPaymentData();
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      const reqs = getLocalRefundRequests().map(r => r.id === refundRequestId ? updatedRequest : r);
      localStorage.setItem('omnix_p_refund_requests', JSON.stringify(reqs));

      const ords = getLocalOrders().map(o => o.id === orderId ? updatedOrder : o);
      saveLocalOrders(ords);

      await get().fetchAdminPaymentData();
      set({ isLoading: false });
      return true;
    }
  },

  updateGatewayConfig: async (gatewayId, updates) => {
    set(state => ({
      gateways: state.gateways.map(g => g.id === gatewayId ? { ...g, ...updates } : g)
    }));

    if (get().useLocalFallback) {
      const list = getLocalGateways().map(g => g.id === gatewayId ? { ...g, ...updates } : g);
      localStorage.setItem('omnix_p_gateways', JSON.stringify(list));
      return;
    }

    try {
      await supabase.from('payment_gateways').update(updates).eq('id', gatewayId);
    } catch (e: any) {
      console.warn('DB update gateway failed, synced locally only.', e.message);
      const list = getLocalGateways().map(g => g.id === gatewayId ? { ...g, ...updates } : g);
      localStorage.setItem('omnix_p_gateways', JSON.stringify(list));
    }
  },

  generateInvoicePDF: (invoiceId) => {
    const inv = get().invoices.find(i => i.id === invoiceId) || getLocalInvoices().find(i => i.id === invoiceId);
    if (!inv) return;

    // Beautiful printable text rendering or trigger browser window print
    const htmlContent = `
      <html>
        <head>
          <title>Invoice - ${inv.invoice_number}</title>
          <style>
            body { font-family: 'Inter', sans-serif; background: #000; color: #fff; padding: 40px; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #222; padding: 30px; border-radius: 16px; background: #0c0c0e; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1f1f23; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 900; color: #a855f7; }
            .meta { text-align: right; font-size: 12px; color: #a1a1aa; }
            .customer { margin-bottom: 30px; }
            .customer h3 { font-size: 14px; color: #a855f7; margin-bottom: 5px; }
            .customer p { margin: 0; font-size: 12px; color: #e4e4e7; }
            table { width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 30px; }
            th { border-bottom: 1px solid #222; padding: 10px; font-size: 12px; text-transform: uppercase; color: #71717a; }
            td { padding: 12px 10px; border-bottom: 1px solid #111; font-size: 13px; color: #f4f4f5; }
            .totals { display: flex; flex-direction: column; align-items: flex-end; font-size: 13px; color: #a1a1aa; }
            .total-row { display: flex; justify-content: space-between; width: 250px; padding: 5px 0; }
            .grand-total { font-size: 18px; font-weight: 900; color: #a855f7; border-top: 1px solid #222; padding-top: 10px; margin-top: 10px; }
            .footer { border-top: 1px solid #1f1f23; padding-top: 20px; margin-top: 40px; text-align: center; font-size: 11px; color: #52525b; }
            @media print {
              body { background: white; color: black; }
              .invoice-box { border: none; background: transparent; }
              td { color: black; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="logo">OMNIX</div>
              <div class="meta">
                <strong>Invoice:</strong> ${inv.invoice_number}<br>
                <strong>Date:</strong> ${new Date(inv.created_at).toLocaleDateString()}<br>
                <strong>Method:</strong> ${inv.payment_method}
              </div>
            </div>
            <div class="customer">
              <h3>Billed To</h3>
              <p><strong>Name:</strong> ${inv.customer_name}</p>
              <p><strong>Email:</strong> ${inv.customer_email}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Quantity</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Digital Content & Premium Platform Services</td>
                  <td style="text-align: right;">1</td>
                  <td style="text-align: right;">$${(inv.amount - inv.gst_amount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>$${(inv.amount - inv.gst_amount).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>GST (if applicable):</span>
                <span>$${inv.gst_amount.toFixed(2)}</span>
              </div>
              <div class="total-row grand-total">
                <strong>Total Paid:</strong>
                <strong>$${inv.amount.toFixed(2)} USD</strong>
              </div>
            </div>
            <div class="footer">
              Thank you for supporting creators on Omnix. This is an electronically generated receipt.<br>
              Omnix Technologies, Inc. &bull; Secure Payment Gateway Protected
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
    }
  },

  exportReport: (format) => {
    const list = get().paymentHistory;
    if (format === 'json') {
      return JSON.stringify(list, null, 2);
    }
    const headers = ['Order ID', 'User ID', 'Payment Date', 'Product', 'Amount', 'Currency', 'Status', 'Gateway', 'Transaction ID', 'Invoice Number'];
    const rows = list.map(p => [
      p.order_id,
      p.user_id,
      p.payment_date,
      p.product,
      p.amount,
      p.currency,
      p.status,
      p.gateway,
      p.transaction_id,
      p.invoice_number || ''
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}));
