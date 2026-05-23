# STIGMATOR PARTNERSHIP SYSTEM
## The Complete Revenue Architecture

---

## OVERVIEW

Stigmator has **two separate but connected** partnership systems:

### 1. DESIGN PARTNERSHIPS (The Equity Ink)
**When:** After tattooing, before garment creation  
**Purpose:** Artist shares future earnings with client (and optionally studio)  
**Who sets it:** Artist  
**Split:** Artist + Client + Studio = 100% (of artist's share)

### 2. GARMENT PARTNERSHIPS (The Multi-Design Magic)
**When:** During garment creation  
**Purpose:** Track multiple designs on one garment  
**Who sets it:** System (inherits from Design Partnerships)  
**Split:** Platform 15%, Remaining 85% distributed by design + partnerships

---

## THE FLOW

### Phase 1: The Tattoo Session
```
ARTIST tattoos CLIENT with "SERPENT COIL"
    ↓
SESSION ENDS
    ↓
ARTIST opens Stigmator → Create Partnership Code
    ↓
SELECTS: "SERPENT COIL" design
SETS SPLITS:
    - Artist (you): 50%
    - Client (Sarah): 30%
    - Studio: 20%
    ↓
GENERATES CODE: INK-ALEX-2024-X7K9
    ↓
ARTIST gives code to Sarah
```

### Phase 2: Client Activation
```
SARAH receives code
    ↓
SARAH goes to stigmator.com/partner
    ↓
ENTERS CODE: INK-ALEX-2024-X7K9
    ↓
VERIFIES tattoo (uploads photo)
    ↓
PARTNERSHIP ACTIVATED
    ↓
SARAH now earns 30% of all "SERPENT COIL" merchandise sales
```

### Phase 3: Garment Creation (Later)
```
ARTIST decides to put "SERPENT COIL" on a hoodie
    ↓
UPLOADS to Stigmator Garment Designer
    ↓
SYSTEM checks: Does this design have active partnerships?
    ↓
YES: Sarah has 30% partnership
    ↓
SYSTEM locks in splits for this garment:
    - Platform: 15% (Stigmator fee)
    - Artist: 35% (50% of remaining 70%)
    - Sarah: 25.5% (30% of remaining 85%)
    - Studio: 14% (20% of remaining 70%)
    ↓
GARMENT goes live
```

### Phase 4: The Multi-Design Garment (The Genius)
```
CUSTOMER buys hoodie with THREE designs:
    1. SERPENT COIL (Alex) - 33.33% of garment
    2. ONYX ROSE (Sam) - 33.33% of garment
    3. DRAGON (Jordan) - 33.33% of garment
    ↓
SALE: $100
    ↓
PLATFORM: $15 (15%)
REMAINING: $70
    ↓
DISTRIBUTED:
    - Alex's 33.33% ($23.33):
        * Alex: $11.67 (50%)
        * Sarah: $7.65 (30%)
        * Studio: $4.67 (20%)
    
    - Sam's 33.33% ($23.33):
        * Sam: $23.33 (100%, no partners)
    
    - Jordan's 33.33% ($23.33):
        * Jordan: $16.33 (70%)
        * Mike: $7.65 (30% partner)
    ↓
EVERYONE PAID INSTANTLY
```

---

## THE MATH

### Single Design, No Partners
```
Sale: $100
Platform: $15 (15%)
Artist: $70 (70%)
```

### Single Design, With Partners
```
Sale: $100
Platform: $15 (15%)
Remaining: $70
    ↓
Artist configured split: 50% artist / 30% client / 20% studio
    ↓
Artist: $35 (50% of $70)
Client: $17 (30% of $56.67)
Studio: $14 (20% of $70)
```

### Multi-Design (3 designs, equal weight)
```
Sale: $100
Platform: $15 (15%)
Remaining: $70
    ↓
Each design gets: $23.33 (33.33% of $70)
    ↓
Design 1 (has partners 50/30/20):
    Artist: $11.67
    Client: $7.00
    Studio: $4.67

Design 2 (no partners):
    Artist: $23.33

Design 3 (has partner 70/30):
    Artist: $16.33
    Client: $7.00
```

---

## DATABASE TABLES

### partnership_codes
The pre-arrangement between artist and client.
```sql
- code: "INK-ALEX-2024-X7K9"
- design_id: links to design
- artist_share: % artist keeps
- client_share: % client gets
- studio_share: % studio gets (optional)
- status: active/pending/redeemed
```

### design_partnerships
The activated partnership after client redeems code.
```sql
- partnership_code_id: links to code
- partner_id: the client (tattoo wearer)
- artist_share/client_share/studio_share: locked splits
- verification_status: pending/verified
```

### garment_designs
Links designs to garments for multi-design tracking.
```sql
- product_design_id: the garment
- design_id: individual design
- revenue_percentage: what % of garment this design gets
```

### garment_design_partnerships
Locks in partnerships for a specific garment.
```sql
- product_design_id: the garment
- design_partnership_id: the partnership
- shares: locked at garment creation time
```

### earnings_breakdown
Every sale, every recipient, exact amounts.
```sql
- order_item_id: the sale
- recipient_id: who gets paid
- recipient_type: artist/client/studio/platform
- amount: exact cents
- percentage: what % of sale
```

---

## KEY PRINCIPLES

### 1. Splits Are Set at Code Creation
Artist decides the split when creating the code. This is locked in.

### 2. Splits Are Inherited at Garment Creation
When a design is put on a garment, the system copies the current active partnerships. Changes to partnerships after garment creation don't affect existing garments (prevents manipulation).

### 3. Multi-Design Garments Split by Design
Each design gets its proportional share of the 70%, then splits among its partners.

### 4. Platform Always Takes 15%
This happens at the garment level, before any partner splits.

### 5. Studio is Optional
Artist can include studio in split or keep it artist-client only.

---

## EDGE CASES

### What if partnership changes after garment is live?
Changes only affect NEW garments. Existing garments keep original splits.

### What if client never redeems code?
Code expires (configurable, default 30 days). Artist keeps 100%.

### What if design has multiple partners?
Each partner gets their % from their specific partnership. Multiple people can have 20% partnerships on same design.

### What if artist has no partners?
Artist gets 100% of their design's share (70% of sale if single design).

### What if 5 designs on one garment?
Each gets 20% of the 70% = 14% of total sale each.

---

## EXAMPLE SCENARIOS

### Scenario 1: Simple Partnership
- Alex tattoos "Serpent" on Sarah
- Alex creates code: 50/30/20 split
- Sarah redeems
- Alex puts on hoodie
- Hoodie sells for $100
- Platform: $15
- Alex: $42.50
- Sarah: $25.50
- Studio: $17

### Scenario 2: Multi-Design Garment
- Hoodie has 3 designs (Alex, Sam, Jordan)
- Each design 33.33%
- Alex's design has Sarah partnership (50/30/20)
- Sale: $100
- Platform: $15
- Each design gets $28.33
- Alex's share: $14.17 (50% of $28.33)
- Sarah's share: $8.50 (30% of $28.33)
- Studio: $5.67 (20% of $28.33)
- Sam gets: $28.33 (no partners)
- Jordan gets: $28.33 (no partners)

### Scenario 3: The Collaboration
- Hoodie: Alex + Sam collaboration
- Alex's design has Sarah partnership
- Sam's design has no partners
- Revenue split: 50/50 between artists
- Sale: $100
- Platform: $15
- Remaining: $85
- Alex's 50% ($42.50):
    * Alex: $21.25
    * Sarah: $12.75
    * Studio: $8.50
- Sam's 50% ($42.50):
    * Sam: $42.50

---

## THE UI

### Artist Partnership Creation
1. **Select Design** - Grid of artist's designs
2. **Configure Splits** - Sliders for artist/client/studio
3. **Client Info** - Name, email, tattoo location, session date
4. **Generate** - Creates unique code
5. **Share** - Copy code or send via email

### Partner Activation
1. **Enter Code** - INK-XXXX-XXXX format
2. **Verify Tattoo** - Upload photo
3. **Confirm Splits** - See what % they'll earn
4. **Activate** - Partnership sealed

### Multi-Design Garment Creation
1. **Base Garment** - Select hoodie/shirt/etc
2. **Add Designs** - Multiple designs, position each
3. **Set Revenue Split** - % per design (default equal)
4. **Review Partners** - System shows all partners for all designs
5. **Lock In** - Splits frozen for this garment
6. **Submit** - Await manufacturer approval

---

## WHY THIS IS GENIUS

1. **Artist incentivized** - More partners = more marketing (partners promote their own earnings)

2. **Client incentivized** - Free money from tattoos they already have

3. **Studio incentivized** - Passive revenue from shop's work

4. **Collaboration enabled** - Multiple artists on one garment, all tracked

5. **Transparency** - Every penny accounted for, visible to all parties

6. **Scalable** - Works for 1 design or 50 designs on one garment

7. **Fair** - Everyone gets exactly what was agreed

---

## THE VISION

**Every tattoo is a business partnership.**

The artist creates.
The client provides the canvas.
The platform sells.
Everyone profits.

**This is the tattoo economy revolution.**

---

*System operational.*
*Get marked.*
*Get paid.*
