-- Stigmator 3D Mockup System Schema
-- =================================
-- Database schema for managing mockup presets, rendered images,
-- design assets, and 3D garment models.

-- =============================================
-- 1. MOCKUP PRESETS - Saved mockup configurations
-- =============================================
CREATE TABLE mockup_presets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Identity
    name TEXT NOT NULL,
    description TEXT,
    tags TEXT[],
    
    -- Garment configuration
    garment_type TEXT NOT NULL CHECK (garment_type IN ('tshirt', 'hoodie', 'tank', 'longsleeve', 'sweatpants', 'shorts')),
    variant_id TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    fabric_type TEXT NOT NULL DEFAULT 'cotton',
    
    -- Design configuration
    design_file_id UUID REFERENCES storage.objects(id) ON DELETE SET NULL,
    design_transform JSONB DEFAULT '{"position": {"x": 0, "y": 0}, "scale": 1, "rotation": 0}',
    print_area TEXT DEFAULT 'chest',
    
    -- View configuration
    camera_angle JSONB DEFAULT '{"theta": 0, "phi": 1.57, "radius": 5}',
    lighting_preset TEXT DEFAULT 'studio',
    
    -- Rendered outputs
    thumbnail_url TEXT,
    preview_urls JSONB, -- { "front": "...", "back": "...", "angle": "..." }
    
    -- Metadata
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for mockup_presets
CREATE INDEX idx_mockup_presets_artist ON mockup_presets(artist_id);
CREATE INDEX idx_mockup_presets_garment ON mockup_presets(garment_type);
CREATE INDEX idx_mockup_presets_public ON mockup_presets(is_public) WHERE is_public = true;
CREATE INDEX idx_mockup_presets_tags ON mockup_presets USING gin(tags);

-- Comments
COMMENT ON TABLE mockup_presets IS 'Saved mockup configurations for artists';
COMMENT ON COLUMN mockup_presets.design_transform IS 'JSON containing position, scale, and rotation of design on garment';
COMMENT ON COLUMN mockup_presets.camera_angle IS 'Spherical coordinates: theta (azimuth), phi (elevation), radius';
COMMENT ON COLUMN mockup_presets.preview_urls IS 'Object with URLs for different rendered angles';

-- =============================================
-- 2. MOCKUP RENDERS - Individual rendered images
-- =============================================
CREATE TABLE mockup_renders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    preset_id UUID REFERENCES mockup_presets(id) ON DELETE CASCADE NOT NULL,
    
    -- Render specs
    angle TEXT NOT NULL, -- 'front', 'back', 'three-quarter-left', etc.
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('png', 'jpg', 'webp')),
    
    -- Storage
    storage_path TEXT NOT NULL, -- path in Supabase Storage
    public_url TEXT NOT NULL,
    file_size_bytes INTEGER,
    
    -- Metadata
    is_primary BOOLEAN DEFAULT false, -- primary image for shop listing
    generation_time_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for mockup_renders
CREATE INDEX idx_mockup_renders_preset ON mockup_renders(preset_id);
CREATE INDEX idx_mockup_renders_primary ON mockup_renders(preset_id, is_primary);
CREATE INDEX idx_mockup_renders_angle ON mockup_renders(angle);

-- Comments
COMMENT ON TABLE mockup_renders IS 'Individual rendered mockup images generated from presets';
COMMENT ON COLUMN mockup_renders.is_primary IS 'Designates the primary render for shop listings';

-- =============================================
-- 3. DESIGN FILES - Uploaded design assets
-- =============================================
CREATE TABLE design_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- File info
    original_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    
    -- Technical specs
    format TEXT NOT NULL CHECK (format IN ('png', 'jpg', 'webp')),
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    has_transparency BOOLEAN DEFAULT false,
    file_size_bytes INTEGER NOT NULL,
    
    -- Color analysis
    dominant_colors JSONB, -- [{ "hex": "...", "percent": 0.5 }]
    is_dark_design BOOLEAN, -- auto-detected
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for design_files
CREATE INDEX idx_design_files_artist ON design_files(artist_id);
CREATE INDEX idx_design_files_format ON design_files(format);

-- Comments
COMMENT ON TABLE design_files IS 'Uploaded design assets by artists';
COMMENT ON COLUMN design_files.dominant_colors IS 'Array of dominant colors with hex values and percentages';

