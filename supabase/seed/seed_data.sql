-- STIGMATOR Seed Data
-- Comprehensive test data for development

-- Note: This seed assumes auth.users already exist via Supabase Auth
-- Run this after creating users through Supabase Auth UI or API

-- ============================================
-- SYSTEM CONFIGURATION
-- ============================================

INSERT INTO public.system_config (key, value) VALUES
('platform_fee_percentage', '{"value": 15}'),
('default_artist_share', '{"value": 50}'),
('default_partner_share', '{"value": 20}'),
('default_studio_share', '{"value": 10}'),
('minimum_payout_amount', '{"value": 1000}'),
('payout_schedule', '{"type": "weekly", "day": "monday"}'),
('competition_votes_per_user', '{"value": 3}'),
('code_expiration_days', '{"value": 30}')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- STUDIOS (Verified)
-- ============================================

INSERT INTO public.studios (id, slug, name, description, city, state, country, verification_status, verified_at) VALUES
('11111111-1111-1111-1111-111111111111', 'black-needle-tattoo', 'Black Needle Tattoo', 'Premier tattoo studio specializing in traditional and neo-traditional styles.', 'Los Angeles', 'CA', 'USA', 'APPROVED', NOW()),
('22222222-2222-2222-2222-222222222222', 'ink-society', 'Ink Society', 'Modern tattoo collective featuring award-winning artists.', 'New York', 'NY', 'USA', 'APPROVED', NOW()),
('33333333-3333-3333-3333-333333333333', 'sacred-mark', 'Sacred Mark Studio', 'Specializing in Japanese irezumi and geometric blackwork.', 'Austin', 'TX', 'USA', 'APPROVED', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- USERS & ARTIST PROFILES
-- ============================================

-- Note: Replace these UUIDs with actual auth.users UUIDs after creating them
-- These are placeholder UUIDs for demonstration

-- Founding Artists (already have auth accounts)
INSERT INTO public.users (id, email, full_name, display_name, role, is_verified, verification_status, location, instagram_handle) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alex@stigmator.dev', 'Alex Chen', 'ALEX_CHEN', 'ARTIST', true, 'APPROVED', 'Los Angeles, CA', '@alex_chen_ink'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sarah@stigmator.dev', 'Sarah Martinez', 'SARAH_MARTINEZ', 'ARTIST', true, 'APPROVED', 'New York, NY', '@sarahm_artist'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'jordan@stigmator.dev', 'Jordan Blake', 'JORDAN_BLAKE', 'ARTIST', true, 'APPROVED', 'Austin, TX', '@jordanblaketattoo'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'morgan@stigmator.dev', 'Morgan Lee', 'MORGAN_LEE', 'ARTIST', true, 'APPROVED', 'Portland, OR', '@morganleecreates'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'casey@stigmator.dev', 'Casey Rivers', 'CASEY_RIVERS', 'ARTIST', true, 'APPROVED', 'Miami, FL', '@caseyriversart')
ON CONFLICT (id) DO NOTHING;

-- Artist Profiles
INSERT INTO public.artist_profiles (user_id, years_experience, specialties, portfolio_url, total_designs, total_sales, rating, review_count, default_splits) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 8, ARRAY['Traditional', 'Neo-Traditional', 'Japanese'], 'https://alexchen.art', 24, 156, 4.9, 42, '{"artist": 50, "partner": 20, "studio": 10}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 12, ARRAY['Blackwork', 'Geometric', 'Dotwork'], 'https://sarahmartinez.ink', 31, 203, 4.8, 58, '{"artist": 55, "partner": 15, "studio": 10}'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 6, ARRAY['Watercolor', 'Illustrative', 'Fine Line'], 'https://jordanblake.art', 18, 89, 4.7, 23, '{"artist": 45, "partner": 25, "studio": 10}'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 10, ARRAY['Realism', 'Portrait', 'Black & Grey'], 'https://morganlee.creates', 27, 134, 4.9, 36, '{"artist": 50, "partner": 20, "studio": 10}'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, ARRAY['New School', 'Cartoon', 'Color Bomb'], 'https://caseyrivers.art', 15, 67, 4.6, 19, '{"artist": 50, "partner": 20, "studio": 10}')
ON CONFLICT (user_id) DO NOTHING;

-- Studio Memberships
INSERT INTO public.studio_members (studio_id, user_id, role) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'OWNER'),
('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ARTIST'),
('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ARTIST'),
('11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ARTIST')
ON CONFLICT DO NOTHING;

