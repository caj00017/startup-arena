# Startup Arena — Paid-First Launch Plan

**Status:** Staging lifecycle rehearsal complete; preparing a controlled paid launch

**Last reconciled:** August 24, 2026

**Objective:** Open with one invited matchup and live paid bidding after the remaining production, legal, operational, and cohort gates pass. There is no separate multi-battle free pilot.

## 1. Current checkpoint

The launch-blocking application hardening and real staging lifecycle rehearsal are complete. Staging has exercised:

- cross-device email authentication and Turnstile-protected mutations;
- startup submission, moderation, voting, and public battle rendering;
- Stripe test-mode payment-method setup, bidding, successful capture, and off-session failure;
- awarded, no-bid, wildcard, pause/resume, and operator-recovery paths;
- automatic Vercel Cron rollover, overlapping transition requests, and settlement idempotency.

Pilot analytics and referral reporting are implemented and pushed on `main` as `5e198dd`. Deployment of that commit to staging is pending restored Vercel CLI authorization.

The remaining launch sequence is:

```text
Deploy and rehearse reporting on staging
        ↓
Production domain, providers, monitoring, policies, and retention
        ↓
Approve Nexura plus the invited opening challenger
        ↓
Instrumented production rehearsal with Stripe test mode
        ↓
Explicit live-payment authorization and live Stripe cutover
        ↓
Controlled paid launch
        ↓
Evidence review after the first 7–14 days
```

No live payment should be accepted until Chris explicitly authorizes it after the readiness review. The production Neon resource must be upgraded from Free to a suitable paid production plan before public traffic begins.

## 2. Opening lineup and marketplace continuity

### Opening matchup

- **Champion:** Nexura — `https://nexura.fyi/`, owned by Chris.
- **Challenger:** one startup submitted by an invited founder and approved through normal moderation.
- **Day-one auction:** open to other approved, payment-verified founders using live Stripe after launch authorization.

Nexura and the invited challenger receive their opening placements without winning a prior auction because the marketplace has no previous battle. Money buys subsequent challenger placement, not votes or the opening seed positions.

### Day-two continuity requirement

The two startups in the active battle cannot bid or serve as that battle's wildcard. Therefore, Nexura plus one invited challenger are sufficient to start day one, but they do not guarantee a valid day-two matchup.

Before the first auction closes, one of the following must exist:

1. an eligible paid bidder whose payment settles successfully; or
2. a third, distinct approved startup configured as the wildcard fallback.

For a dependable launch, configure the fallback before auction close rather than assuming an organic paid bid will arrive. The third startup does not necessarily require a third founder; it may be another legitimate approved product owned by Chris or the invited founder. Without a payable bid or eligible fallback, the system safely pauses after finalization until an operator supplies one.

## 3. Ownership

### Codex owns

- repository changes, tests, deployment configuration, and technical runbooks;
- analytics, referral attribution, and operator/founder reporting;
- technical monitoring hooks and production configuration validation;
- staging and production deployment verification;
- translating approved legal and operational decisions into product copy and controls.

### Chris owns

- domains, provider accounts, billing, DNS, and secret entry;
- legal, tax, privacy, refund, dispute, and moderation policy decisions;
- support and alert destinations, geography/currency, bid cap, and UTC rollover boundary;
- submitting Nexura, inviting the opening challenger, and arranging a day-two fallback;
- voter and bidder outreach, daily launch operations, and founder interviews;
- the explicit authorization to enable live Stripe payments.

Credentials belong only in provider-managed encrypted environment settings. They must not be pasted into chat, stored in Markdown, or committed to Git.

## 4. Launch measurement contract

Unless stated otherwise, each battle report includes activity recorded from that battle's start through its end, so historical page visits cannot change a completed result.

