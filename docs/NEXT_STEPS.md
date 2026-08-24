# Startup Arena — Launch Plan

**Status:** Staging lifecycle rehearsal complete; preparing the free public pilot

**Last reconciled:** August 24, 2026

**Objective:** Run a safe, measurable 5–7 battle free public pilot before making a separate decision about live payments.

## 1. Current checkpoint

The launch-blocking application hardening and real staging lifecycle rehearsal are complete. The current staging deployment has exercised:

- cross-device email authentication and Turnstile-protected mutations;
- startup submission, moderation, voting, and public battle rendering;
- Stripe test-mode payment-method setup, bidding, successful capture, and off-session failure;
- awarded, no-bid, wildcard, pause/resume, and operator-recovery paths;
- automatic Vercel Cron rollover, overlapping transition requests, and settlement idempotency.

The next milestone is not a paid launch. The remaining sequence is:

```text
Pilot metrics and referral reporting
        ↓
Public-launch foundation, policies, and cohort
        ↓
Instrumented production rehearsal
        ↓
5–7 battle free public pilot
        ↓
Evidence review
        ↓
Separate limited-paid-pilot decision
```

No live payment should be accepted without Chris's explicit authorization after the free-pilot review. The production Neon resource must also be upgraded from Free to a suitable paid production plan before any public launch, including the free pilot.

## 2. Ownership

### Codex owns

- repository changes, migrations, tests, deployment configuration, and technical runbooks;
- pilot analytics, referral attribution, and operator/founder reporting;
- technical monitoring hooks and validation of production configuration;
- staging and production deployment verification;
- translating approved legal and operational decisions into product copy and controls.

### Chris owns

- domains, provider accounts, billing, DNS, and secret entry;
- legal, tax, privacy, refund, dispute, and moderation policy decisions;
- the support channel, alert destination, launch geography/currency, bid cap, and UTC rollover boundary;
- startup recruitment, cohort selection, founder interviews, and daily pilot operations;
- the final decisions to start public traffic and, separately, to enable live payments.

Credentials belong only in provider-managed encrypted environment settings. They must not be pasted into chat, stored in Markdown, or committed to Git.

## 3. Free-pilot measurement contract

The free-pilot report must make the following metrics reproducible per battle. Unless stated otherwise, the report includes activity recorded from that battle's start through its end, so historical page visits cannot change a completed pilot result. Definitions are fixed here so implementation and launch review use the same denominators.

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

The visitor identifier must be random and first-party, and it must be persisted server-side only as a keyed hash. It must not contain an email address, startup ID, raw IP address, or third-party advertising identifier. Raw event retention and deletion are policy-dependent and are not finalized until Chris chooses the retention period.

Founder interviews capture the evidence that instrumentation cannot:

- traffic relevance and presentation fairness;
- whether losing still delivered useful promotion;
- founder satisfaction and willingness to participate again;
- a concrete dollar value, if any, for a future challenger slot;
- complaints, moderation burden, and useful downstream conversions founders voluntarily report.

### Free-pilot decision signals

The following are validation targets, not promises or substitutes for judgment:

- at least five battles finish reliably;
- both participants receive measurable outbound traffic in every battle;
- approximately 100 independent verified voters per battle is the early audience target;
- at least 10% seven-day visitor return is the early retention target;
- at least 20% of participating founders actively share their battle;
- at least two founders state a concrete willingness to pay;
- suspicious voting and daily operations remain manageable without ad hoc database repair.

Weak founder demand or audience retention stops the paid-pilot path even if the application is technically healthy.

## 4. Chronological remaining work

### Phase A — Build and validate pilot measurement

**Codex**

1. Replace IP-based impression counting with a random first-party anonymous visitor identifier while retaining the existing security fingerprint for abuse controls.
2. Record battle impressions, startup outbound clicks, shares, and founder-attributed referral visits against the same visitor identifier.
3. Add a per-battle admin report using the definitions in Section 3.
4. Add useful founder-visible battle traffic totals without exposing other users or security signals.
5. Add regression coverage for attribution, uniqueness, denominators, access control, and missing/invalid referral data.
6. Deploy the migration and reporting changes to staging, then compare the rendered report with controlled test traffic.

**Chris, in parallel**

1. Choose a raw analytics retention period and deletion-request policy.
2. Decide how the free pilot selects future challengers: operator-selected invitation/wildcard or clearly labeled platform credits. Public live-money bidding remains off.
3. Review the first staging report and confirm that it answers the founder interview and launch-decision questions.

**Exit criteria**

- A controlled staging visit, referral, two-startup exploration, vote, and share produce the expected report exactly once per defined visitor denominator.
- Founders see only their own useful traffic data; admins see battle-level operational metrics.
- No live payment can occur in the chosen free-pilot configuration.

### Phase B — Complete the public-launch foundation

**Chris**

1. Choose the production domain and configure DNS.
2. Choose and publish a monitored support/dispute address.
3. Choose an uptime/error alert destination.
4. Decide the permanent UTC rollover boundary.
5. Confirm the initial geography and USD-only currency scope, or approve a different supported scope.
6. Choose the initial paid-pilot maximum bid; the current staging ceiling is only a test setting.
7. Upgrade the production Neon resource from Free to a suitable paid production plan.
8. Restrict production provider and project access to the smallest necessary group and record ownership outside the repository.

**Codex**

1. Connect the approved domain to the production Vercel project and verify redirects/canonical URLs.
2. Validate production configuration without exposing values.
3. Wire health, rollover, webhook, payment-failure, and no-active-battle signals into the selected monitoring destination.
4. Add retention/cleanup for expired sessions, magic links, and raw analytics after the policy is approved.
5. Update the operations runbook with the chosen boundary, contacts, alert paths, and escalation steps.

