# Startup Arena

Startup Arena v0.1 is a daily startup competition with a public auction underneath it.

- One champion faces one challenger for 24 hours.
- Verified users answer: **“Which would you rather use?”**
- The winner returns as champion without paying again.
- Approved founders bid publicly for the next challenger slot.
- The highest valid bidder pays; losing bidders pay nothing.
- Money buys entry, not victory.

The repository contains a working full-stack implementation of the [v0.1 product plan](./docs/V0.1_PLAN.md).

## Quick start

Requirements:

- Node.js 22 or later
- npm 12 or later

Run:

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No external service is required locally. The default development configuration uses:

- embedded PGlite for persistent PostgreSQL-compatible storage in `.data/startup-arena`;
- on-screen development magic links instead of sending email;
- a mock payment adapter that verifies methods and captures winning bids without moving money;
- bypassed Turnstile checks when no Turnstile secret is configured.

The seeded admin email is:

```text
admin@startuparena.local
```

Enter it on `/signin`; the development sign-in link appears in the UI. Seeded founders use `maya@codecanvas.example`, `leo@signalnest.example`, `nora@briefkit.example`, `sam@launchpad.example`, and `ivy@metricfox.example`.

## Implemented v0.1 surface

### Public

- live battle homepage with symmetrical startup cards;
- results hidden until the current user votes;
- one verified vote per account and battle;
- hashed IP/user-agent abuse signals and a daily network limit;
- tracked outbound startup links;
- public first-price challenger auction and bid board;
- battle history and permanent result URLs;
- startup records and click totals;
- rules, about, privacy, and terms pages.

### Founder

- passwordless email authentication;
- startup submission and approval status;
- payment-method verification;
- eligible-startup bidding;
- bid history and aggregate outbound-click analytics.

### Admin and operations

- submission approval/rejection;
- vote review and invalidation;
- wildcard challenger selection;
- first-battle creation plus battle/auction pause and resume controls;
- visible battle and auction state;
- manually retryable scheduled transitions;
- authenticated cron endpoint;
- idempotent Stripe capture and webhook records;
- health endpoint at `/api/health`.

## Common commands

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # run the production build
npm run lint         # ESLint
npm run typecheck    # TypeScript without emitting files
npm test             # unit and integration tests
npm run db:generate  # generate a migration after changing the schema
npm run db:migrate   # apply migrations
npm run db:seed      # seed local demo data; safe to rerun
npm run db:setup     # migrate and seed
```

## Production configuration

Copy `.env.example` to `.env.local` for local overrides. A production deployment must supply:

- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL` pointing to PostgreSQL
- unique `SESSION_SECRET`, `CRON_SECRET`, and `IP_HASH_SECRET`
- `ADMIN_EMAILS`
- `RESEND_API_KEY` and a verified `EMAIL_FROM`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and a Stripe webhook endpoint
- Turnstile keys before accepting untrusted public traffic

Run migrations before the new deployment begins serving traffic. Schedule an authenticated request to `/api/cron/rollover` at least every five minutes. The daily rules use UTC; the auction closes one hour before its associated battle.

For a fresh production database, sign in with an address in `ADMIN_EMAILS`, submit and approve at least two startups, then use `/admin/battle` to launch immediately or schedule the first battle for the next midnight UTC.

See [Operations](./docs/OPERATIONS.md) for deployment, Stripe, scheduling, recovery, and launch requirements.

## Architecture

The app is one Next.js 16 application using React 19, TypeScript, Tailwind CSS, Drizzle ORM, PostgreSQL/PGlite, and Stripe. It intentionally has no separate API service, Redis, queue, WebSocket server, or analytics warehouse.

Detailed state transitions and data ownership are in [Architecture](./docs/ARCHITECTURE.md).

## Development record

The full implementation chronology, decisions, issues encountered, verification performed, and known limitations are recorded in [Development process](./docs/DEVELOPMENT.md).

The production setup and pilot roadmap is in [Next steps](./docs/NEXT_STEPS.md). The complete documentation index is in [docs](./docs/README.md).