| Metric | Definition |
|---|---|
| Unique battle visitors | Distinct first-party anonymous visitor identifiers that recorded a battle impression |
| Verified votes | Votes whose final fraud status is `valid` |
| Vote conversion | Verified voters divided by unique battle visitors |
| Returning visitor rate | Battle visitors also seen on an earlier battle within the preceding seven days, divided by unique battle visitors |
| Outbound clicks | Total and distinct-visitor clicks delivered to each competing startup |
| Explored both | Distinct battle visitors who opened both competing startup destinations, divided by unique battle visitors |
| Founder shares | Tracked uses of a founder's battle-share control |
| Referred visits | Unique battle visitors arriving through a founder-attributed share link, by startup |
| Referral vote conversion | Verified voters from a founder-attributed visit divided by unique referred visitors |
| Invalid/suspicious vote rate | Votes marked `invalid` or `review`, divided by all battle votes |
| Operational interventions | Manual pause, moderation, fallback correction, or rollover recovery actions recorded for the battle |
| Auction demand | Eligible bidders, valid bids, winning amount, payment result, and repeat bidding |

The visitor identifier is random and first-party and is persisted server-side only as a keyed hash. It contains no email address, startup ID, raw IP address, or third-party advertising identifier. Chris must approve a raw-event retention and deletion policy before public traffic.

## 5. Chronological remaining work

### Phase A — Deploy and validate launch reporting

**Codex**

1. Deploy commit `5e198dd` to staging after Vercel CLI authorization is restored.
2. Generate controlled staging impressions, a signed founder referral, a share, both startup clicks, and a verified vote.
3. Reconcile the admin battle report and founder summary against the controlled traffic.
4. Confirm founders see only their own aggregate delivery data and admins see battle-level operational evidence.

**Chris**

1. Restore Vercel CLI authorization without sharing credentials.
2. Choose a raw analytics retention period and deletion-request policy.
3. Review the first staging report for usefulness and clarity.

**Exit criteria**

- Controlled traffic appears exactly once per defined visitor denominator.
- Signed referral attribution cannot be reassigned to another startup or battle.
- No report exposes raw identifiers or security fingerprints.

### Phase B — Complete the production foundation

**Chris**

1. Choose the production domain and configure DNS.
2. Choose and publish a monitored support/dispute address.
3. Choose an uptime/error alert destination.
4. Decide the permanent UTC rollover boundary.
5. Confirm the initial launch geography and currency; v0.1 currently assumes USD.
6. Choose the initial maximum bid; the $250 staging setting is only a test ceiling.
7. Upgrade the production Neon resource from Free to a suitable paid production plan.
8. Complete Stripe business, payout, support, statement, receipt, Radar, and live-webhook configuration.
9. Restrict production project/provider access to the smallest necessary group.

**Codex**

1. Connect the approved domain to `startup-arena-prod` and verify canonical URLs.
2. Validate production configuration without exposing values.
3. Wire health, rollover, webhook, payment-failure, and no-active-battle signals into the selected monitoring destination.
4. Add retention/cleanup for expired sessions, magic links, and raw analytics after Chris approves the policy.
5. Update the operations runbook with the chosen boundary, contacts, alert paths, and escalation steps.

**Exit criteria**

- Production uses its own paid database, independent secrets, production sender/domain, production Turnstile keys, and live Stripe configuration.
- Preview and staging cannot access the production database.
- Health and lifecycle alerts reach a real person.
- Support ownership and escalation paths are documented.

### Phase C — Finish legal, policy, and trust gates

**Chris with qualified counsel**

- approve paid challenger placement as advertising and disclose the invited opening placements;
- define when bids become binding and how refunds, cancellations, failures, chargebacks, and disputes work;
- approve privacy, cookie/analytics, IP hashing, retention, deletion, and data-request language;
- define prohibited products, moderation appeals, founder representations, voting campaigns, and disqualification;
- decide governing law, liability limits, indirect-tax handling, and required support disclosures;
- define battle cancellation, replay, correction, and payment-dispute evidence procedures.

**Codex after decisions are approved**

- update public rules, terms, privacy, placement disclosures, and operator runbooks;
- add any product control needed to align actual behavior with the approved policy;
- verify invited and paid placements are accurately described everywhere they appear.

**Exit criteria**

