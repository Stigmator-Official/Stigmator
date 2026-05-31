-- ============================================
-- STIGMATOR: DEPOSIT RECOUP SYSTEM
-- Kickstarter-style artist investment recovery
-- ============================================

-- Add deposit tracking to product_designs
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS deposit_amount INTEGER DEFAULT 0; -- In cents
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS deposit_recoup_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS deposit_recoup_sales_target INTEGER DEFAULT 0; -- How many sales to recoup
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS deposit_recouped_sales_count INTEGER DEFAULT 0; -- Track progress
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS deposit_recouped_at TIMESTAMPTZ; -- When fully recouped

-- Track recoup payments per order
CREATE TABLE deposit_recoup_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_design_id UUID REFERENCES product_designs(id) NOT NULL,
    order_item_id UUID REFERENCES order_items(id) NOT NULL,
    
    -- How much went to recoup
    amount INTEGER NOT NULL, -- In cents
    
    -- Running totals
    cumulative_recouped INTEGER NOT NULL, -- Total recouped so far
    remaining_to_recoup INTEGER NOT NULL, -- What's left
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to calculate earnings with deposit recoup
CREATE OR REPLACE FUNCTION calculate_earnings_with_recoup(
    p_order_item_id UUID,
    p_sale_amount INTEGER
)
RETURNS TABLE (
    recipient_id UUID,
    recipient_type TEXT,
    amount INTEGER,
    earnings_type TEXT, -- 'deposit_recoup', 'normal_share', 'platform_fee'
    description TEXT
) AS $$
DECLARE
    v_product_design RECORD;
    v_remaining_after_platform INTEGER;
    v_recoup_amount INTEGER;
    v_normal_share_amount INTEGER;
    v_partnership RECORD;
    v_garment_design RECORD;
    v_total_parts INTEGER;
    v_design_remaining INTEGER;
