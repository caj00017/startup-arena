# Startup Arena v0.1 Development Process

## Record

- **Implementation date:** August 21, 2026
- **Starting repository:** two Markdown planning documents and no application code
- **Objective:** implement the full simplified v0.1 while keeping local development independent of third-party accounts
- **Result:** runnable full-stack application with database migrations, seed data, public/founder/admin flows, payment and email adapters, scheduled rollover, tests, and production documentation

## 1. Scope interpretation

The v0.1 plan was treated as the source of truth. The implementation kept:

- one global arena;
- one active 24-hour battle;
- one simultaneous auction for the next challenger;
- public first-price bidding;
- winning bidder charged and losing bidders uncharged;
- winner-stays-on;
- verified one-vote-per-account behavior;
- manually recoverable operations.

Categories, comments, Elo, tournaments, WebSockets, subscriptions, investor tools, recommendations, and mobile applications remain out of scope.

One rule was tightened during implementation: both current participants are prevented from bidding, not only the champion. Otherwise the current challenger could win today's vote and tomorrow's auction, creating an invalid self-match.

## 2. Technology selection

The plan suggested a single full-stack Next.js application and PostgreSQL. The implementation selected:

- Next.js 16.3.2 and React 19.2.8;
- TypeScript with strict checking;
- Tailwind CSS 4;
- Drizzle ORM 0.45.2;
- PostgreSQL in production;
- PGlite 0.5.5 for embedded local development and integration tests;
- Stripe 22.5.0;
- Zod request validation;
- Vitest unit and integration tests.

PGlite was chosen because it preserves PostgreSQL semantics and the same Drizzle schema while avoiding a local Docker requirement. Docker was installed in the environment, but its daemon was not running. This was not a blocker.

## 3. Foundation and data model

The repository was scaffolded manually to preserve the existing planning files. Package scripts, TypeScript, ESLint, Tailwind/PostCSS, Drizzle configuration, environment examples, and an optional PostgreSQL Compose service were added.

The schema implements users, sessions, magic links, startups, battles, auctions, bids, votes, analytics events, audit logs, and processed webhooks. Important database invariants include:

- unique normalized startup URL and slug;
- unique auction per battle;
- unique next battle per previous battle;
- unique vote per user and battle;
- indexed battle/auction states and deadlines;
- persisted payment and fraud status.

Three generated SQL migrations are committed under `drizzle/`.

## 4. Authentication and security

A first-party magic-link flow was implemented to avoid coupling v0.1 to a hosted auth product. Each 15-minute attempt has separate hashed email-verification and browser-claim tokens. The verification link can open on another device, while only the original browser's HTTP-only claim cookie can create its random session.

Development returns the magic URL to the sign-in screen. Production requires a configured Resend sender and never exposes the URL in the response.

Browser mutation routes perform same-origin validation. Vote abuse signals include verified identity, a database uniqueness constraint, HMAC-hashed IP, hashed user agent, a daily network threshold, optional Turnstile, and an admin review queue.

## 5. Public product loop

The homepage was built around one visually dominant matchup. It includes:

- battle status and countdown;
- champion and challenger cards with equal structure;
- tracked outbound visits;
- voting with hidden pre-vote results;
- live percentages after voting;
- one-vote enforcement;
- winner-stays-on language;
- recent finalized battles;
- the active challenger auction.

Permanent battle and startup pages provide the initial historical record and make results shareable.

## 6. Founder marketplace

Founder submission validates canonical HTTP/HTTPS URLs, presentation length, status, and safety confirmation. An admin must approve a startup before it can bid.

The public auction:

- shows bid amounts and startup identities;
- starts at $5 with a $1 minimum increment;
- verifies ownership and approval;
- requires a verified payment method;
- rejects either active participant;
- writes an audit record for each accepted bid.

Stripe Checkout setup mode collects a reusable payment method. Settlement attempts off-session capture from highest to lowest, falling back after a payment failure. Development uses an explicit mock adapter.

## 7. Daily state transition

The transition service closes due auctions, captures the winning bid, finalizes due battles from valid votes, selects the winning-bid startup or wildcard, creates the next battle exactly once, and opens its auction.

The cron route and admin recovery button call the same service. Database uniqueness and Stripe idempotency keys make retries safe.

## 8. Founder and admin operations

Founder account pages show startup review state, payment readiness, bid history, and click totals.

Admin pages support:

- startup approval/rejection;
- startup name, tagline, and destination correction;
- initial battle/auction creation;
- battle and auction pause/resume controls;
- wildcard selection;
- battle/auction state inspection;
- due-transition retries;
- vote review/invalidation.