-- Sample Customers
INSERT INTO public.users (id, email, full_name, display_name, role, is_verified) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'customer1@example.com', 'John Smith', 'JOHN_SMITH', 'CUSTOMER', true),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'customer2@example.com', 'Emma Wilson', 'EMMA_WILSON', 'CUSTOMER', true),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'customer3@example.com', 'Michael Brown', 'MICHAEL_BROWN', 'CUSTOMER', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DESIGNS
-- ============================================

INSERT INTO public.designs (id, artist_id, title, description, original_file, preview_image, thumbnail_image, status, category, tags, published_at) VALUES
-- Alex Chen designs
('d1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Serpent Coil', 'Traditional Japanese snake design with cherry blossoms', 'https://cdn.stigmator.dev/designs/serpent-original.png', 'https://cdn.stigmator.dev/designs/serpent-preview.png', 'https://cdn.stigmator.dev/designs/serpent-thumb.png', 'PUBLISHED', 'Japanese', ARRAY['snake', 'traditional', 'japanese', 'cherry blossom'], NOW()),
('d1111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dragon Guardian', 'Fierce dragon protecting sacred pearl', 'https://cdn.stigmator.dev/designs/dragon-original.png', 'https://cdn.stigmator.dev/designs/dragon-preview.png', 'https://cdn.stigmator.dev/designs/dragon-thumb.png', 'PUBLISHED', 'Japanese', ARRAY['dragon', 'traditional', 'japanese', 'mythical'], NOW()),
('d1111111-1111-1111-1111-111111111113', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Oni Mask', 'Traditional Japanese demon mask with waves', 'https://cdn.stigmator.dev/designs/oni-original.png', 'https://cdn.stigmator.dev/designs/oni-preview.png', 'https://cdn.stigmator.dev/designs/oni-thumb.png', 'PUBLISHED', 'Japanese', ARRAY['oni', 'mask', 'traditional', 'waves'], NOW()),

-- Sarah Martinez designs
('d2222222-2222-2222-2222-222222222221', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sacred Geometry', 'Intricate mandala with sacred geometric patterns', 'https://cdn.stigmator.dev/designs/mandala-original.png', 'https://cdn.stigmator.dev/designs/mandala-preview.png', 'https://cdn.stigmator.dev/designs/mandala-thumb.png', 'PUBLISHED', 'Geometric', ARRAY['mandala', 'geometric', 'sacred', 'blackwork'], NOW()),
('d2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dotwork Compass', 'Nautical compass in dotwork style', 'https://cdn.stigmator.dev/designs/compass-original.png', 'https://cdn.stigmator.dev/designs/compass-preview.png', 'https://cdn.stigmator.dev/designs/compass-thumb.png', 'PUBLISHED', 'Dotwork', ARRAY['compass', 'nautical', 'dotwork', 'geometric'], NOW()),
('d2222222-2222-2222-2222-222222222223', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Wolf Spirit', 'Geometric wolf head with moon phases', 'https://cdn.stigmator.dev/designs/wolf-original.png', 'https://cdn.stigmator.dev/designs/wolf-preview.png', 'https://cdn.stigmator.dev/designs/wolf-thumb.png', 'PUBLISHED', 'Geometric', ARRAY['wolf', 'animal', 'geometric', 'moon'], NOW()),

-- Jordan Blake designs
('d3333333-3333-3333-3333-333333333331', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Watercolor Phoenix', 'Rising phoenix in vibrant watercolor style', 'https://cdn.stigmator.dev/designs/phoenix-original.png', 'https://cdn.stigmator.dev/designs/phoenix-preview.png', 'https://cdn.stigmator.dev/designs/phoenix-thumb.png', 'PUBLISHED', 'Watercolor', ARRAY['phoenix', 'watercolor', 'colorful', 'bird'], NOW()),
('d3333333-3333-3333-3333-333333333332', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Floral Sleeve', 'Botanical illustration style flower arrangement', 'https://cdn.stigmator.dev/designs/floral-original.png', 'https://cdn.stigmator.dev/designs/floral-preview.png', 'https://cdn.stigmator.dev/designs/floral-thumb.png', 'PUBLISHED', 'Illustrative', ARRAY['flowers', 'botanical', 'colorful', 'nature'], NOW()),

-- Morgan Lee designs
('d4444444-4444-4444-4444-444444444441', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Portrait Study', 'Realistic portrait style face', 'https://cdn.stigmator.dev/designs/portrait-original.png', 'https://cdn.stigmator.dev/designs/portrait-preview.png', 'https://cdn.stigmator.dev/designs/portrait-thumb.png', 'PUBLISHED', 'Realism', ARRAY['portrait', 'realism', 'black and grey', 'face'], NOW()),
('d4444444-4444-4444-4444-444444444442', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Tiger Eye', 'Hyper-realistic tiger eye closeup', 'https://cdn.stigmator.dev/designs/tiger-original.png', 'https://cdn.stigmator.dev/designs/tiger-preview.png', 'https://cdn.stigmator.dev/designs/tiger-thumb.png', 'PUBLISHED', 'Realism', ARRAY['tiger', 'animal', 'realism', 'eye'], NOW()),

-- Casey Rivers designs
('d5555555-5555-5555-5555-555555555551', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cartoon Bomb', 'New school style cartoon bomb character', 'https://cdn.stigmator.dev/designs/bomb-original.png', 'https://cdn.stigmator.dev/designs/bomb-preview.png', 'https://cdn.stigmator.dev/designs/bomb-thumb.png', 'PUBLISHED', 'New School', ARRAY['cartoon', 'new school', 'colorful', 'character'], NOW()),
('d5555555-5555-5555-5555-555555555552', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Graffiti Lettering', 'Wildstyle graffiti alphabet piece', 'https://cdn.stigmator.dev/designs/graffiti-original.png', 'https://cdn.stigmator.dev/designs/graffiti-preview.png', 'https://cdn.stigmator.dev/designs/graffiti-thumb.png', 'PUBLISHED', 'New School', ARRAY['graffiti', 'lettering', 'urban', 'colorful'], NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRODUCTS
-- ============================================

INSERT INTO public.products (id, artist_id, studio_id, name, description, garment_type, status, base_price, cost_to_produce, deposit_amount, total_sales, total_revenue, freshness_score, last_sale_at, published_at) VALUES
-- Alex Chen products
('p1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Serpent Long Sleeve', 'Traditional Japanese serpent on premium long sleeve', 'LONG_SLEEVE', 'ACTIVE', 6500, 2200, 5000, 47, 305500, 95, NOW() - INTERVAL '2 hours', NOW()),
('p1111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Dragon Hoodie', 'Fierce dragon design on heavyweight hoodie', 'HOODIE', 'ACTIVE', 8500, 3200, 5000, 38, 323000, 88, NOW() - INTERVAL '1 day', NOW()),
('p1111111-1111-1111-1111-111111111113', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, 'Oni Mask Tee', 'Classic oni mask on premium cotton', 'TSHIRT', 'ACTIVE', 4500, 1500, 5000, 52, 234000, 92, NOW() - INTERVAL '3 hours', NOW()),

-- Sarah Martinez products
('p2222222-2222-2222-2222-222222222221', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'Sacred Geometry Hoodie', 'Intricate mandala on black hoodie', 'HOODIE', 'ACTIVE', 8000, 3000, 5000, 29, 232000, 76, NOW() - INTERVAL '2 days', NOW()),
('p2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'Compass Tee', 'Nautical compass on vintage white tee', 'TSHIRT', 'ACTIVE', 4200, 1400, 5000, 63, 264600, 89, NOW() - INTERVAL '1 hour', NOW()),

-- Jordan Blake products
('p3333333-3333-3333-3333-333333333331', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Phoenix Rising Tee', 'Watercolor phoenix splash design', 'TSHIRT', 'ACTIVE', 4800, 1600, 5000, 34, 163200, 82, NOW() - INTERVAL '12 hours', NOW()),
('p3333333-3333-3333-3333-333333333332', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Floral Tank', 'Botanical illustration tank top', 'TANK_TOP', 'ACTIVE', 3800, 1200, 5000, 22, 83600, 68, NOW() - INTERVAL '3 days', NOW()),

-- Morgan Lee products
('p4444444-4444-4444-4444-444444444441', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Portrait Crewneck', 'Realistic portrait study on crewneck', 'CREWNECK', 'ACTIVE', 5500, 2000, 5000, 19, 104500, 64, NOW() - INTERVAL '4 days', NOW()),
('p4444444-4444-4444-4444-444444444442', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, 'Tiger Eye Tee', 'Hyper-realistic tiger eye closeup', 'TSHIRT', 'ACTIVE', 5200, 1700, 5000, 27, 140400, 71, NOW() - INTERVAL '2 days', NOW()),

-- Casey Rivers products
('p5555555-5555-5555-5555-555555555551', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, 'Cartoon Bomb Tee', 'New school cartoon character design', 'TSHIRT', 'ACTIVE', 4500, 1500, 5000, 15, 67500, 58, NOW() - INTERVAL '5 days', NOW()),
('p5555555-5555-5555-5555-555555555552', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, 'Graffiti Long Sleeve', 'Wildstyle graffiti on long sleeve', 'LONG_SLEEVE', 'ACTIVE', 6200, 2100, 5000, 21, 130200, 67, NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRODUCT DESIGNS (Junction)
-- ============================================

INSERT INTO public.product_designs (id, product_id, design_id, position_x, position_y, scale, rotation, revenue_share, mockup_image) VALUES
('pd111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 0, 0, 1, 0, 100, 'https://cdn.stigmator.dev/mockups/serpent-ls.png'),
('pd111111-1111-1111-1111-111111111112', 'p1111111-1111-1111-1111-111111111112', 'd1111111-1111-1111-1111-111111111112', 0, 0, 1, 0, 100, 'https://cdn.stigmator.dev/mockups/dragon-hoodie.png'),
('pd111111-1111-1111-1111-111111111113', 'p1111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111113', 0, 0, 1, 0, 100, 'https://cdn.stigmator.dev/mockups/oni-tee.png'),
('pd222222-2222-2222-2222-222222222221', 'p2222222-2222-2222-2222-222222222221', 'd2222222-2222-2222-2222-222222222221', 0, 0, 1, 0, 100, 'https://cdn.stigmator.dev/mockups/mandala-hoodie.png'),
('pd222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 0, 0, 1, 0, 100, 'https://cdn.stigmator.dev/mockups/compass-tee.png'),
('pd333333-3333-3333-3333-333333333331', 'p3333333-3333-3333-3333-333333333331', 'd3333333-3333-3333-3333-333333333331', 0, 0, 1, 0, 100, 'https://cdn.stigmator.dev/mockups/phoenix-tee.png'),
('pd333333-3333-3333-3333-333333333332', 'p3333333-3333-3333-3333-333333333332', 'd3333333-3333-3333-3333-333333333332', 0, 0, 1, 0, 100, 'https://cdn.stigmator.dev/mockups/floral-tank.png'),
('pd444444-4444-4444-4444-444444444441', 'p4444444-4444-4444-4444-444444444441', 'd4444444-4444-4444-4444-444444444441', 0, 0, 1, 0, 100, 'https://cdn.stigmator.dev/mockups/portrait-crew.png'),
('pd444444-4444-4444-4444-444444444442', 'p4444444-4444-4444-4444-444444444442', 'd4444444-4444-4444-4444-444444444442', 0, 0, 1, 0, 100, 'https://cdn.stigmator.dev/mockups/tiger-tee.png'),
('pd555555-5555-5555-5555-555555555551', 'p5555555-5555-5555-5555-555555555551', 'd5555555-5555-5555-5555-555555555551', 0, 0, 1, 0, 100, 'https://cdn.stigmator.dev/mockups/bomb-tee.png'),
('pd555555-5555-5555-5555-555555555552', 'p5555555-5555-5555-5555-555555555552', 'd5555555-5555-5555-5555-555555555552', 0, 0, 1, 0, 100, 'https://cdn.stigmator.dev/mockups/graffiti-ls.png')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PARTNERSHIP CODES (Sample active codes)
-- ============================================

INSERT INTO public.partnership_codes (id, code, artist_id, design_id, artist_share, partner_share, studio_share, status, expires_at, created_at) VALUES
('pc111111-1111-1111-1111-111111111111', 'INK-ALEX-2025-X7K9', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'd1111111-1111-1111-1111-111111111111', 50, 20, 10, 'GENERATED', NOW() + INTERVAL '30 days', NOW()),
('pc222222-2222-2222-2222-222222222222', 'INK-SARAH-2025-M3P8', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'd2222222-2222-2222-2222-222222222221', 55, 15, 10, 'GENERATED', NOW() + INTERVAL '30 days', NOW()),
('pc333333-3333-3333-3333-333333333333', 'INK-JORDAN-2025-Q2R5', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'd3333333-3333-3333-3333-333333333331', 45, 25, 10, 'GENERATED', NOW() + INTERVAL '30 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE ORDERS
-- ============================================

INSERT INTO public.orders (id, customer_id, customer_email, customer_name, status, subtotal, tax_amount, shipping_amount, total, stripe_payment_intent_id, created_at, paid_at) VALUES
('o1111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'customer1@example.com', 'John Smith', 'DELIVERED', 12700, 1050, 800, 14550, 'pi_sample_001', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('o1111111-1111-1111-1111-111111111112', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'customer2@example.com', 'Emma Wilson', 'SHIPPED', 8500, 700, 800, 10000, 'pi_sample_002', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('o1111111-1111-1111-1111-111111111113', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'customer3@example.com', 'Michael Brown', 'PAYMENT_RECEIVED', 4500, 350, 800, 5650, 'pi_sample_003', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (id, order_id, product_id, product_name, design_title, artist_name, artist_id, mockup_image, size, color, unit_price, quantity, total, has_partnership) VALUES
('oi111111-1111-1111-1111-111111111111', 'o1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Serpent Long Sleeve', 'Serpent Coil', 'Alex Chen', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://cdn.stigmator.dev/mockups/serpent-ls.png', 'L', 'Black', 6500, 1, 6500, false),
('oi111111-1111-1111-1111-111111111112', 'o1111111-1111-1111-1111-111111111111', 'p2222222-2222-2222-2222-222222222222', 'Compass Tee', 'Dotwork Compass', 'Sarah Martinez', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://cdn.stigmator.dev/mockups/compass-tee.png', 'M', 'White', 4200, 1, 4200, false),
('oi222222-2222-2222-2222-222222222221', 'o1111111-1111-1111-1111-111111111112', 'p1111111-1111-1111-1111-111111111112', 'Dragon Hoodie', 'Dragon Guardian', 'Alex Chen', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://cdn.stigmator.dev/mockups/dragon-hoodie.png', 'XL', 'Black', 8500, 1, 8500, false),
('oi333333-3333-3333-3333-333333333331', 'o1111111-1111-1111-1111-111111111113', 'p1111111-1111-1111-1111-111111111113', 'Oni Mask Tee', 'Oni Mask', 'Alex Chen', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://cdn.stigmator.dev/mockups/oni-tee.png', 'S', 'Black', 4500, 1, 4500, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- REVIEWS
-- ============================================

INSERT INTO public.reviews (id, customer_id, product_id, rating, title, content, is_verified_purchase, created_at) VALUES
('r1111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'p1111111-1111-1111-1111-111111111111', 5, 'Incredible quality!', 'The print quality is amazing and the fabric is so soft. Already got compliments on it!', true, NOW() - INTERVAL '5 days'),
('r2222222-2222-2222-2222-222222222222', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'p1111111-1111-1111-1111-111111111112', 5, 'Love supporting the artist', 'Knowing that the artist gets a fair cut makes this even better. Design is fire!', true, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- COMPETITION
-- ============================================

INSERT INTO public.competitions (id, title, description, type, theme, status, submission_start, submission_end, voting_start, voting_end, prize_pool, prize_breakdown, max_entries_per_artist) VALUES
('c1111111-1111-1111-1111-111111111111', 'March Flash Battle', 'Submit your best flash design for a chance to win cash prizes and feature placement.', 'FLASH_BATTLE', 'Nature', 'OPEN', NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days', NOW() + INTERVAL '11 days', NOW() + INTERVAL '18 days', 50000, '{"first": 25000, "second": 15000, "third": 10000}', 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPDATE ARTIST STATS
-- ============================================

-- Update Alex Chen stats
UPDATE public.artist_profiles 
SET total_designs = 3, total_sales = 117, total_earnings = 588000
WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Update Sarah Martinez stats
UPDATE public.artist_profiles 
SET total_designs = 3, total_sales = 92, total_earnings = 496600
WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Update Jordan Blake stats
UPDATE public.artist_profiles 
SET total_designs = 2, total_sales = 56, total_earnings = 246800
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Update Morgan Lee stats
UPDATE public.artist_profiles 
SET total_designs = 2, total_sales = 46, total_earnings = 244900
WHERE user_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

-- Update Casey Rivers stats
UPDATE public.artist_profiles 
SET total_designs = 2, total_sales = 36, total_earnings = 197700
WHERE user_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