-- =============================================
-- 4. GARMENT MODELS - 3D model assets
-- =============================================
CREATE TABLE garment_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Model info
    type TEXT NOT NULL CHECK (type IN ('tshirt', 'hoodie', 'tank', 'longsleeve', 'sweatpants', 'shorts')),
    variant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    
    -- Storage
    model_url TEXT NOT NULL, -- GLTF/GLB file
    texture_url TEXT, -- Optional texture atlas
    
    -- Technical specs
    polygon_count INTEGER,
    has_lods BOOLEAN DEFAULT false, -- Level of Detail variants
    file_size_bytes INTEGER,
    
    -- UV mapping data
    uv_regions JSONB, -- { "chest": { "u": [0.2, 0.8], "v": [0.3, 0.7] }, ... }
    print_areas JSONB, -- Valid print area definitions
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for garment_models
CREATE INDEX idx_garment_models_type ON garment_models(type);
CREATE INDEX idx_garment_models_active ON garment_models(is_active) WHERE is_active = true;
CREATE INDEX idx_garment_models_type_variant ON garment_models(type, variant_id);

-- Unique constraint to prevent duplicate variants
CREATE UNIQUE INDEX idx_garment_models_unique_variant 
    ON garment_models(type, variant_id) 
    WHERE is_active = true;

-- Comments
COMMENT ON TABLE garment_models IS '3D garment model assets for mockup rendering';
COMMENT ON COLUMN garment_models.uv_regions IS 'UV coordinate regions for different garment areas';
COMMENT ON COLUMN garment_models.print_areas IS 'Valid print area definitions for design placement';
COMMENT ON COLUMN garment_models.has_lods IS 'Whether model has Level of Detail variants for performance';

-- =============================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE mockup_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mockup_renders ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE garment_models ENABLE ROW LEVEL SECURITY;

-- Artists can CRUD their own presets
CREATE POLICY "Artists can manage own presets" ON mockup_presets
    FOR ALL USING (artist_id = auth.uid());

-- Public presets are readable by all
CREATE POLICY "Public presets are readable" ON mockup_presets
    FOR SELECT USING (is_public = true);

-- Artists can manage own design files
CREATE POLICY "Artists can manage own designs" ON design_files
    FOR ALL USING (artist_id = auth.uid());

-- Renders inherit preset permissions
CREATE POLICY "Renders follow preset permissions" ON mockup_renders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mockup_presets 
            WHERE mockup_presets.id = mockup_renders.preset_id
            AND (mockup_presets.artist_id = auth.uid() OR mockup_presets.is_public = true)
        )
    );

-- Artists can manage renders of their own presets
CREATE POLICY "Artists can manage own renders" ON mockup_renders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM mockup_presets 
            WHERE mockup_presets.id = mockup_renders.preset_id
            AND mockup_presets.artist_id = auth.uid()
        )
    );

-- Models are readable by all authenticated users
CREATE POLICY "Models readable by authenticated" ON garment_models
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify garment models (requires admin role check)
CREATE POLICY "Only admins can modify models" ON garment_models
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- =============================================
-- 6. FUNCTIONS & TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mockup_presets_updated_at
    BEFORE UPDATE ON mockup_presets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment usage count when preset is used
CREATE OR REPLACE FUNCTION increment_preset_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE mockup_presets 
    SET usage_count = usage_count + 1, last_used_at = now()
    WHERE id = NEW.preset_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_render_created
    AFTER INSERT ON mockup_renders
    FOR EACH ROW EXECUTE FUNCTION increment_preset_usage();

-- Increment design file usage
CREATE OR REPLACE FUNCTION increment_design_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE design_files 
    SET usage_count = usage_count + 1, last_used_at = now()
    WHERE id = NEW.design_file_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_preset_uses_design
    AFTER INSERT OR UPDATE OF design_file_id ON mockup_presets
    FOR EACH ROW 
    WHEN (NEW.design_file_id IS NOT NULL)
    EXECUTE FUNCTION increment_design_usage();

-- Get artist's preset stats
CREATE OR REPLACE FUNCTION get_artist_mockup_stats(artist_uuid UUID)
RETURNS TABLE (
    total_presets BIGINT,
    total_renders BIGINT,
    public_presets BIGINT,
    most_used_preset TEXT,
    storage_used_bytes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT mp.id) as total_presets,
        COUNT(DISTINCT mr.id) as total_renders,
        COUNT(DISTINCT mp.id) FILTER (WHERE mp.is_public) as public_presets,
        (SELECT name FROM mockup_presets WHERE artist_id = artist_uuid ORDER BY usage_count DESC LIMIT 1) as most_used_preset,
        COALESCE(SUM(df.file_size_bytes), 0) + COALESCE(SUM(mr.file_size_bytes), 0) as storage_used_bytes
    FROM mockup_presets mp
    LEFT JOIN mockup_renders mr ON mr.preset_id = mp.id
    LEFT JOIN design_files df ON df.artist_id = mp.artist_id
    WHERE mp.artist_id = artist_uuid;
