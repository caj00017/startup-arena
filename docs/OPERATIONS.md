# Startup Arena v0.1 Operations

## Deployment prerequisites

Human-owned accounts and decisions are intentionally not automated. Before a public production launch, the operator must provide:

1. A hosting project and production domain.
2. A managed PostgreSQL database with pooled `DATABASE_URL` and unpooled `DATABASE_URL_UNPOOLED` connections.
3. A Stripe account capable of accepting payments in the intended jurisdiction.
4. A Resend account, verified sender/domain, and API key.
5. Cloudflare Turnstile keys.
6. Strong generated secrets for sessions, cron authentication, and IP hashing.
7. The real admin email list.
8. A scheduler that can call the rollover route.
9. Legal review of the draft privacy policy, terms, auction language, refund policy, and advertising disclosures.
10. Initial approved startups and a wildcard for the first auction.

The local MVP is fully runnable without these accounts. They are the remaining human/configuration requirements for real money and public email delivery.

On a fresh production database, an email listed in `ADMIN_EMAILS` automatically becomes an admin on first sign-in. Submit and approve at least two startups, then open `/admin/battle` to create the first battle immediately or at the next midnight UTC.

## Database deployment

Set `DATABASE_URL_UNPOOLED` (preferred) and `DATABASE_URL` (fallback), then run:

```bash
npm run db:migrate
```

Do not run the demo seed against production. Production participants should be submitted and reviewed through the application.

The application refuses to use embedded PGlite when `NODE_ENV=production`. Runtime traffic always uses the pooled `DATABASE_URL`; only migration tooling prefers the unpooled URL.

## Authentication and email

Set:

```text
NEXT_PUBLIC_APP_URL=https://your-domain.example
RESEND_API_KEY=...
EMAIL_FROM=Startup Arena <hello@your-domain.example>
ADMIN_EMAILS=founder@your-domain.example
```

Verify the sender domain with the email provider. Magic links expire after 15 minutes and can be used once.

## Stripe

Set the three Stripe variables in `.env.example`. Register this webhook URL in Stripe:

```text
https://your-domain.example/api/payments/webhook
```

Subscribe to:

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Use Stripe test mode for end-to-end staging. Confirm that a founder can set up a payment method, place a bid, lose without a charge, and win with exactly one capture before enabling live mode.

## Scheduler

Call the endpoint every five minutes:

```http
GET /api/cron/rollover
Authorization: Bearer <CRON_SECRET>
```

`vercel.json` configures this five-minute request for Vercel deployments. The route is safe to retry, and overlapping invocations use renewable transition leases plus row serialization. The planned daily schedule is:

- 00:00 UTC — battle and auction open;
- 23:00 UTC — auction closes and settlement begins;
- 00:00 UTC — battle finalizes and the next battle opens.

The development seed uses a rolling 24-hour window so the demonstration is live immediately.

## Daily operator checklist

- Review pending startups.
- Confirm the active battle links work.
- Set an approved wildcard before auction close.
- Check payment failures and the vote review queue.
- Confirm the auction settled by 23:05 UTC.
- Confirm the next battle opened after 00:00 UTC.
- Check `/api/health` and hosting logs.

## Recovery

### Auction did not settle

Open `/admin/battle` and run due transitions. Stripe uses the bid ID as the idempotency key, so the retry cannot intentionally create a second PaymentIntent for that bid.

### No payable winner

The auction moves to `no_bid`. Set or correct its wildcard in `/admin/auction`, then run due transitions again. Finalized battles without a successor remain recoverable and are retried automatically by cron.

### Battle did not finalize

Run due transitions from `/admin/battle`. Finalization recounts valid votes and is safe to repeat.

### Suspicious result

Move suspicious votes to review or invalid in `/admin/moderation` before finalization. In v0.1, finalized results should be repaired directly by an operator only after documenting the incident; a dedicated post-finalization appeal workflow is not included.

### Cancelled paid battle

The payment adapter includes a refund function, but v0.1 deliberately does not expose a one-click refund UI. Verify the exact battle and PaymentIntent in Stripe, issue the refund, and record the incident. Add an audited refund action before delegating this operation to support staff.

## Monitoring

At minimum alert on:

- `/api/health` returning non-200;
- rollover endpoint errors;
- Stripe webhook failures;
- payment failures during settlement;
- no active battle;
- auction or battle remaining in a transitional state for more than 15 minutes.
