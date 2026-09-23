# Gym Pass — Digital Membership Card Platform

A multi-gym SaaS product: gym owners add members, each member gets a digital
membership card with a secure QR code, and staff scan the code to instantly
see who the member is and whether their membership is valid. No attendance,
no check-ins — identification and verification only.

## 1. What's built

- **Multi-tenant data model** — every table that isn't global carries a
  `gymId`, and every single database query in the app filters by the
  logged-in user's own `gymId`. One gym can never read another gym's rows.
- **Auth** — email/password signup and login for gym owners, with staff
  accounts an owner can create. Passwords are hashed with bcrypt; sessions
  are signed JWTs in an httpOnly cookie, checked both in an edge middleware
  and again on every page/API route.
- **Members** — add, search, filter by status, sort by expiry, edit,
  deactivate/reactivate, delete (with confirmation).
- **Digital membership card** — auto-generated per member, with a QR code
  that encodes a random, unguessable token (never the member's phone,
  email, or payment info). The same card updates in place on renewal — a
  member never gets a new QR code.
- **Public card page** (`/card/[token]`) — no login required, shows only
  what's meant to be public (name, plan, dates, status, QR). Share button
  uses the Web Share API with a copy-link fallback.
- **Public verification page** (`/verify/[token]`) — a minimal "is this
  card valid" screen for anyone who opens a scanned link directly.
- **Staff scanner** (`/dashboard/scan`) — opens the device camera, decodes
  the QR, and shows the full verification panel (member details, plan,
  payment status, emergency contact) for staff logged into the *same* gym
  the card belongs to. A token from another gym, or an unknown token,
  always comes back as invalid.
- **Renewal history** — every signup and renewal writes an immutable
  history row; renewing extends from whichever is later, today or the
  current expiry, so an early renewal never shortens what a member already
  has.
- **Gym branding** — logo, colors, contact info, and the "expiring soon"
  window are all configurable and flow onto every card automatically.
- **Roles** — Owner (full access) and Staff (scan + search only), enforced
  server-side, not just hidden in the UI.
- **Demo data** — a seed script creates a fully populated demo gym.
- **Minimal platform admin** (`/admin`) — a read-only list of every gym,
  gated by an email allowlist, as scaffolding for a future real admin panel.

Not built (deliberately, per the brief): attendance/check-in, workout or
diet tracking, trainer/class/equipment management, payroll, accounting, or
an online payment gateway. The schema and routing are structured so these
can be added later without a rewrite.

## 2. Project structure

```
prisma/
  schema.prisma        Gym, User, Member, MembershipRenewal
  seed.ts               Demo data
src/
  lib/
    auth.ts              password hashing + session cookies
    db.ts                Prisma client singleton
    apiSession.ts         require-login helpers for API routes
    requireSession.ts     require-login helpers for pages
    membership.ts         status logic, token/member-code generation
  middleware.ts          edge-level auth check for /dashboard
  components/            card, QR, scanner, forms
  app/
    page.tsx              landing page
    (auth)/login, signup
    dashboard/            owner + staff area (layout has the nav)
      page.tsx             overview / stats
      members/             list, add, member detail (card + renew + history)
      scan/                camera QR scanner
      settings/            gym branding
      staff/               staff accounts
    card/[token]/          public digital card
    verify/[token]/        public verification screen
    admin/                 minimal platform view
    api/                   all mutations and lookups
```

## 3. How to run it locally

```bash
npm install
cp .env.example .env      # then edit DATABASE_URL and SESSION_SECRET (see below)
npm run db:push           # creates the tables in your Postgres database
npm run db:seed           # optional — adds the demo gym, requires Node.js
npm run dev
```

Open http://localhost:3000. Log in with the seeded demo account
(`demo@gympass.app` / `demo1234`), or sign up a new gym from the landing
page. (You can also skip local setup entirely and deploy straight to
Vercel — see §8. The demo-data seed script does need Node.js to run, so
on a no-local-setup deploy you'd just sign up your first real gym through
the UI instead.)

## 4. Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Your Postgres/Supabase connection string — use the **pooled** ("Transaction pooler") one. |
| `DIRECT_URL` | Yes | The **direct** (non-pooled, port 5432) connection string to the same database. Only used for creating/updating tables — see §5. |
| `SESSION_SECRET` | Yes | Long random string that signs session cookies. Generate one with `openssl rand -base64 48`. |
| `NEXT_PUBLIC_APP_URL` | Yes | Used to build the absolute card URL that gets encoded in the QR. Set to your real domain in production. |
| `SUPER_ADMIN_EMAILS` | No | Comma-separated emails allowed to view `/admin`. |

