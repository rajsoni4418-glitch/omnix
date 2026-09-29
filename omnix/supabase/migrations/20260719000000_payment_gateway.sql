-- Omnix Payment Gateway System Database Schema
-- Migration: 20260719000000_payment_gateway.sql

-- 1. Create Payment Gateways Config Table
CREATE TABLE IF NOT EXISTS public.payment_gateways (
    id TEXT PRIMARY KEY CHECK (id IN ('razorpay', 'google_play', 'apple_pay', 'stripe')),
    name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    test_mode BOOLEAN NOT NULL DEFAULT true,
    currency TEXT NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Initial Gateway Configurations
INSERT INTO public.payment_gateways (id, name, is_enabled, test_mode, currency)
VALUES
  ('razorpay', 'Razorpay Checkout (India)', true, true, 'INR'),
  ('google_play', 'Google Play In-App Billing', true, true, 'USD'),
  ('apple_pay', 'Apple App Store In-App Purchases', true, true, 'USD'),
  ('stripe', 'Stripe Secure Elements (Future)', true, true, 'USD')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Payment Orders Table
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL CHECK (product_type IN ('premium_subscription', 'coin_pack', 'creator_subscription', 'paid_community', 'gift', 'digital_product')),
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    gateway TEXT NOT NULL CHECK (gateway IN ('razorpay', 'google_play', 'apple_pay', 'stripe')),
    gateway_order_id TEXT UNIQUE,
    receipt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Payment Transactions Table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    gateway_transaction_id TEXT NOT NULL UNIQUE,
    gateway_payment_id TEXT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    raw_gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Refund Requests Table
CREATE TABLE IF NOT EXISTS public.refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Refund History Table
CREATE TABLE IF NOT EXISTS public.refund_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_request_id UUID NOT NULL REFERENCES public.refund_requests(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('completed', 'failed')),
    transaction_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Payment Logs (Security & Audit Trail)
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES public.payment_orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    gst_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (gst_amount >= 0),
    payment_method TEXT NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Payment History dynamic materialized-like View
CREATE OR REPLACE VIEW public.payment_history AS
SELECT 
    po.id AS order_id,
    po.user_id,
    po.created_at AS payment_date,
    po.product_name AS product,
    po.amount,
    po.currency,
    po.status,
    po.gateway,
    COALESCE(pt.gateway_transaction_id, po.gateway_order_id) AS transaction_id,
    po.receipt,
    i.invoice_number
FROM public.payment_orders po
LEFT JOIN public.payment_transactions pt ON po.id = pt.order_id AND pt.status = 'completed'
LEFT JOIN public.invoices i ON po.id = i.order_id;

-- 9. Setup Indexes
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_tx ON public.payment_transactions(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON public.refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id ON public.refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_history_request_id ON public.refund_history(refund_request_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);

-- 10. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_gateways_updated_at
    BEFORE UPDATE ON public.payment_gateways
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_orders_updated_at
    BEFORE UPDATE ON public.payment_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refund_requests_updated_at
    BEFORE UPDATE ON public.refund_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Row Level Security (RLS) policies
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Gateway policy
CREATE POLICY "Anyone can view active gateways"
    ON public.payment_gateways FOR SELECT
    USING (is_enabled = true);

CREATE POLICY "Admins can manage gateways"
    ON public.payment_gateways FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Payment orders policies
CREATE POLICY "Users can view own orders"
    ON public.payment_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
    ON public.payment_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
    ON public.payment_orders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
    ON public.payment_orders FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Payment transactions policies
CREATE POLICY "Users can view own transactions"
    ON public.payment_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.payment_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions"
    ON public.payment_transactions FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Refund Requests policies
CREATE POLICY "Users can view own refund requests"
    ON public.refund_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own refund request"
    ON public.refund_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage refund requests"
    ON public.refund_requests FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Refund History policies
CREATE POLICY "Users can view own refund history"
    ON public.refund_history FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.payment_orders 
        WHERE id = refund_history.order_id AND user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage refund history"
    ON public.refund_history FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Logs policy
CREATE POLICY "Admins can view logs"
    ON public.payment_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can insert logs"
    ON public.payment_logs FOR INSERT
    WITH CHECK (true);

-- Invoices policies
CREATE POLICY "Users can view own invoices"
    ON public.invoices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all invoices"
    ON public.invoices FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
