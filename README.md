# Record Search Portal

A small internal tool for searching POSP associate records stored in Supabase. Type
any value — name, phone number, email, Aadhar, PAN, bank account, IFSC code — and
get back the matching record(s), or use Advanced search to filter on specific
fields at once.

## Stack

- Next.js (App Router, TypeScript, Tailwind CSS)
- Supabase (Postgres) as the data store, queried server-side only

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Environment variables**

Create a `.env.local` file in the project root (never committed — already
gitignored) with:

```
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

These are read server-side only (`src/lib/supabase-server.ts`) and are never sent
to the browser.

**3. Database table**

The app expects a `posp_records` table with these columns (all nullable text
unless noted):

```
associate_name, associate_id, type, onboarding_id, document_recv_date (date),
pos_name, contact_number, email, city, pin_code, aadhar_number, pan_number,
dob (date), gst_number, marsheet, bank_name, account_number, ifsc_code
```

Create it via the Supabase SQL Editor, with Row Level Security enabled and a
policy allowing `select` for the `anon` role (the app only ever reads).

**4. Run the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How search works

- **Simple search**: one search box, matched with `ILIKE` across every text
  column (OR logic) — a single term can hit a name, phone number, PAN, etc.
- **Advanced search**: a form with one input per field, combined with AND logic,
  for narrowing down to a specific record.
- Results are paginated server-side, 10 records per page.

## Deployment

Deployed on Vercel. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` under
**Project → Settings → Environment Variables** before deploying — the build will
fail without them.

## Data sensitivity

This table holds PII (Aadhar, PAN, bank account numbers). Keep the deployed URL
and Supabase credentials private, and don't widen access beyond who actually
needs it.