## 5. Database setup

The schema is configured for Postgres out of the box (Supabase, Neon, or
any Postgres host all work). It needs **two** connection strings:

- `DATABASE_URL` — the **pooled** connection (Supabase calls this the
  "Transaction pooler," port 6543). The running app uses this for every
  normal query. Add `?pgbouncer=true&connection_limit=1` to the end of it.
- `DIRECT_URL` — the **direct** connection (port 5432, no pooler). Used
  *only* by `prisma db push` when creating/updating tables — pooled
  connections can't run schema changes, so without this the build hangs
  indefinitely trying to create tables through the pooler.

Both are in Supabase's "Connect" panel (Project → Connect button) — pick
"Direct connection" for one and "Transaction pooler" for the other, on
the same page.

The `build` script (`prisma db push && next build`) uses `DIRECT_URL`
automatically to create/update the tables on every deploy — you never
have to run a migration command by hand. If you later want a stricter,
versioned migration workflow instead of this auto-push, swap that script
step for `prisma migrate deploy` and manage migrations with
`npx prisma migrate dev` from a machine with Node.js.

## 6. How authentication works

Passwords are hashed with bcrypt (12 rounds) and never stored in plain
text. On login, a JWT containing `{ userId, gymId, role, name }` is signed
with `SESSION_SECRET` and set as an httpOnly, `sameSite: lax` cookie —
JavaScript on the page can't read it, and it isn't sent cross-site. Every
dashboard page and every API route re-verifies that token and re-derives
the session from it; `gymId` from the verified token — never a value
passed in the request — is what every database query is scoped by, which
is what actually keeps gyms isolated from each other.

## 7. How QR generation and scanning work

- **Generation**: each member gets a `cardToken` — 24 random bytes,
  base64url-encoded (`crypto.randomBytes`) — stored on their row. The QR
  encodes the full public card URL, `{NEXT_PUBLIC_APP_URL}/card/{token}`.
  Nothing else is embedded in it.
- **Scanning**: `/dashboard/scan` opens the device camera via
  `html5-qrcode`, decodes the URL, and extracts the token client-side. It
  then calls `GET /api/verify/[token]`, an authenticated endpoint that
  looks the member up by token *and* checks the token's `gymId` matches the
  logged-in staff member's own `gymId` — a real token from a different gym
  and a token that doesn't exist both come back identically as "invalid",
  so the endpoint never confirms that a card exists elsewhere.

## 8. How to deploy it

The straightforward path is Vercel (for the app) + Supabase or Neon (for
Postgres):

1. Push this project to a Git repo.
2. Switch the Prisma provider to `postgresql` as in §5 and point
   `DATABASE_URL` at your hosted database.
3. Import the repo into Vercel, add the four environment variables from
   §4 in the project settings, and deploy.
4. Run `npx prisma db push` against the production `DATABASE_URL` once
   (from your machine, or a one-off Vercel deploy hook) to create the
   tables, then seed if you want a demo gym there too.
5. Because the QR encodes `NEXT_PUBLIC_APP_URL`, set it to your real
   deployed domain *before* generating cards — regenerating it later means
   old QR codes still point at the old URL. (The token itself keeps
   working at either URL; only the printed/encoded link changes.)

## 9. What's optional / left for a future version

Everything under "34. SaaS / multi-gym architecture" and "35. Admin" is
structurally in place (every table is gym-scoped; `/admin` exists) but
deliberately minimal. Reasonable next additions, none of which require
restructuring what's here:

- Forgot-password / email delivery (the schema and routes don't currently
  send email — this needs a transactional email provider).
- Real file uploads for gym logos and member photos (currently a plain URL
  field — wire up S3/Cloudinary/Supabase Storage and swap the `<input>`
  for a file picker).
- WhatsApp renewal reminders, Apple/Google Wallet passes, NFC.
- Subscription billing for gyms themselves (Stripe), multi-branch gyms,
  finer-grained staff permissions, and a real (not email-allowlist) admin
  role.
- Rate limiting on the login and verify endpoints for production traffic.