Manual controls were retained intentionally because v0.1 is an operator-assisted validation product.

### Brand refinement

After the first working build, the visual direction was initially consolidated around electric lime. A subsequent research pass replaced it with Signal Blue (`#1677FF`), supported by the broad preference and positive-valence pattern around vivid blue. The product now uses that exact shade for live, selected, and actionable states, with same-hue light and dark variants for hierarchy. Red-orange remains reserved for warnings and errors. The rationale and usage rules are documented in [BRAND.md](./BRAND.md).

## 9. Issues encountered and resolutions

### Local PostgreSQL daemon unavailable

The installed Docker client could not connect to a daemon. Embedded PGlite was introduced for local persistence and tests while retaining hosted PostgreSQL for production.

### PGlite parent directory

The first migration failed because `.data` did not exist. The migration script now creates the exact parent directory before opening the embedded database.

### PGlite in the Next.js server bundle

The initial development request failed because Turbopack bundled PGlite and produced an incompatible URL/path object at runtime. `@electric-sql/pglite` is now declared as a server external package. The homepage then rendered successfully.

### Database initialization during production build

An eager database singleton caused multiple build workers to initialize the same embedded database. The exported database is now a lazy proxy, so a connection opens only when a query executes.

### Build-time production secret validation

Validating secrets at module import blocked `next build`, where `NODE_ENV` is production even though no server is running. Validation was moved to runtime-sensitive operations. Production also explicitly refuses embedded storage, development email fallback, and mock payments.

### Duplicate vote error wrapping

Drizzle wrapped the PostgreSQL unique violation, so the first duplicate-vote test surfaced a generic query error. Voting now checks for an existing vote for a friendly response and recursively recognizes PostgreSQL unique-violation causes to preserve race safety.

### Next.js generated agent guidance

The first `next dev` run generated `AGENTS.md` and `CLAUDE.md` containing framework-version guidance. These files are generated by Next.js 16 and are retained so subsequent framework work uses the bundled documentation.

## 10. Verification performed

Automated verification:

- strict TypeScript check;
- ESLint with no errors;
- production Next.js build;
- ten tests across domain and database-backed workflows.

The tests cover:

- challenger victory;
- incumbent tie behavior;
- battle and auction time windows;
- opening bid and increment validation;
- successful verified vote;
- duplicate vote rejection;
- eligible bid placement and mock capture;
- empty-auction wildcard fallback;
- finalization and next-battle creation.
- initial production-cycle creation and pause/resume controls.

Runtime smoke verification used the actual development server and local database:

1. Homepage returned HTTP 200 and contained both seeded participants and the auction.
2. About, rules, and sign-in pages returned HTTP 200.
3. Protected pages redirected while signed out.
4. A seeded founder completed magic-link authentication.
5. The authenticated account page returned HTTP 200.
6. The founder cast a vote successfully.
7. A second vote returned HTTP 409 with the expected duplicate message.
8. The founder placed a $5 bid successfully.
9. The public bid board displayed the founder's startup.
10. The seeded admin completed magic-link authentication.
11. The admin control room rendered successfully.
12. An admin rollover check completed with no due transitions.
13. A startup profile and the health endpoint returned HTTP 200.
14. An admin paused and resumed both the live battle and auction; each state returned to `live`/`open` successfully.

## 11. Dependency audit

The production dependency audit reports no production vulnerabilities (`npm audit --omit=dev`). The full audit reports moderate findings in an old esbuild version pulled transitively by the Drizzle migration CLI. That CLI is development-only; it is not part of the production application path. Forcing the audit's suggested downgrade would replace the current Drizzle CLI with an older major-incompatible version, so it was documented rather than applied.

## 12. Known v0.1 limitations

- PGlite is single-process local storage; production requires managed PostgreSQL.
- Real email, payment, bot protection, deployment, and scheduling require operator-owned accounts.
- Submitted images are URL-based; managed upload/storage is not implemented.
- Fraud detection is rules-based and operator-assisted.
- Analytics are aggregate events, not conversion attribution on founder sites.
- No anti-sniping extension is applied to auction close.
- No automatic champion retirement exists.
- No founder notifications or result emails exist.
- Refund support exists in the payment adapter but requires manual Stripe operation and incident documentation.
- Privacy and terms pages are operational drafts requiring legal review.
- Alerting is documented but not connected to a monitoring provider.

These limitations do not prevent local validation of the core hypothesis: whether people vote and founders bid for the next battle.