**Exit criteria**

- Production uses its own paid database, secrets, sender/domain, Turnstile keys, and provider configuration.
- Preview and staging cannot access the production database.
- Health and lifecycle alerts reach a real person.
- The support route and ownership/escalation record are current.

### Phase C — Finish legal, policy, and trust gates

**Chris with qualified counsel**

- approve the description of paid challenger placement as advertising;
- define when bids become binding and how refunds, cancellations, failures, chargebacks, and disputes work;
- approve privacy, cookie/analytics, IP hashing, retention, deletion, and data-request language;
- define prohibited products, moderation appeals, founder representations, voting campaigns, and disqualification;
- decide governing law, liability limits, indirect-tax handling, and required support disclosures;
- define when a battle is cancelled, replayed, or corrected and what evidence is retained for a payment dispute.

**Codex after decisions are approved**

- update the public rules, terms, privacy policy, disclosures, consent/cookie behavior if required, and operator runbooks;
- add any product control required to make actual behavior match the approved policy;
- verify paid placement is clear anywhere an auction or resulting challenger appears.

**Exit criteria**

- Final policies are published on the production domain and match product behavior.
- A monitored support channel and written moderation/incident procedure exist.
- Remaining counsel comments are either resolved or explicitly accepted by Chris before public traffic.

### Phase D — Recruit and prepare the launch cohort

**Chris**

1. Recruit 8–12 founders with working products, clear pitches, usable presentation assets, and permission to share those assets.
2. Obtain agreement to share the matchup and participate in a short post-battle interview.
3. Select the opening champion, challenger, and at least one approved fallback for every planned rollover.
4. Maintain alternates for broken links, withdrawals, moderation failures, or scheduling conflicts.

**Codex**

- provide the submission, presentation, referral-link, and interview/report checklist;
- verify each scheduled startup is approved, public, safe to open, visually usable, and distinct from its opponent;
- prepare the operator schedule and battle-by-battle tracking sheet/report links.

**Exit criteria**

- At least five complete matchups can run without recruiting during an active battle.
- Every scheduled transition has an eligible fallback.

### Phase E — Instrumented production rehearsal

**Codex and Chris together**

1. Run one accelerated production rehearsal before inviting public traffic.
2. Confirm email authentication, Turnstile, voting, referral attribution, reporting, pause/resume, rollover, and alerts on the production domain.
3. Confirm the free-pilot configuration cannot create a live Stripe charge.
4. Exercise an operator recovery and document the elapsed time and report impact.
5. Recheck backups/provider access and capture a go/no-go checklist without secrets.

**Exit criteria**

- The report matches the rehearsal traffic.
- No critical alert is silent.
- There is exactly one active battle and one expected next-challenger path.
- Chris explicitly authorizes the start of the free public pilot.

### Phase F — Run the 5–7 battle free public pilot

**Daily before rollover — Chris**

- confirm both startup destinations work and disclosures are accurate;
- confirm the next eligible fallback/challenger is configured;
- review suspicious votes, support messages, and founder availability;
- remain reachable during rollover and record any manual intervention.

**Daily after rollover — Codex/technical review**

- confirm exactly one battle and expected next-challenger path exist;
- confirm reports, alerts, and referral attribution are updating;
- investigate technical anomalies and ship only fixes needed for safety, reliability, or measurement integrity.

**After each battle — Chris**

- send each founder their report;
- conduct the short founder interview;
- record sharing, satisfaction, willingness-to-pay, complaints, and reported downstream value.

Do not add categories, comments, Elo, tournaments, subscriptions, investor tooling, native apps, or unrelated growth features during the bounded pilot.

### Phase G — Review evidence and make a paid-pilot decision

At the end of 5–7 battles, Chris and Codex review the Section 3 metrics, interviews, support load, fraud rate, and operational interventions.

Choose one outcome explicitly:

- **Continue to paid-pilot preparation** only if founders receive meaningful traffic, the audience returns, at least two founders name a concrete willingness to pay, and operations remain trustworthy.
- **Adjust and rerun a bounded free pilot** if only one side of the audience/founder loop validates. Change one major variable at a time.
- **Stop or reposition** if traffic has little founder value, engagement depends on launch novelty, or the operating burden makes a daily marketplace unattractive.

### Phase H — Limited paid pilot, only after separate authorization

If Chris explicitly approves live payments after the evidence review:

- complete Stripe business/payout settings, Radar choices, receipts, support details, and live webhooks;
- run the refund, duplicate-webhook, dispute-trace, and live-alert matrix before opening bidding;
- begin at the documented $5 minimum and approved conservative cap;
- run one battle and auction per day with manual startup approval and an operator available at settlement;
- pause immediately for duplicate/incorrect charges, invalid matchups, unresolved manipulation, policy mismatch, disproportionate disputes, or traffic too weak to justify the auction.

The paid pilot should run for 7–14 days or until there is enough evidence about valid bidders, repeat bidders, winning bid trend, cost per outbound click, useful founder outcomes, and payment/support burden.

## 5. Immediate next actions from this checkpoint

1. **Codex:** implement the Phase A reporting/referral slice and validate it locally.
2. **Chris:** choose the raw analytics retention period and the free-pilot challenger mechanism.
3. **Chris:** begin the production domain, monitoring destination, support address, and legal-review work in parallel.
4. **Codex and Chris:** deploy and rehearse measurement on staging before scheduling public traffic.
