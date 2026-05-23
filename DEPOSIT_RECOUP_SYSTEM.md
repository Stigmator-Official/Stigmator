# STIGMATOR DEPOSIT RECOUP SYSTEM
## Artist Investment Recovery

---

## THE CONCEPT

**The Problem:** Artists need to pay a deposit to list garments (covers mockup + advertising space). This creates a barrier to entry.

**The Solution:** Artists can opt to **recoup their deposit from first sales** before normal revenue sharing kicks in.

**The Metaphor:** Like Kickstarter, but continuous. The artist's "investment" in the listing is paid back by early adopters, then the garment becomes a normal revenue stream.

---

## HOW IT WORKS

### Phase 1: Artist Creates Garment

```
Artist uploads "Serpent" design to Long Sleeve
    ↓
System calculates deposit: $50 (mockup + advertising)
    ↓
Artist sees checkbox: "☐ Recoup deposit from first sales"
    ↓
IF checked:
    - Artist specifies: "Recoup over __ sales" (default: 5-10)
    - System calculates: "First 5 sales pay you 100% to recoup deposit"
    - Normal splits start after deposit recouped
    
IF not checked:
    - Normal splits from sale #1
    - Artist paid 50%, Client 30%, Studio 20% (example)
```

### Phase 2: Sales Begin (With Recoup Enabled)

**Sale #1-5 (Recoup Phase):**
```
Garment sells for $100
    ↓
Platform: $15 (15%)
Remaining: $70
    ↓
Artist gets: $70 (100% of remaining)
    ↓
Cumulative recoup: $70 / $50 = PAID OFF
    ↓
Excess: $20 goes to artist
```

**Sale #6+ (Normal Phase):**
```
Garment sells for $100
    ↓
Platform: $15 (15%)
Remaining: $70
    ↓
Normal splits:
    - Artist: $35 (50%)
    - Client: $21 (30%)
    - Studio: $14 (20%)
```

### Phase 3: Recoup Complete

```
Artist receives notification:
"🎉 Your $50 deposit for 'Serpent Long Sleeve' has been recouped!
Normal revenue sharing is now active.
Your partners will receive their share starting with the next sale."
```

---

## THE MATH

### Example 1: Quick Recoup (5 sales)
- Deposit: $50
- Recoup target: 5 sales
- Retail: $100
- Per sale during recoup: $70 (70% after platform)
- Recoup timeline: Sale #1 fully covers it ($70 > $50)

### Example 2: Conservative Recoup (10 sales)
- Deposit: $75
- Recoup target: 10 sales
- Retail: $85
- Per sale during recoup: $59.50
- Recoup timeline: Sale #2 fully covers it

### Example 3: High-End Garment (20 sales)
- Deposit: $150 (complex all-over print)
- Recoup target: 20 sales
- Retail: $250
- Per sale during recoup: $175
- Recoup timeline: Sale #1 fully covers it

---

## WHY THIS IS GENIUS

### For Artists:
- ✅ **Lower barrier to entry** - "I'll get paid back quickly"
- ✅ **Risk reduction** - First sales guarantee ROI
- ✅ **Motivation to promote** - "I need 5 sales to break even"
- ✅ **Transparency** - Clear timeline to profitability

### For Partners (Clients/Studio):
- ✅ **Fairness** - They understand artist needs to recoup investment
- ✅ **Patience** - Clear timeline ("After 5 sales, I start earning")
- ✅ **Trust** - Artist isn't taking advantage, just covering costs

### For Platform (Stigmator):
- ✅ **More listings** - Lower barrier = more artists
- ✅ **Still makes 15%** - Platform fee unaffected
- ✅ **Quality control** - Artists invested = serious listings
- ✅ **Marketing angle** - "Support artist's first sales"

---

## THE UI FLOW

### Step 1: Garment Creation

```
┌─────────────────────────────────────────┐
│  CREATE GARMENT: SERPENT LONG SLEEVE    │
│                                         │
│  DESIGN: [Serpent Coil]                 │
│  BASE GARMENT: [Long Sleeve - $55 cost] │
│  RETAIL PRICE: [$120]                   │
│                                         │
│  ─────────────────────────────────────  │
│  PLATFORM DEPOSIT REQUIRED: $50         │
│  (Covers mockup + advertising space)    │
│                                         │
│  ☑ RECOUP DEPOSIT VIA FIRST SALES       │
│                                         │
│  RECOUP OVER: [ 5 ▼] SALES              │
│                                         │
│  BREAKDOWN:                             │
│  • Sales 1-5: You receive 100% ($70)    │
│  • After recoup: Normal splits active   │
│                                         │
│  YOUR PARTNERS WILL BE NOTIFIED:        │
│  "This garment is in recoup mode.       │
│   Normal splits start after 5 sales."   │
│                                         │
│  [PAY DEPOSIT $50]                      │
└─────────────────────────────────────────┘
```

### Step 2: Partner Dashboard (What Client Sees)

