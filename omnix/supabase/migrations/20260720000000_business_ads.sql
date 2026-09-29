-- Omnix Business Account and Advertisement Platform Schema
-- Migration: 20260720000000_business_ads.sql

-- 1. Create Business Profiles Table
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL,
    website TEXT,
    email TEXT,
    phone_number TEXT,
    address TEXT,
    business_hours JSONB,
    is_verified BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Ad Campaigns Table
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    budget NUMERIC(15, 2) NOT NULL CHECK (budget >= 0),
    spent NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (spent >= 0),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    target_audience JSONB,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Advertisements Table
CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('post', 'story', 'omniclip', 'community')),
    content_id UUID, -- References actual post/story ID (weak ref to avoid circular logic across many tables)
    title TEXT NOT NULL,
    media_url TEXT,
    call_to_action TEXT,
    destination_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Campaign Analytics Table
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES public.advertisements(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    reach INT NOT NULL DEFAULT 0,
    impressions INT NOT NULL DEFAULT 0,
    clicks INT NOT NULL DEFAULT 0,
    conversions INT NOT NULL DEFAULT 0,
    cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(ad_id, date)
);

-- 5. Create Brand Collaborations Table
CREATE TABLE IF NOT EXISTS public.brand_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget NUMERIC(15, 2) NOT NULL CHECK (budget >= 0),
    deliverables JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Business Analytics Table
CREATE TABLE IF NOT EXISTS public.business_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    profile_visits INT NOT NULL DEFAULT 0,
    website_clicks INT NOT NULL DEFAULT 0,
    calls INT NOT NULL DEFAULT 0,
    messages INT NOT NULL DEFAULT 0,
    sales_leads INT NOT NULL DEFAULT 0,
    revenue NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(business_id, date)
);

-- 7. Setup Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_profiles_updated_at
    BEFORE UPDATE ON public.business_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at
    BEFORE UPDATE ON public.ad_campaigns
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at
    BEFORE UPDATE ON public.advertisements
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_collaborations_updated_at
    BEFORE UPDATE ON public.brand_collaborations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_business_id ON public.ad_campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_advertisements_campaign_id ON public.advertisements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_advertisements_business_id ON public.advertisements(business_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON public.campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_brand_collaborations_business_id ON public.brand_collaborations(business_id);
CREATE INDEX IF NOT EXISTS idx_brand_collaborations_creator_id ON public.brand_collaborations(creator_id);
CREATE INDEX IF NOT EXISTS idx_business_analytics_business_id ON public.business_analytics(business_id);

-- 9. Row Level Security (RLS)

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_analytics ENABLE ROW LEVEL SECURITY;

-- Business Profiles Policies
CREATE POLICY "Anyone can view approved business profiles"
    ON public.business_profiles FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Users can view own business profile"
    ON public.business_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own business profile"
    ON public.business_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own business profile"
    ON public.business_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can manage business profiles"
    ON public.business_profiles FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Ad Campaigns Policies
CREATE POLICY "Businesses can manage own campaigns"
    ON public.ad_campaigns FOR ALL
    USING (business_id = auth.uid());

CREATE POLICY "Admins can manage campaigns"
    ON public.ad_campaigns FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Advertisements Policies
CREATE POLICY "Anyone can view approved active ads"
    ON public.advertisements FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Businesses can manage own ads"
    ON public.advertisements FOR ALL
    USING (business_id = auth.uid());

CREATE POLICY "Admins can manage ads"
    ON public.advertisements FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Campaign Analytics Policies
CREATE POLICY "Businesses can view own campaign analytics"
    ON public.campaign_analytics FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.ad_campaigns WHERE id = campaign_analytics.campaign_id AND business_id = auth.uid()
    ));

CREATE POLICY "Admins can manage campaign analytics"
    ON public.campaign_analytics FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Brand Collaborations Policies
CREATE POLICY "Businesses can manage own collaborations"
    ON public.brand_collaborations FOR ALL
    USING (business_id = auth.uid());

CREATE POLICY "Creators can manage own collaborations"
    ON public.brand_collaborations FOR ALL
    USING (creator_id = auth.uid());

CREATE POLICY "Admins can manage collaborations"
    ON public.brand_collaborations FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Business Analytics Policies
CREATE POLICY "Businesses can view own analytics"
    ON public.business_analytics FOR SELECT
    USING (business_id = auth.uid());

CREATE POLICY "Admins can manage business analytics"
    ON public.business_analytics FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
