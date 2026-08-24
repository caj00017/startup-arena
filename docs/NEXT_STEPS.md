# Startup Arena — Paid-First Launch Plan

**Status:** Staging reporting and leaderboard gates passed; production foundation is next

**Last reconciled:** August 24, 2026

**Objective:** Open with one invited matchup and live paid bidding after the remaining production, legal, operational, and cohort gates pass. There is no separate multi-battle free pilot.

## 1. Current checkpoint

The launch-blocking application hardening and real staging lifecycle rehearsal are complete. Staging has exercised:

- cross-device email authentication and Turnstile-protected mutations;
- startup submission, moderation, voting, and public battle rendering;
- Stripe test-mode payment-method setup, bidding, successful capture, and off-session failure;
- awarded, no-bid, wildcard, pause/resume, and operator-recovery paths;
- automatic Vercel Cron rollover, overlapping transition requests, and settlement idempotency.

Launch analytics and referral reporting are implemented, pushed on `main`, deployed, and reconciled on staging. The authenticated rehearsal moved unique visitors from 2 to 4, verified votes from 0 to 1, and explored-both visitors from 0 to 1. Each startup gained one outbound click, while the shared Bidder link gained one founder share, one unique referred visitor, and 100% referral vote conversion. Suspicious votes and operator interventions remained at zero. The extra two visitors are consistent with the signed-in owner opening the matchup to share it and a separate private visitor opening the referral.

The public crown-time leaderboard is also implemented and deployed. Staging derives Arena Challenger Test as the current leader and champion with four finalized wins, and its public startup profile shows the same crown-time and streak evidence. The calculation uses only durable startup/battle records and is independent of raw analytics.

The remaining launch sequence is:

```text
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

The visitor identifier is random and first-party and is persisted server-side only as a keyed hash. It contains no email address, startup ID, raw IP address, or third-party advertising identifier. The 30-day raw-event working rule below must be reconciled with the final moderation, dispute, and legal policy before public traffic.

### Leaderboard contract

The public leaderboard contains every approved startup with at least one finalized battle win. It ranks startups by **crown time**: cumulative elapsed arena time serving as defending champion after an earned win.

- Crown time is calculated from durable battle records, never visitor analytics.
- The opening seed battle does not count as earned crown time. A winner begins accumulating time when it returns in the successor matchup with `championStreakAtStart` greater than zero.
- Only elapsed, non-cancelled battle intervals count. A delayed successor starts at the later of its scheduled start and actual record creation, so downtime while no matchup exists is excluded.
- A short operator pause does not reset a reign.
- Ties are broken by total finalized wins, longest winning streak, earliest first win, and then startup name.
- The public row shows rank, startup, crown time, total wins, best streak, and current-champion status.

The leaderboard requires durable startup identity plus each battle's participant IDs, chain, scheduled interval, creation time, status, winner, final vote totals, streak-at-start, and finalization time. Those competition-ledger fields remain while Startup Arena operates and are not deleted with traffic analytics.

### Raw analytics inventory and working retention rule

The current raw `events` rows record event type, time, optional battle/startup/user references, a keyed anonymous visitor hash where relevant, and minimal source metadata. Event types currently used are battle impressions, founder shares, signed referral visits, outbound startup clicks, vote attribution, and startup submission. The separate `votes` table stores the voter and battle choice plus keyed IP/user-agent hashes for abuse review. Neither data set is needed to calculate the leaderboard.

The working product rule is to retain raw traffic events for **30 days after a battle ends**, or 30 days after creation when an event has no battle, and then delete them automatically. The eight-day browser visitor token remains unchanged. Individual vote and abuse-review records need a separately documented moderation/dispute cutoff before they can be reduced to the final vote totals already frozen on the battle. Auction, payment, tax, dispute, and security-audit records follow their own legally reviewed schedules and are not governed by the analytics window.

Before public launch, Codex must implement and rehearse the cleanup job, make report availability match the 30-day window, and update the privacy copy. The final policy remains subject to the approved launch geography and counsel review.

## 5. Chronological remaining work

### Phase A — Deploy and validate launch reporting — complete

- Controlled anonymous and authenticated traffic reconciled against the admin report.
- Owner-validated sharing, signed referral attribution, both-startup exploration, and verified-vote conversion behaved as defined.
- Founder account totals remained aggregate-only, while the authentication-protected admin report exposed battle-level operational evidence without raw identifiers or security fingerprints.
- Automated coverage continues to enforce battle/startup referral binding and owner-only share attribution.

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
4. Add retention/cleanup for expired sessions, magic links, and 30-day raw analytics after the remaining moderation/dispute policy is approved.
5. Update the operations runbook with the chosen boundary, contacts, alert paths, and escalation steps.

**Exit criteria**

- Production uses its own paid database, independent secrets, production sender/domain, production Turnstile keys, and live Stripe configuration.
- Preview and staging cannot access the production database.
- Health and lifecycle alerts reach a real person.
- Support ownership and escalation paths are documented.
- The public leaderboard is derived entirely from durable competition records and remains correct after raw analytics deletion.
- Automated cleanup removes expired authentication artifacts and raw analytics on schedule without changing battle outcomes or leaderboard rank.

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

1. **Chris:** choose analytics retention, production domain, monitoring/support destinations, UTC boundary, geography/currency, and initial bid cap.
2. **Chris:** invite the opening challenger founder and identify a third eligible fallback startup for day-two continuity.
3. **Codex and Chris:** complete the production/legal gates and instrumented production rehearsal before enabling live Stripe.