BEGIN
    -- Get product design info
    SELECT * INTO v_product_design
    FROM product_designs
    WHERE id = (SELECT product_design_id FROM order_items WHERE id = p_order_item_id);
    
    -- Platform takes 15% first
    RETURN QUERY SELECT 
        NULL::UUID, 
        'platform'::TEXT, 
        (p_sale_amount * 0.15)::INTEGER,
        'platform_fee'::TEXT,
        'Stigmator platform fee (15%)'::TEXT;
    
    v_remaining_after_platform := (p_sale_amount * 0.70)::INTEGER;
    
    -- Check if deposit recoup is active
    IF v_product_design.deposit_recoup_enabled 
       AND v_product_design.deposit_recouped_sales_count < v_product_design.deposit_recoup_sales_target THEN
        
        -- Calculate how much can go to recoup this sale
        -- Give artist UP TO 100% of remaining until deposit recouped
        v_recoup_amount := LEAST(
            v_remaining_after_platform,
            v_product_design.deposit_amount - (
                SELECT COALESCE(SUM(amount), 0) 
                FROM deposit_recoup_payments 
                WHERE product_design_id = v_product_design.id
            )
        );
        
        IF v_recoup_amount > 0 THEN
            -- Pay artist the recoup amount
            RETURN QUERY SELECT 
                v_product_design.artist_id,
                'artist'::TEXT,
                v_recoup_amount,
                'deposit_recoup'::TEXT,
                'Deposit recoup payment'::TEXT;
            
            -- Record the recoup payment
            INSERT INTO deposit_recoup_payments (
                product_design_id,
                order_item_id,
                amount,
                cumulative_recouped,
                remaining_to_recoup
            ) VALUES (
                v_product_design.id,
                p_order_item_id,
                v_recoup_amount,
                (
                    SELECT COALESCE(SUM(amount), 0) + v_recoup_amount
                    FROM deposit_recoup_payments
                    WHERE product_design_id = v_product_design.id
                ),
                v_product_design.deposit_amount - (
                    SELECT COALESCE(SUM(amount), 0) + v_recoup_amount
                    FROM deposit_recoup_payments
                    WHERE product_design_id = v_product_design.id
                )
            );
            
            -- Update running count
            UPDATE product_designs 
            SET deposit_recouped_sales_count = deposit_recouped_sales_count + 1,
                deposit_recouped_at = CASE 
                    WHEN deposit_recouped_sales_count + 1 >= deposit_recoup_sales_target THEN NOW()
                    ELSE NULL
                END
            WHERE id = v_product_design.id;
            
            v_remaining_after_platform := v_remaining_after_platform - v_recoup_amount;
        END IF;
    END IF;
    
    -- If there's remaining amount, distribute to partnerships (normal split)
    IF v_remaining_after_platform > 0 THEN
        -- Check if this garment has multiple designs
        SELECT COUNT(*) INTO v_total_parts
        FROM garment_designs
        WHERE product_design_id = v_product_design.id;
        
        IF v_total_parts > 1 THEN
            -- Multi-design garment - split proportionally
            FOR v_garment_design IN 
                SELECT gd.*, dp.artist_id as design_artist_id
                FROM garment_designs gd
                JOIN designs d ON d.id = gd.design_id
                JOIN product_designs dp ON dp.design_id = d.id
                WHERE gd.product_design_id = v_product_design.id
            LOOP
                v_design_remaining := (v_remaining_after_platform * (v_garment_design.revenue_percentage / 100))::INTEGER;
                
                -- Get partnerships for this design
                FOR v_partnership IN 
                    SELECT dp.*, dp.artist_id as artist_user_id
                    FROM garment_design_partnerships gdp
                    JOIN design_partnerships dp ON dp.id = gdp.design_partnership_id
                    WHERE gdp.product_design_id = v_product_design.id
                    AND dp.design_id = v_garment_design.design_id
                LOOP
                    -- Artist gets their share
                    IF v_partnership.artist_share > 0 THEN
                        RETURN QUERY SELECT 
                            v_partnership.artist_user_id,
                            'artist'::TEXT,
                            (v_design_remaining * (v_partnership.artist_share / 100))::INTEGER,
                            'normal_share'::TEXT,
                            'Artist share of design revenue'::TEXT;
                    END IF;
                    
                    -- Client gets their share
                    IF v_partnership.client_share > 0 THEN
                        RETURN QUERY SELECT 
                            v_partnership.partner_id,
                            'client'::TEXT,
                            (v_design_remaining * (v_partnership.client_share / 100))::INTEGER,
                            'normal_share'::TEXT,
                            'Client partnership share'::TEXT;
                    END IF;
                    
                    -- Studio gets their share
                    IF v_partnership.studio_share > 0 AND v_partnership.studio_id IS NOT NULL THEN
                        RETURN QUERY SELECT 
                            v_partnership.studio_id,
                            'studio'::TEXT,
                            (v_design_remaining * (v_partnership.studio_share / 100))::INTEGER,
                            'normal_share'::TEXT,
                            'Studio partnership share'::TEXT;
                    END IF;
                END LOOP;
                
                -- No partnerships? Artist gets all
                IF NOT EXISTS (
                    SELECT 1 FROM garment_design_partnerships 
                    WHERE product_design_id = v_product_design.id
                    AND design_partnership_id IN (
                        SELECT id FROM design_partnerships WHERE design_id = v_garment_design.design_id
                    )
                ) THEN
                    RETURN QUERY SELECT 
                        v_garment_design.design_artist_id,
                        'artist'::TEXT,
                        v_design_remaining,
                        'normal_share'::TEXT,
                        'Artist full share (no partners)'::TEXT;
                END IF;
            END LOOP;
        ELSE
            -- Single design - check for partnerships
            FOR v_partnership IN 
                SELECT dp.*, dp.artist_id as artist_user_id
                FROM garment_design_partnerships gdp
                JOIN design_partnerships dp ON dp.id = gdp.design_partnership_id
                WHERE gdp.product_design_id = v_product_design.id
            LOOP
                -- Artist share
                IF v_partnership.artist_share > 0 THEN
                    RETURN QUERY SELECT 
                        v_partnership.artist_user_id,
                        'artist'::TEXT,
                        (v_remaining_after_platform * (v_partnership.artist_share / 100))::INTEGER,
                        'normal_share'::TEXT,
                        'Artist share'::TEXT;
                END IF;
                
                -- Client share
                IF v_partnership.client_share > 0 THEN
                    RETURN QUERY SELECT 
                        v_partnership.partner_id,
                        'client'::TEXT,
                        (v_remaining_after_platform * (v_partnership.client_share / 100))::INTEGER,
                        'normal_share'::TEXT,
                        'Client share'::TEXT;
                END IF;
                
                -- Studio share
                IF v_partnership.studio_share > 0 AND v_partnership.studio_id IS NOT NULL THEN
                    RETURN QUERY SELECT 
                        v_partnership.studio_id,
                        'studio'::TEXT,
                        (v_remaining_after_platform * (v_partnership.studio_share / 100))::INTEGER,
                        'normal_share'::TEXT,
                        'Studio share'::TEXT;
                END IF;
            END LOOP;
            
            -- No partnerships? Artist keeps all
            IF NOT EXISTS (
                SELECT 1 FROM garment_design_partnerships 
                WHERE product_design_id = v_product_design.id
            ) THEN
                RETURN QUERY SELECT 
                    v_product_design.artist_id,
                    'artist'::TEXT,
                    v_remaining_after_platform,
                    'normal_share'::TEXT,
                    'Artist full earnings (no partners)'::TEXT;
            END IF;
        END IF;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

-- View for artist dashboard showing recoup progress
CREATE VIEW artist_recoup_status WITH (security_invoker = true) AS
SELECT 
    pd.id as product_design_id,
    pd.design_id,
    d.title as design_title,
    pd.artist_id,
    pd.deposit_amount,
    pd.deposit_recoup_enabled,
    pd.deposit_recoup_sales_target,
    pd.deposit_recouped_sales_count,
    pd.deposit_recouped_at,
    CASE 
        WHEN pd.deposit_recoup_enabled THEN
            ROUND((pd.deposit_recouped_sales_count::NUMERIC / pd.deposit_recoup_sales_target) * 100, 1)
        ELSE NULL
    END as recoup_percentage,
    COALESCE(
        (SELECT SUM(amount) FROM deposit_recoup_payments WHERE product_design_id = pd.id),
        0
    ) as total_recouped_amount,
    pd.deposit_amount - COALESCE(
        (SELECT SUM(amount) FROM deposit_recoup_payments WHERE product_design_id = pd.id),
        0
    ) as remaining_to_recoup
FROM product_designs pd
JOIN designs d ON d.id = pd.design_id
WHERE pd.deposit_recoup_enabled = TRUE;

-- Indexes
CREATE INDEX idx_deposit_recoup_payments_design ON deposit_recoup_payments(product_design_id);
CREATE INDEX idx_product_designs_recoup ON product_designs(deposit_recoup_enabled, deposit_recouped_sales_count);
