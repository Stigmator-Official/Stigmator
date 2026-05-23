-- ============================================
-- STIGMATOR: MANUFACTURING WORKFLOW
-- Complete garment production system
-- ============================================

-- Garment Production Status
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS production_status TEXT DEFAULT 'draft' 
  CHECK (production_status IN ('draft', 'deposit_paid', 'pending_manufacturer', 'manufacturer_review', 'approved', 'in_production', 'sample_created', 'live', 'paused', 'sold_out', 'archived'));

-- Manufacturer Assignment
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS manufacturer_id UUID REFERENCES fulfillment_partners(id);
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS manufacturer_assigned_at TIMESTAMPTZ;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS manufacturer_approved_at TIMESTAMPTZ;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS manufacturer_declined_at TIMESTAMPTZ;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS manufacturer_decline_reason TEXT;

-- Manufacturing Attempts (track if multiple manufacturers needed)
CREATE TABLE manufacturing_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_design_id UUID REFERENCES product_designs(id) NOT NULL,
    manufacturer_id UUID REFERENCES fulfillment_partners(id) NOT NULL,
    
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'declined', 'withdrawn')),
    decline_reason TEXT,
    
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mockup Delivery Options
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS mockup_delivery_method TEXT DEFAULT 'digital' 
  CHECK (mockup_delivery_method IN ('digital', 'physical'));
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS mockup_shipping_address JSONB; -- If physical
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS mockup_shipping_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS mockup_shipped_at TIMESTAMPTZ;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS mockup_tracking_number TEXT;

-- Artist Pricing Control
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS artist_retail_price INTEGER; -- In cents, artist sets this
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS suggested_retail_price INTEGER; -- Platform suggestion
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS manufacturing_cost INTEGER; -- From manufacturer quote
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS platform_fee_amount INTEGER; -- Calculated (15%)
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS artist_profit_per_unit INTEGER; -- Calculated

-- Batch/Limited Run Settings
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS is_limited_run BOOLEAN DEFAULT FALSE;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS max_units INTEGER; -- NULL = unlimited
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS units_sold INTEGER DEFAULT 0;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS units_reserved INTEGER DEFAULT 0; -- For bulk artist purchase

-- Bulk Purchase by Artist
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS artist_bulk_purchase_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS artist_bulk_quantity INTEGER; -- How many units artist wants
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS artist_bulk_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS artist_bulk_shipped BOOLEAN DEFAULT FALSE;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS artist_bulk_tracking TEXT;

-- Pre-orders / Campaign Mode
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS is_campaign_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS campaign_min_units INTEGER DEFAULT 10; -- Minimum to produce
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS campaign_ends_at TIMESTAMPTZ;
ALTER TABLE product_designs ADD COLUMN IF NOT EXISTS campaign_success_threshold INTEGER; -- Auto-succeed at X orders

-- Production Queue (for batching)
CREATE TABLE production_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_design_id UUID REFERENCES product_designs(id) NOT NULL,
    manufacturer_id UUID REFERENCES fulfillment_partners(id) NOT NULL,
    
    status TEXT NOT NULL CHECK (status IN ('queued', 'in_production', 'quality_check', 'completed', 'shipped')),
    
    quantity INTEGER NOT NULL,
    priority INTEGER DEFAULT 0, -- Higher = sooner
    
    estimated_start TIMESTAMPTZ;
    estimated_completion TIMESTAMPTZ;
    actual_start TIMESTAMPTZ;
    actual_completion TIMESTAMPTZ;
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manufacturing Quotes (for pricing transparency)
CREATE TABLE manufacturing_quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_design_id UUID REFERENCES product_designs(id) NOT NULL,
    manufacturer_id UUID REFERENCES fulfillment_partners(id) NOT NULL,
    
    cost_per_unit INTEGER NOT NULL, -- In cents
    min_order_quantity INTEGER DEFAULT 1,
    setup_fee INTEGER DEFAULT 0,
    shipping_estimate INTEGER, -- To customer
    turnaround_days INTEGER,
    
    is_accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMPTZ;
    
    valid_until TIMESTAMPTZ;
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Functions