END;
$$ LANGUAGE plpgsql;

-- Search presets by name or tags
CREATE OR REPLACE FUNCTION search_mockup_presets(
    search_query TEXT,
    garment_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    garment_type TEXT,
    is_public BOOLEAN,
    artist_id UUID,
    rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.id,
        mp.name,
        mp.description,
        mp.garment_type,
        mp.is_public,
        mp.artist_id,
        ts_rank(
            to_tsvector('english', coalesce(mp.name, '') || ' ' || coalesce(mp.description, '') || ' ' || coalesce(array_to_string(mp.tags, ' '), '')),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM mockup_presets mp
    WHERE (
        to_tsvector('english', coalesce(mp.name, '') || ' ' || coalesce(mp.description, '') || ' ' || coalesce(array_to_string(mp.tags, ' '), ''))
        @@ plainto_tsquery('english', search_query)
        OR mp.name ILIKE '%' || search_query || '%'
    )
    AND (garment_filter IS NULL OR mp.garment_type = garment_filter)
    AND (mp.is_public = true OR mp.artist_id = auth.uid())
    ORDER BY rank DESC, mp.usage_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. STORAGE BUCKETS CONFIGURATION
-- =============================================

/*
Create the following storage buckets via Supabase dashboard or API:

1. designs
   - Purpose: Artist uploaded design files
   - Public: false (access via RLS)
   - File types: .png, .jpg, .webp
   - Max size: 10MB

2. mockups
   - Purpose: Rendered mockup images
   - Public: true (for shop listings)
   - File types: .png, .jpg, .webp
   - Max size: 5MB

3. garment-models
   - Purpose: 3D model files (GLTF/GLB)
   - Public: true (needed for 3D viewer)
   - File types: .gltf, .glb, .bin
   - Max size: 50MB

4. texture-atlases
   - Purpose: Generated texture atlases
   - Public: true (needed for rendering)
   - File types: .png, .jpg, .webp
   - Max size: 20MB

Storage RLS Policies:
---------------------

Bucket: designs
- INSERT: Artists can upload to their own folder (artist_id/*)
- SELECT: Artists can read their own files, public files readable by all
- DELETE: Artists can delete their own files
- UPDATE: Artists can update their own files

Bucket: mockups
- INSERT: System/Artists can upload (organized by artist_id/preset_id/)
- SELECT: Public mockups readable by all, private by owner only
- DELETE: Artists can delete their own mockups

Bucket: garment-models
- INSERT: Admin only
- SELECT: All authenticated users
- DELETE/UPDATE: Admin only

Bucket: texture-atlases
- INSERT: Admin only
- SELECT: All authenticated users
- DELETE/UPDATE: Admin only
*/

-- =============================================
-- 8. SEED DATA (Optional)
-- =============================================

-- Insert default garment models (run after creating the table)
/*
INSERT INTO garment_models (type, variant_id, name, model_url, uv_regions, print_areas) VALUES
('tshirt', 'classic-crew', 'Classic Crew Neck T-Shirt', 'garment-models/tshirt-classic.glb', 
 '{"chest": {"u": [0.25, 0.75], "v": [0.35, 0.75]}, "back": {"u": [0.25, 0.75], "v": [0.25, 0.65]}}',
 '["chest", "back", "left-sleeve", "right-sleeve"]'),
 
('hoodie', 'pullover', 'Pullover Hoodie', 'garment-models/hoodie-pullover.glb',
 '{"chest": {"u": [0.2, 0.8], "v": [0.3, 0.8]}, "back": {"u": [0.2, 0.8], "v": [0.2, 0.7]}}',
 '["chest", "back", "left-sleeve", "right-sleeve", "hood"]'),
 
('tank', 'muscle', 'Muscle Tank Top', 'garment-models/tank-muscle.glb',
 '{"chest": {"u": [0.25, 0.75], "v": [0.35, 0.75]}}',
 '["chest", "back"]'),
 
('longsleeve', 'classic', 'Long Sleeve T-Shirt', 'garment-models/longsleeve-classic.glb',
 '{"chest": {"u": [0.25, 0.75], "v": [0.35, 0.75]}, "left-sleeve": {"u": [0, 0.25], "v": [0.3, 0.8]}, "right-sleeve": {"u": [0.75, 1], "v": [0.3, 0.8]}}',
 '["chest", "back", "left-sleeve", "right-sleeve"]');
*/
