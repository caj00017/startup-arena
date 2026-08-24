# Startup Arena v0.1 Architecture

## System shape

Startup Arena is a single Next.js application. Server components read directly from the database, route handlers own mutations, and domain services enforce auction, vote, payment, and rollover rules.

```text
Browser
  |
  +-- server-rendered pages and client interactions
  |
Next.js application
  |
  +-- authentication and sessions
  +-- vote, bid, submission, admin, and event routes
  +-- auction and rollover services
  +-- Stripe and Resend adapters
  |
PostgreSQL (production) / PGlite (local development)
```

PGlite uses the same PostgreSQL schema and Drizzle queries as production. It is a zero-setup local adapter, not a recommended production database.

## Data ownership

- `users` owns identity, role, Stripe customer/payment-method references, and verification status.
- `sessions` stores only hashes of random session tokens.
- `magic_links` stores only hashes of single-use, 15-minute email-verification and browser-claim tokens.
- `startups` owns founder-submitted presentation and moderation state.
- `battles` owns participants, time window, final counts, winner, and incumbent streak.
- `auctions` belongs to the active battle and determines the next challenger.
- `bids` is an immutable bid history except for settlement/payment status.
- `votes` enforces a unique `(battle_id, user_id)` constraint.
- `events` records impressions, clicks, votes, signed founder referrals, shares, and submissions. Browser analytics use a random first-party token whose keyed hash—not the token or raw IP—is persisted with each event.
- `audit_logs` records consequential founder/admin/system mutations.
- `webhook_events` makes Stripe webhook processing idempotent.

Raw battle events, individual votes, and their keyed security hashes expire 30 days after a battle is finalized or cancelled; unassociated events expire 30 days after creation. The authenticated rollover cron runs the idempotent cleanup and also removes expired sessions and magic links. Durable battle totals, winners, chain fields, and leaderboard inputs remain, while bids, payment references, audit logs, and processed webhooks are deliberately outside this cleanup pending category-specific legal schedules.

## Battle state

```text
scheduled -> live -> ended/validating -> finalized
    \                                  /
     +------------ cancelled --------+
```

`finalizeBattle` counts only votes whose fraud status is `valid`. A challenger must strictly exceed the champion; a tie retains the incumbent.

## Auction state

```text
open -> closed/settling -> awarded
                       \-> no_bid
open/settling ----------> cancelled
```

Settlement considers bids from highest amount to lowest, with the earlier bid winning an exact tie. A failed payment marks that bid failed and advances to the next candidate. Stripe capture uses the bid ID as an idempotency key.

Both startups in the current battle are ineligible to bid. This is slightly stricter than the original plan and prevents the current challenger from winning both the vote and the next auction, which would produce a startup battling itself.

## Daily transition

The cron and admin retry paths call the same `runScheduledTransitions` service:

1. Find auctions past `closes_at` and settle each one.
2. Find battles past `ends_at` and finalize each one.
3. Resolve the next challenger from the winning bid or configured wildcard.
4. Create exactly one next battle using a unique `previous_battle_id`.
5. Create the next battle's auction.
6. Promote scheduled battles whose start time has arrived.

Renewable database transition leases prevent overlapping workers from settling or finalizing the same record concurrently. Next-battle creation locks the finalized battle row and also has a unique `previous_battle_id` backstop. Stripe idempotency protects capture retries. Finalized battles without a successor are retried so an operator can correct a missing wildcard after finalization. The admin interface exposes the same transition runner for recovery.

## Authentication

Users request a magic link. The server stores hashes of two independent random tokens: an email token sent in the link fragment and a browser token held in an HTTP-only, `SameSite=Lax` cookie. Opening the email link on any device verifies the attempt through a same-origin POST; only the requesting browser can atomically claim it and receive a random session cookie. The original tab polls while waiting and redirects automatically after verification. Production cookies are secure.

Development displays the link in the UI. Production refuses to create a magic link unless Resend is configured.

## Payments

The Stripe integration uses Checkout in `setup` mode to collect and attach a reusable payment method. Bids do not charge immediately. After auction close, Startup Arena creates and confirms an off-session PaymentIntent for the winning amount.

Development uses a clearly identified mock adapter. Production refuses to verify or capture payments without Stripe configuration.

## Abuse controls

- verified account required to vote;
- unique vote constraint per account and battle;
- HMAC-hashed IP and hashed user agent;
- maximum 25 votes from one IP hash in 24 hours;
- Turnstile verification in production for sign-in, voting, and startup submission;
- admin vote review/invalidation;
- startup approval before bidding;
- same-origin checks on browser mutations;
- normalized HTTP/HTTPS startup URLs.

These controls are appropriate for validation traffic, not a final high-scale fraud system.

## Pilot reporting

Battle reports aggregate only events recorded between the battle's start and end, keeping completed results stable when permanent matchup pages receive later visits. Reports derive unique visitors, seven-day return, verified-vote conversion, two-startup exploration, per-startup outbound traffic, signed founder referrals, suspicious-vote rate, and recorded operator interventions.

Founder referral codes are HMAC-signed to bind a share link to one battle and one participating startup. Only the signed-in owner receives that startup's share control, and the event route verifies ownership again before recording a share. Founders see aggregate delivery for their own startups; battle-level fraud and intervention signals remain admin-only.