-- Calculate pricing breakdown
CREATE OR REPLACE FUNCTION calculate_garment_pricing(
    p_manufacturing_cost INTEGER,
    p_desired_retail INTEGER DEFAULT NULL,
    p_platform_fee_percent DECIMAL DEFAULT 15
)
RETURNS TABLE (
    manufacturing_cost INTEGER,
    platform_fee INTEGER,
    remaining INTEGER,
    artist_retail INTEGER,
    artist_profit INTEGER
) AS $$
DECLARE
    v_platform_fee INTEGER;
    v_remaining INTEGER;
    v_retail INTEGER;
BEGIN
    -- If artist sets retail price
    IF p_desired_retail IS NOT NULL THEN
        v_retail := p_desired_retail;
    ELSE
        -- Suggest retail: cost × 3 (standard retail markup)
        v_retail := CEIL(p_manufacturing_cost * 3 / 100) * 100;
    END IF;
    
    v_platform_fee := (v_retail * (p_platform_fee_percent / 100))::INTEGER;
    v_remaining := v_retail - v_platform_fee;
    
    RETURN QUERY SELECT 
        p_manufacturing_cost,
        v_platform_fee,
        v_remaining,
        v_retail,
        v_remaining - p_manufacturing_cost;
END;
$$ LANGUAGE plpgsql;

-- Check if can go live
CREATE OR REPLACE FUNCTION can_garment_go_live(p_product_design_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_status TEXT;
    v_manufacturer_approved BOOLEAN;
    v_sample_approved BOOLEAN;
    v_quote_accepted BOOLEAN;
BEGIN
    SELECT production_status INTO v_status
    FROM product_designs WHERE id = p_product_design_id;
    
    -- Must be approved by manufacturer
    SELECT EXISTS(
        SELECT 1 FROM manufacturing_attempts 
        WHERE product_design_id = p_product_design_id 
        AND status = 'approved'
    ) INTO v_manufacturer_approved;
    
    -- Must have accepted quote
    SELECT EXISTS(
        SELECT 1 FROM manufacturing_quotes 
        WHERE product_design_id = p_product_design_id 
        AND is_accepted = TRUE
    ) INTO v_quote_accepted;
    
    RETURN v_manufacturer_approved AND v_quote_accepted;
END;
$$ LANGUAGE plpgsql;

-- Update production status
CREATE OR REPLACE FUNCTION update_production_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    
    -- If manufacturer approved and quote accepted, can go live
    IF NEW.manufacturer_approved_at IS NOT NULL AND 
       EXISTS(SELECT 1 FROM manufacturing_quotes WHERE product_design_id = NEW.id AND is_accepted = TRUE) THEN
        NEW.production_status := 'approved';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prod_status BEFORE UPDATE ON product_designs
    FOR EACH ROW EXECUTE FUNCTION update_production_status();

-- Indexes
CREATE INDEX idx_manufacturing_attempts_product ON manufacturing_attempts(product_design_id);
CREATE INDEX idx_manufacturing_quotes_product ON manufacturing_quotes(product_design_id);
CREATE INDEX idx_production_queue_status ON production_queue(status);
CREATE INDEX idx_product_designs_status ON product_designs(production_status);

-- RLS Policies
ALTER TABLE manufacturing_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturing_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_queue ENABLE ROW LEVEL SECURITY;

-- Artists can view their manufacturing data
CREATE POLICY "Artists view their manufacturing" ON manufacturing_attempts
    FOR SELECT USING (EXISTS(SELECT 1 FROM product_designs pd WHERE pd.id = product_design_id AND pd.artist_id = auth.uid()));

-- Manufacturers can view their assigned work
CREATE POLICY "Manufacturers view their assignments" ON manufacturing_attempts
    FOR ALL USING (manufacturer_id IN (SELECT id FROM fulfillment_partners WHERE profile_id = auth.uid()));
