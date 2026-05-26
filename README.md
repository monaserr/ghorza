# Virtue — Modern Streetwear Store

A full-stack e-commerce storefront built with TanStack Start, React 19, Tailwind v4, and Supabase.

## Stack

- **Frontend**: TanStack Start + React 19 + Tailwind CSS v4 + shadcn/ui
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Deployment**: Cloudflare Workers (via Wrangler)
- **Animations**: CSS keyframes (marquee, fade-up)
- **Forms**: react-hook-form + Zod

## Features

- Product catalog with filtering and sorting
- Collection pages
- Product detail pages with size/color selection
- Shopping cart (localStorage, guest-friendly)
- Checkout with cash-on-delivery
- User authentication (email/password + Google OAuth)
- Account page with order history
- Admin dashboard (products, collections, orders, users)
- Cookie consent banner
- Fully responsive with mobile navigation

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. Run the Supabase migrations in `supabase/migrations/` against your project
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for required variables. Get your Supabase keys from:
**Supabase Dashboard → Your Project → Settings → API**

## Admin Access

After signing up, visit `/account` and click **"Claim Admin (first user only)"** to grant yourself admin access. Only the first user can claim admin this way.

## Deployment

```bash
npm run build
npx wrangler deploy
```
