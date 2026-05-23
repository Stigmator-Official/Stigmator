# STIGMATOR DESIGN AUDIT
## The Complete System

---

## 1. THE NEEDLE CURSOR

### What It Is
A custom cursor that looks and behaves like a tattoo machine needle.

### Implementation
- **Visual:** 24px silver gradient needle with sharp tip
- **Behavior:** 
  - Leaves fading ink trails as you move
  - Creates ripple effect on click (like fresh ink)
  - Vibrates/buzzes when hovering interactive elements
- **Tech:** CSS pseudo-elements + React state for position tracking

### Why It Works
- Immediate sensory connection to tattoo culture
- Micro-interactions create delight
- The buzz on hover primes users for action

---

## 2. THE FLASH SHEET GRID

### What It Is
Irregular CSS Grid layout mimicking traditional tattoo flash sheets.

### Implementation
- 12-column grid with varied spanning
- Sizing classes: hero, large, wide, tall, medium, small
- Thick black borders (3px) with double-border technique
- Artist labels at bottom like hand-lettered flash

### Why It Works
- Flash sheets are the native language of tattoo selection
- Irregular sizing creates visual interest
- Dense, chaotic but intentional (like a real shop wall)

### Grid Classes
```
hero:   6 cols × 5 rows (centerpiece)
large:  4 cols × 4 rows
wide:   8 cols × 3 rows (landscape pieces)
tall:   3 cols × 5 rows (vertical designs)
medium: 4 cols × 3 rows
small:  3 cols × 2 rows (filler pieces)
```

---

## 3. THE STENCIL REVEAL

### What It Is
Images that reveal like tattoo stencils being transferred to skin.

### Implementation
- Carbon paper overlay (blue-purple gradient)
- Noise texture for realism
- Text: "STENCIL TRANSFER • PEEL TO REVEAL"
- Fade out + blur removal on scroll into view
- Fresh ink sheen appears after reveal

### Why It Works
- Stencils are the bridge between idea and reality
- The reveal creates anticipation
- Mimics the actual tattoo process

---

## 4. THE GREEN SOAP PALETTE

### What It Is
Color system based on tattoo parlor reality:

| Token | Color | Meaning |
|-------|-------|---------|
| --stigma-soap | #4ade80 | Fresh green soap |
| --stigma-soap-dark | #166534 | Dried/cleaned |
| --stigma-fresh | #dc2626 | Fresh blood |
| --stigma-dried | #7f1d1d | Dried blood |
| --stigma-fluoro | #a3e635 | Fluorescent light |
| --background | #080a08 | Midnight shop |
| --foreground | #e8f5e8 | Soap-tinged white |
| --muted | #6b8e6b | Faded green |

### Why It Works
- Green soap is the smell of tattoo shops
- Not "pretty" green—antiseptic, clinical, alive
- Blood red provides emotional contrast
- Dark backgrounds = 2AM atmosphere

---

## 5. THE 2AM LIGHTING

### What It Is
Dramatic spotlight effects mimicking late-night shop lighting.

### Implementation
- Mouse-following spotlight (green tint)
- Secondary ambient light (red tint)
- Scan line animation (fluorescent flicker)
- Vignette darkening corners
- Fluorescent text flicker animation

### Why It Works
- Best tattoos happen at 2AM
- Fluorescent lights hum and flicker
- Dramatic shadows create intimacy
- Feels like you're in the shop after hours

---

## COPY AUDIT

### Navigation
| Old | New | Why |
|-----|-----|-----|
| Shop | FLASH | Tattoo culture term |
| Artists | CREATE | Action-oriented |
| Competitions | BATTLE | Aggressive, exciting |
| Partner | EARN | Clear value prop |

### CTAs
| Old | New | Why |
|-----|-----|-----|
| Shop Collection | BROWSE FLASH | Cultural accuracy |
| Join the Movement | GET MARKED | Physical action |
| Become an Artist | JOIN THE ARTISTS | Community |
| Sign In | [ACCESS] | Industrial feel |

### Key Phrases
- "Your skin isn't the only canvas" → Positioning
- "Your ink pays rent" → Value proposition
- "Get the code. Share the design. Get paid." → How it works
- "The tattoo economy revolution" → Category creation

---

## FLOW AUDIT

### User Journey 1: Collector
1. Lands on homepage → sees hero "Your skin isn't the only canvas"
2. Clicks FLASH → sees irregular grid like real shop wall
3. Clicks piece → sees stencil reveal animation
4. Sees "EQUITY INK ACTIVE" badge → learns about partnership
5. Clicks ACQUIRE → checkout flow

### User Journey 2: Partner (Tattoo Wearer)
1. Gets code from artist after tattoo session
2. Goes to /partner → "Activate Your Ink"
3. Enters code: INK-ALEX-2024-X7K9
4. Sees partnership terms (20% split)
5. Activates → now earning on all sales

### User Journey 3: Artist
1. Creates design on Stigmator
2. Generates partnership code for client
3. Sets split (50% artist / 35% client / 15% platform)
4. Gives code to client
5. Both earn as design sells

---

## INEVITABILITY FACTORS

### Why Artists Join
- 70% direct payout (vs 10-20% on other platforms)
- Partnership feature attracts serious collectors
- Flash sheet aesthetic feels authentic
- Competition/ranking system

### Why Collectors Buy
- Support artists directly
- Can become partners (Equity Ink)
- Limited flash sheet drops
- Quality garments with real stories

### Why Partners Activate
- Free money from existing tattoos
- Usually 15-25% of merch sales
- Bragging rights ("I earn from this design")
- Community connection

### Viral Mechanics
1. **Coffee Shop Moment:** See someone wearing your tattoo → explain Stigmator
2. **Transparency:** Public earnings build trust
3. **Scarcity:** Flash Friday drops (24hr only)
4. **Status:** "Patron" badges and rankings

---

## TECHNICAL NOTES

### Performance
- CSS animations (GPU accelerated)
- Intersection Observer for reveals
- Touch devices skip cursor effects
- Reduced motion support needed

### Accessibility
- High contrast text (WCAG AA)
- Focus states for keyboard navigation
- Semantic HTML structure
- Alt text for all images

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Progressive enhancement
- Graceful degradation for older browsers

---

## THE BOTTOM LINE

This isn't an e-commerce site.

**It's a tattoo parlor that happens to sell clothes.**

Every element—the needle cursor, the flash grid, the green soap colors, the 2AM lighting—serves one purpose:

**Make visitors feel like they're in a shop at midnight, about to make a permanent decision.**

Because that's what Stigmator is.

Permanent. Partnership. Profit.

---

*Audit completed.*
*System operational.*
*Get marked.*
