# DFShop — Private Second-hand Clothing Marketplace

A private single-seller storefront for selling second-hand clothing. Buyers access via direct link only (no registration). Fully private — search engines are blocked.

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Image Storage**: Supabase Storage
- **Auth**: NextAuth.js (single admin user, credentials)
- **Deployment**: Vercel (free tier)

---

## Quick Start

### 1. Clone & install dependencies

```bash
git clone <repo>
cd dfshop
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the following:

```sql
-- listings table
create table listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text not null,
  size text not null,
  price numeric not null,
  currency text default 'RSD',
  condition text not null,
  description text,
  is_sold boolean default false,
  is_hidden boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- listing_images table
create table listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  storage_path text not null,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Auto-update updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_listings_updated_at
  before update on listings
  for each row execute procedure update_updated_at_column();

-- brands table
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int default 0,
  created_at timestamptz default now()
);

-- categories table
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int default 0,
  created_at timestamptz default now()
);

-- add category column to listings
alter table listings add column category text;

-- (optional) migrate existing brands from listings
insert into brands (name)
select distinct brand from listings order by brand;
```

3. Go to **Storage** → **New bucket** → name it `listing-images`, set to **Public**
4. Go to **Storage** → **Policies** → add a policy allowing `INSERT` for authenticated (service role) users on the `listing-images` bucket

### 3. Configure environment variables

Copy `.env.local` and fill in your values:

```bash
cp .env.local .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe for frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only, never expose) |
| `NEXTAUTH_SECRET` | Random secret string (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your app URL (`http://localhost:3000` for dev) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password (plaintext or bcrypt hash) |
| `NEXT_PUBLIC_CONTACT_WHATSAPP` | WhatsApp number with country code (e.g. `381601234567`) |
| `NEXT_PUBLIC_CONTACT_VIBER` | Viber number |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact email |
| `NEXT_PUBLIC_CURRENCY` | Default currency (`RSD` or `EUR`) |

#### Generating a bcrypt password hash (recommended for production)

```bash
node -e "const b = require('bcryptjs'); b.hash('your_password', 12).then(h => console.log(h))"
```

Paste the output as `ADMIN_PASSWORD`.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public shop.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import from GitHub
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js, zero config needed
5. Every push to `main` triggers a redeploy

**Total monthly cost: $0** (Vercel free + Supabase free tier)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Public homepage (listings + filters)
│   ├── listing/[id]/page.tsx       # Public listing detail
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login
│   │   ├── dashboard/page.tsx      # Listings management table
│   │   └── listings/
│   │       ├── new/page.tsx        # Create listing
│   │       └── [id]/edit/page.tsx  # Edit listing
│   └── api/
│       ├── auth/[...nextauth]/     # NextAuth handler
│       ├── listings/               # GET list, POST create
│       ├── listings/[id]/          # GET one, PATCH update, DELETE
│       └── upload/                 # Image upload to Supabase Storage
├── components/
│   ├── ListingCard.tsx             # Card with image, price, size, brand
│   ├── ListingGrid.tsx             # Responsive grid wrapper
│   ├── FilterBar.tsx               # Brand/size/category/price filters
│   ├── HomepageContent.tsx         # Client-side filter logic
│   ├── ImageGallery.tsx            # Main image + thumbnail carousel
│   ├── ContactButton.tsx           # WhatsApp / Viber / Email buttons
│   ├── SoldBadge.tsx               # "PRODATO" overlay badge
│   └── admin/
│       ├── ListingForm.tsx         # Create/edit form (shared)
│       ├── ImageUploader.tsx       # Drag-drop multi-image uploader
│       ├── AdminDashboardClient.tsx # Dashboard table with actions
│       ├── DeleteDialog.tsx        # Confirmation modal
│       └── AdminSignOutButton.tsx  # Sign out button
├── lib/
│   ├── supabase.ts                 # Supabase browser + server clients
│   ├── auth.ts                     # NextAuth options
│   └── config.ts                   # Contact info, currency, site name
└── types/
    └── index.ts                    # Shared TypeScript types
```

---

## Features

### Public (buyer)
- Browse all listings in a responsive grid
- Filter by brand, size, price range
- View full listing details with image carousel
- Contact seller via WhatsApp, Viber, or email
- Sold items shown with "PRODATO" badge

### Admin
- Login at `/admin/login` with email/password
- View, search, and manage all listings
- Create/edit listings with multi-image drag-drop upload (max 8 per listing)
- Delete listings (with image cleanup from Supabase Storage)
- Toggle sold/available status
- Show/hide listings without deleting

### SEO
- `robots.txt`: `Disallow: /` — completely blocked from search engines
- `<meta name="robots" content="noindex, nofollow">` on all pages
- No sitemap
