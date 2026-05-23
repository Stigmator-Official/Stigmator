# STIGMATOR

> **Wear the art. Support the artists.**

STIGMATOR is an enterprise-grade multi-sided marketplace connecting tattoo artists with apparel enthusiasts. Artists upload their designs, apply them to garments, and earn from every sale—while customers wear unique, artist-designed pieces that tell a story.

## Features

### For Customers
- Browse curated collections of artist-designed apparel
- Filter by category, artist, and style
- View detailed mockups before purchasing
- Track orders and manage account

### For Artists
- Upload and manage tattoo designs
- Apply designs to multiple garment types
- Link to verified studios
- Earn 70% from every sale
- Compete in design competitions
- Track earnings and analytics

### For Studios
- Verification system for legitimacy
- Manage multiple artists under one studio
- Public studio profiles and portfolios

### For Fulfillment Partners
- Receive order notifications
- Access design specifications
- Manage production queue
- Track performance metrics

### Competition System
- Monthly design challenges
- Bracket tournaments
- Global artist rankings
- Community voting
- Prize distribution

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth with RLS
- **Payments**: Stripe (deposits, purchases, payouts)
- **Storage**: Supabase Storage

## Project Structure

```
stigmator/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Authentication routes
│   │   ├── (main)/         # Public pages
│   │   ├── artist/         # Artist dashboard
│   │   ├── admin/          # Admin dashboard
│   │   └── dashboard/      # User dashboard
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Layout components
│   │   ├── shop/          # Shop-specific components
│   │   └── artists/       # Artist-specific components
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript types
│   └── hooks/             # Custom React hooks
├── supabase/
│   └── schema.sql         # Database schema
└── public/                # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
cd stigmator
npm install
```

3. Set up environment variables:
```bash
cp .env.local.template .env.local
# Edit .env.local with your credentials
```

4. Set up Supabase:
   - Create a new project
   - Run the schema from `supabase/schema.sql`
   - Copy your project URL and anon key to `.env.local`

5. Run the development server:
```bash
npm run dev
```

## Database Schema

The database includes:
- **Profiles**: Extended user data with roles
- **Studios**: Verified tattoo studios
- **Products**: Garment templates with design areas
- **Designs**: Tattoo artwork
- **Product Designs**: Designs applied to products
- **Orders & Order Items**: Purchase tracking
- **Competitions**: Design challenges and voting
- **Payouts**: Revenue distribution

## Key Features

### Security
- Row Level Security (RLS) on all tables
- Role-based access control
- Secure authentication flow

### Payments
- Deposit system for mockups
- Full purchase flow
- Automated artist payouts

### Design Tools (Planned)
- Drag-and-drop mockup generator
- Placement visualization
- Real-time preview

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Environment Variables
Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Contributing

This is a proprietary project. For collaboration inquiries, please contact the project owner.

## License

All rights reserved. © 2024 STIGMATOR.

---

**Built with passion by the STIGMATOR team.**
