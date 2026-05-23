-- ============================================
-- REFERRAL SYSTEM
-- 5% commission to referrer for first 6 months
-- ============================================

-- Referral tracking table
CREATE TABLE referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    referred_artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    referral_code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'expired')) DEFAULT 'pending',
    
    -- Commission tracking
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.05, -- 5%
    commission_duration_months INTEGER NOT NULL DEFAULT 6,
    
    -- Tracking
    total_sales_generated INTEGER DEFAULT 0, -- in cents
    total_commission_paid INTEGER DEFAULT 0, -- in cents
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    artist_approved_at TIMESTAMPTZ, -- When artist was approved
    expires_at TIMESTAMPTZ, -- 6 months after approval
    
    UNIQUE(referred_artist_id), -- One referrer per artist
    UNIQUE(referral_code)
);

-- Referral earnings (line items for each sale)
CREATE TABLE referral_earnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE NOT NULL,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
    
    -- Earnings breakdown
    sale_amount INTEGER NOT NULL, -- in cents
    commission_amount INTEGER NOT NULL, -- in cents (5% of sale)
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')) DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(order_item_id) -- One referral earning per order item
);

-- Indexes
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_artist ON referrals(referred_artist_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_expires ON referrals(expires_at);
CREATE INDEX idx_referral_earnings_referral ON referral_earnings(referral_id);
CREATE INDEX idx_referral_earnings_status ON referral_earnings(status);

-- RLS Policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;

-- Referrers can view their own referrals
CREATE POLICY "Referrers can view their referrals"
ON referrals FOR SELECT
USING (auth.uid() = referrer_id);

-- Artists can see who referred them
CREATE POLICY "Artists can see their referrer"
ON referrals FOR SELECT
USING (auth.uid() = referred_artist_id);

-- System can create referrals
CREATE POLICY "System can create referrals"
ON referrals FOR INSERT
WITH CHECK (true);

-- System can update referrals
CREATE POLICY "System can update referrals"
ON referrals FOR UPDATE
USING (true);

-- Referral earnings policies
CREATE POLICY "Referrers can view their earnings"
ON referral_earnings FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM referrals 
        WHERE referrals.id = referral_earnings.referral_id 
        AND referrals.referrer_id = auth.uid()
    )
);

-- ============================================
-- FUNCTIONS FOR REFERRAL SYSTEM
-- ============================================

-- Function to create a referral when artist applies
CREATE OR REPLACE FUNCTION create_referral_on_artist_apply()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if a referral code was provided
    IF NEW.referral_code IS NOT NULL THEN
        -- Find the referrer
        INSERT INTO referrals (
            referrer_id,
            referred_artist_id,
            referral_code,
            status,
            artist_approved_at,
            expires_at
        )
        SELECT 
            r.referrer_id,
            NEW.id,
            NEW.referral_code,
            'completed',
            NOW(),
            NOW() + INTERVAL '6 months'
        FROM referrals r
        WHERE r.referral_code = NEW.referral_code
        AND r.status = 'pending'
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate referral commission on sale
CREATE OR REPLACE FUNCTION calculate_referral_commission(
    p_order_item_id UUID,
    p_sale_amount INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_referral_id UUID;
    v_commission_rate DECIMAL(5,4);
    v_expires_at TIMESTAMPTZ;
    v_commission_amount INTEGER;
BEGIN
    -- Find active referral for this artist
    SELECT 
        r.id,
        r.commission_rate,
        r.expires_at
    INTO 
        v_referral_id,
        v_commission_rate,
        v_expires_at
    FROM referrals r
    JOIN order_items oi ON oi.id = p_order_item_id
    JOIN product_designs pd ON pd.id = oi.product_design_id
    WHERE r.referred_artist_id = pd.artist_id
    AND r.status = 'completed'
    AND r.expires_at > NOW();
    
    -- If no active referral, return 0
    IF v_referral_id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate commission (5% of sale)
    v_commission_amount := (p_sale_amount * v_commission_rate)::INTEGER;
    
    -- Insert referral earning record
    INSERT INTO referral_earnings (
        referral_id,
        order_item_id,
        sale_amount,
        commission_amount
    ) VALUES (
        v_referral_id,
        p_order_item_id,
        p_sale_amount,
        v_commission_amount
    )
    ON CONFLICT (order_item_id) DO UPDATE
    SET commission_amount = EXCLUDED.commission_amount;
    
    -- Update referral totals
    UPDATE referrals
    SET 
        total_sales_generated = total_sales_generated + p_sale_amount,
        total_commission_paid = total_commission_paid + v_commission_amount
    WHERE id = v_referral_id;
    
    RETURN v_commission_amount;
END;
$$ LANGUAGE plpgsql;

-- Add referral_code to profiles for tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);

-- Function to generate unique referral code for each user
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.referral_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT), 1, 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code();