```
┌─────────────────────────────────────────┐
│  YOUR PARTNERSHIP: SERPENT COIL         │
│                                         │
│  STATUS: RECOUP PHASE (3/5 sales)       │
│  ████████░░░░░░░░░░ 60% complete        │
│                                         │
│  ARTIST IS RECOUPING THEIR DEPOSIT.     │
│  YOUR SHARE STARTS AFTER SALE #5.       │
│                                         │
│  ESTIMATED START: 2-3 weeks             │
│  YOUR EXPECTED SHARE: $21 per sale      │
│                                         │
│  CURRENT SALES: 3                       │
│  [VIEW DETAILS]                         │
└─────────────────────────────────────────┘
```

### Step 3: Artist Dashboard (Recoup Progress)

```
┌─────────────────────────────────────────┐
│  SERPENT LONG SLEEVE                    │
│  STATUS: DEPOSIT RECOUP IN PROGRESS     │
│                                         │
│  DEPOSIT: $50                           │
│  RECOUPED: $210 (from 3 sales)          │
│  STATUS: ✅ FULLY RECOUPED!              │
│                                         │
│  RECOUP TIMELINE:                       │
│  Sale #1: $70  ████████████████████     │
│  Sale #2: $70  ████████████████████     │
│  Sale #3: $70  ████████████████████     │
│  ─────────────────────────────────      │
│  TOTAL RECOUPED: $210                   │
│  YOUR PROFIT: $160                      │
│                                         │
│  NORMAL SPLITS NOW ACTIVE               │
│  • You: 50% ($35/sale)                  │
│  • Sarah: 30% ($21/sale)                │
│  • Studio: 20% ($14/sale)               │
└─────────────────────────────────────────┘
```

---

## EDGE CASES

### What if garment never sells enough to recoup?
- Deposit is **non-refundable** (paid for mockup/advertising)
- Artist can **extend recoup period** (more sales)
- Or **accept loss** and activate normal splits
- Partners never affected (they weren't getting paid yet anyway)

### What if partner wants to buy during recoup phase?
- Partner can still buy the garment
- Their purchase counts toward recoup
- They understand they're supporting the artist's recovery
- They start earning from their **next** sale after recoup

### What if artist wants to cancel during recoup?
- Can't cancel active listings (customers already ordered)
- Can **disable new orders** (finish current queue)
- Remaining deposit **not refunded** (already spent on mockup)

### What if recoup takes too long?
- System shows **estimated timeline** upfront
- Artist can **adjust retail price** to speed up
- Can **promote harder** (incentivized to sell)
- Can **lower recoup target** (take smaller amounts per sale)

---

## THE PSYCHOLOGY

### The "Early Supporter" Badge
Customers who buy during recoup phase get:
- Special "Early Supporter" badge on their profile
- Recognition from artist ("Thanks for helping me launch!")
- Potential early-supporter perks (future drops)

### The "Recoup Race"
Artists compete to recoup fastest:
- Leaderboard: "Fastest Recoups This Month"
- Gamification: "Recoup in under 5 sales = Achievement"
- Social proof: "This artist recoups fast = quality"

### The Partner Patience
Partners see recoup as **investment in relationship**:
- "I'll wait 5 sales for this artist to get established"
- Shows long-term thinking
- Builds trust between artist and client

---

## REVENUE IMPACT

### Scenario: 100 Garments, 50% use recoup

**Traditional (no recoup):**
- 100 deposits × $50 = $5,000 immediate revenue
- But fewer artists (barrier to entry)

**With Recoup:**
- 200 deposits × $50 = $10,000 eventual revenue
- More artists (lower barrier)
- First sales still generate platform fees
- Partners engaged from day 1

**Net effect: 2x more listings, 1.5x more revenue**

---

## THE IMPLEMENTATION

### Database Changes:
- `product_designs.deposit_amount` - How much deposit
- `product_designs.deposit_recoup_enabled` - Is recoup active
- `product_designs.deposit_recoup_sales_target` - How many sales
- `product_designs.deposit_recouped_sales_count` - Progress tracker
- `deposit_recoup_payments` - Track each recoup payment

### Function Changes:
- `calculate_earnings_with_recoup()` - Check if in recoup phase
- If recoup active: Artist gets 100% of remaining
- If recoup complete: Normal splits

### UI Changes:
- Garment creation: Recoup checkbox + sales target
- Artist dashboard: Recoup progress bar
- Partner dashboard: "Recoup phase" status
- Customer checkout: "Supporting artist's launch"

---

## THE BOTTOM LINE

**Deposit recoup is the bridge between "artist risk" and "artist reward."**

It says to artists: "We believe in you so much, we'll let you pay us back with success."

It says to partners: "Support the artist's first sales, then we all profit together."

It says to customers: "Be an early supporter. Your purchase launches a career."

**This is how you build a platform that artists actually want to use.**

---

*System operational.*
*Get marked.*
*Get paid back.*