- Final policies are published on the production domain and match product behavior.
- A monitored support channel and written moderation/incident procedure exist.
- Remaining counsel comments are resolved or explicitly accepted by Chris.

### Phase D — Prepare the opening participants

**Chris**

1. Submit Nexura through the production founder flow using the canonical `https://nexura.fyi/` destination and presentation assets Chris has the right to use.
2. Invite one founder to submit the opening challenger and agree to share the matchup.
3. Identify a third distinct approved startup for the first auction's fallback, unless an eligible fallback is already available.
4. Recruit or reach approved prospective bidders who are not Nexura or the opening challenger.
5. Prepare voter outreach for the opening battle.

**Codex**

- verify Nexura and the challenger are approved, safe to open, visually usable, and represented fairly;
- verify the fallback is approved and distinct from both active participants;
- prepare founder referral links, report access, and the opening-day operator checklist.

**Exit criteria**

- Nexura and the invited challenger are approved and ready.
- An eligible fallback is configured before the first auction closes.
- At least one operator is available during the opening auction settlement and rollover.

### Phase E — Instrumented production rehearsal

Keep Stripe in test mode during this rehearsal.

1. Create a temporary production rehearsal battle with approved rehearsal records, or use a pre-public accelerated rehearsal that is removed from the public launch schedule through normal admin controls.
2. Confirm email, Turnstile, voting, referral attribution, reporting, pause/resume, settlement, rollover, and alerts on the production domain.
3. Exercise successful capture, failed capture, duplicate webhook, retry, and refund/dispute tracing using test-mode provider records.
4. Confirm exactly one successor and one auction are produced.
5. Recheck provider access, database plan, backups, support routing, and the go/no-go checklist.

**Exit criteria**

- The production report matches controlled rehearsal traffic.
- Every critical alert reaches its destination.
- The payment and rollover matrix passes without a live charge.
- Chris explicitly authorizes the live Stripe cutover and paid launch.

### Phase F — Controlled paid launch

**Opening day**

- start Nexura versus the invited challenger;
- open the live paid auction for the following challenger slot;
- keep the configured conservative bid cap and $5 minimum;
- manually approve every bidding startup;
- confirm the wildcard before auction close;
- keep an operator available through settlement and rollover.

**Daily operations**

- verify both startup destinations, disclosures, and the next fallback before rollover;
- review suspicious votes, support messages, bids, and payment state;
- confirm exactly one battle and expected auction exist after rollover;
- send each founder their report and record satisfaction, useful downstream results, complaints, and willingness to participate again.

Pause paid bidding immediately for duplicate/incorrect charges, invalid matchups, silent alerts, unresolved manipulation, policy mismatch, disproportionate disputes, or traffic too weak to justify the placement.

### Phase G — Review after 7–14 days

Review:

- unique and returning visitors, verified vote conversion, and both-startup exploration;
- outbound traffic and founder-attributed referrals;
- eligible bidders, valid bids, auction fill, winning amount, and repeat bidding;
- cost per outbound click and founder-reported downstream value;
- failed payments, refunds, disputes, moderation, support load, and interventions.

Choose one outcome explicitly:

- **Continue** when founders receive meaningful traffic, auctions show real competition, and at least some founders participate again.
- **Adjust** when only the voter or founder side works. Change one major variable at a time and run another bounded period.
- **Pause or reposition** when traffic has little founder value, demand depends on launch novelty, or operating/payment burden is disproportionate.

Do not respond to weak validation by adding categories, comments, Elo, tournaments, subscriptions, investor tooling, or unrelated growth features.

## 6. Immediate next actions

1. **Chris:** restore the Vercel CLI session.
2. **Codex:** deploy `5e198dd` to staging and reconcile the controlled reporting flow.
3. **Chris:** choose analytics retention, production domain, monitoring/support destinations, UTC boundary, geography/currency, and initial bid cap.
4. **Chris:** invite the opening challenger founder and identify a third eligible fallback startup for day-two continuity.
5. **Codex and Chris:** complete production/legal gates and the instrumented production rehearsal before enabling live Stripe.
