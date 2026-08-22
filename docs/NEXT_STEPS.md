# Startup Arena — Next Steps Plan

**Status:** Ready to begin production setup  
**Planning date:** August 21, 2026  
**Objective:** Move the working local v0.1 into a safe, measurable paid pilot without expanding the product prematurely.

## 1. Immediate strategy

The next milestone is not a larger feature set. It is a production-quality experiment that answers:

> After seeing measurable traffic from Startup Arena, will founders compete with real money for the next battle?

The launch sequence is:

```text
Production foundation
        ↓
Staging integrations
        ↓
Full lifecycle rehearsal
        ↓
Free public battles
        ↓
Limited paid pilot
        ↓
Evidence-based product decision
```

No live payment should be accepted until the staging, operational, and legal gates below are complete.

## 2. Human decisions and accounts required

These items require the operator because they involve account ownership, identity verification, billing, legal authority, or business judgment.

| Requirement | Decision or action |
|---|---|
| Domain | Choose the production domain and control its DNS |
| Hosting | Choose a Next.js-compatible production host |
| Database | Create a managed PostgreSQL database |
| Stripe | Create/verify the business account, payout account, and public business details |
| Email | Create a Resend account and verify the sending domain |
| Bot protection | Create Cloudflare Turnstile keys for the production domain |
| Monitoring | Choose an uptime/error alert destination |
| Legal | Obtain review of terms, privacy, refund, auction, and advertising language |
| Support | Choose a monitored support and dispute email address |
| Launch cohort | Recruit the first approved founders and select the opening matchup |

Credentials must be entered directly into the hosting provider's encrypted environment settings. They must never be pasted into chat, stored in Markdown, or committed to Git.

## 3. Phase 1 — Production foundation

### Work

- Register or connect the production domain.
- Create separate staging and production hosting environments.
- Create separate staging and production PostgreSQL databases.
- configure every non-secret value from `.env.example`;
- generate unique secrets for sessions, cron authentication, and IP hashing;
- run database migrations against staging;
- deploy the current build to staging;
- verify `/api/health` reports a connected database;
- configure deployment logs and basic uptime monitoring;
- document who has access to hosting, database, DNS, and secrets.

### Recommended separation

- Staging uses Stripe test mode, a staging database, and a non-production email sender.
- Production uses Stripe live mode, its own database, independent secrets, and the real domain.
- Never point preview deployments at the production database.

### Exit criteria

- Staging deploys from a clean checkout.
- `npm run db:migrate` succeeds against managed PostgreSQL.
- `/`, `/signin`, `/rules`, and `/api/health` return successfully.
- A deployment restart does not lose data.
- No development fallback is active in the production configuration.

## 4. Phase 2 — Authentication and abuse protection

### Email

- Verify the sending domain in Resend.
- Configure `RESEND_API_KEY` and `EMAIL_FROM` in staging.
- Request and consume a real magic link.
- Confirm expired and reused links fail.
- Verify common inbox placement, including Gmail and Outlook.
- Add a monitored reply/support address.

### Turnstile

- Create staging and production Turnstile site keys.
- Configure client and server keys.
- Verify valid sign-in, voting, and submission requests.
- Confirm invalid or missing production challenges are rejected where required.

### Security review

- Verify admin access is restricted to `ADMIN_EMAILS`.
- Rotate any accidentally exposed development credentials.
- Confirm cookies are secure, HTTP-only, and same-site in production.
- Test startup URLs for blocked non-HTTP protocols.
- Review rate limits with expected launch traffic.
- Add alerts for unusual vote spikes and repeated authentication requests.

### Exit criteria

- Real email authentication works end to end in staging.
- A user can vote once but cannot vote twice.
- A non-admin cannot access admin operations.
- Turnstile and rate limits reject deliberately invalid requests.

## 5. Phase 3 — Stripe test-mode integration

### Stripe account configuration

- Complete business identity and payout verification.
- Configure business name, support contact, statement descriptor, and receipt settings.
- Decide the accepted currency and launch geography. v0.1 currently assumes USD.
- Configure Stripe Radar defaults appropriate for online advertising purchases.
- Register the staging webhook endpoint:

```text
https://staging-domain.example/api/payments/webhook
```

- Subscribe to:

```text
checkout.session.completed
payment_intent.succeeded
payment_intent.payment_failed
```

- Set staging Stripe secret, publishable, and webhook keys.

### Required payment test matrix

| Scenario | Expected result |
|---|---|
| Payment method setup succeeds | Founder becomes eligible to bid |
| Payment setup is cancelled | No verified method is stored |
| Founder places a valid bid | Bid appears publicly; no charge occurs yet |
| Founder is outbid | Losing founder is not charged |
| Winning auction settles | Exactly the winning amount is captured once |
| Winning payment fails | Bid is marked failed and next candidate is attempted |
| Webhook is delivered twice | Second delivery has no duplicate effect |
| Rollover is retried | No duplicate charge or battle is created |
| Startup Arena cancels delivery | Operator can identify and refund the exact payment |
| Charge is disputed | Operator can identify the bid, battle, founder, and logs |

Use Stripe's test cards to cover success, decline, authentication, and off-session failure behavior.

### Additional safety decision

Set a conservative maximum bid for the first paid pilot—recommended: **$100–$250**—even if the API technically supports a higher value. Raising the cap later is easier than handling an unexpectedly large disputed first-week charge.

### Exit criteria

- Every test scenario has a recorded result.
- A winning bid produces one Stripe PaymentIntent and one scheduled challenge.
- Losing bidders have no charge.
- Failed payments fall through correctly.
- A test refund is completed and documented.
- Stripe webhook failures trigger an alert.

## 6. Phase 4 — Scheduling and operational rehearsal

### Work

- Configure the scheduler to call `/api/cron/rollover` every five minutes.
- Store `CRON_SECRET` in both the scheduler and application environment.
- Confirm unauthenticated cron requests fail.
- Set the first production battle for midnight UTC or explicitly choose another permanent boundary.
- Add alerts for:
  - no active battle;
  - auction not settled 15 minutes after close;
  - battle not finalized 15 minutes after end;
  - payment failure;
  - webhook errors;
  - unhealthy database.
- Rehearse wildcard selection before auction close.
- Rehearse pause/resume and admin rollover recovery.

### Full lifecycle rehearsal

Run at least three accelerated or manually timestamped staging days:

1. Champion wins and remains.
2. Challenger wins and becomes champion.
3. Auction receives no payable bid and uses the wildcard.

At least one rehearsal should include a payment failure and one should repeat the rollover request.

### Exit criteria

- Three complete staging cycles finish without direct database editing.
- An operator can recover a failed transition using documented admin controls.
- The next battle always contains two different approved startups.
- Alerts reach a real person.

## 7. Phase 5 — Legal, policy, and trust gate

Before accepting real money, qualified counsel should review:

- whether the challenger mechanism is correctly described as paid advertising placement;
- auction terms and when a bid becomes binding;
- refunds, cancellations, payment failure, chargebacks, and disputes;
- clear paid-placement disclosure;
- privacy, cookies, analytics, IP hashing, retention, and deletion requests;
- prohibited products and moderation authority;
- founder representations about submitted trademarks, images, and product claims;
- voting campaigns, automation, paid votes, and disqualification;
- governing law, liability limits, and support contact;
- whether sales tax or other indirect tax obligations apply.

Operational policy must also define:

- what qualifies as a functioning startup;
- who may bid on behalf of a startup;
- how long moderation appeals take;
- when a battle is cancelled or replayed;
- how a finalized result may be corrected;
- what evidence is retained for a payment dispute.

### Exit criteria

- Final terms and privacy policy are published.
- The refund and cancellation policy matches actual product behavior.
- Paid challenger placement is clearly disclosed.
- A monitored support channel is published.
- Admins have a written moderation and incident procedure.

## 8. Phase 6 — Free public pilot

### Cohort

Recruit 8–12 startups that have:

- working public products or credible demos;
- easy-to-understand pitches;
- visually presentable cards;
- reasonably comparable target users;
- founders willing to share their battle;
- permission to use their submitted brand assets.

Run the first 5–7 battles without real charges. Use invitation or platform credits while keeping the auction visible if useful for testing behavior.

### Track per battle

- unique visitors;
- verified votes;
- vote conversion rate;
- returning voter rate;
- outbound clicks to each startup;
- percentage of voters who explore both startups;
- founder shares and referred visits;
- founder satisfaction and willingness to compete again;
- suspicious/invalid vote rate;
- operational interventions required.

### Founder interview questions

- Was the traffic relevant?
- Did voters understand the product?
- Was the card presentation fair?
- Did losing still provide promotional value?
- What would make the founder compete again?
- What was the slot worth to them in dollars?

### Exit criteria

- At least five battles finish reliably.
- Both participants receive measurable outbound traffic.
- Founders actively share matchups.
- At least two founders state a concrete willingness to pay.
- Vote fraud and moderation remain operationally manageable.

If people do not return or founders do not value the traffic, pause payment activation and improve the battle experience or audience quality.

## 9. Phase 7 — Limited paid pilot

### Launch constraints

- Start at the documented $5 minimum.
- Apply the initial bid cap chosen in Phase 3.
- Run one battle and one auction per day only.
- Keep categories disabled.
- Require manual approval for every bidding startup.
- Require a wildcard before each auction closes.
- Have an operator available during auction settlement and battle rollover.
- Keep Stripe live-mode access limited to the smallest necessary team.

### Pilot duration

Run the paid pilot for 7–14 days or until there are enough auctions to evaluate repeat demand.

### Primary evidence

- auctions with at least two valid bidders;
- repeat bidders;
- repeat participating founders;
- winning bid trend;
- cost per outbound click;
- founder-reported conversion or useful discovery;
- refunds, disputes, payment failures, and moderation burden;
- voter return rate independent of founder campaigns.

### Stop conditions

Pause live bidding if:

- a duplicate or incorrect charge occurs;
- rollover creates an invalid matchup;
- vote manipulation cannot be resolved consistently;
- founders misunderstand what a bid purchases;
- refund or legal language conflicts with operations;
- payment disputes become disproportionate;
- traffic quality is too low to justify the auction.

## 10. Phase 8 — Post-pilot decision

At the end of the pilot, choose one outcome explicitly.

### Continue

Continue when founders receive meaningful traffic, auctions show competition, and at least some founders bid again.

Potential next investments:

- managed logo/screenshot uploads;
- automated founder battle and result emails;
- shareable battle/result images;
- richer per-battle analytics;
- improved vote anomaly reports;
- conversion callbacks or founder-provided campaign attribution.

### Adjust

Adjust when voters engage but founders will not pay, or founders bid but voters do not return. Change one side of the loop at a time and run another bounded pilot.

### Stop or reposition

Stop or reposition when the product depends entirely on launch novelty, traffic provides little founder value, or auction demand disappears after free participation ends.

Do not respond to weak validation by adding categories, comments, Elo, tournaments, mobile apps, or investor tooling.

## 11. Suggested four-week sequence

| Week | Target |
|---|---|
| 1 | Hosting, PostgreSQL, staging deploy, email, Turnstile |
| 2 | Stripe test mode, webhooks, payment matrix, scheduler, operational rehearsals |
| 3 | Legal/policy completion, founder recruitment, first free public battles |
| 4 | Finish free pilot, review metrics, decide whether to begin limited paid pilot |

The schedule should move more slowly if legal review, Stripe verification, or lifecycle testing is incomplete. Those are launch gates, not administrative formalities.

## 12. First action checklist

The immediate operator actions are:

1. Choose the hosting and managed PostgreSQL providers.
2. Confirm the production domain.
3. Create Stripe and Resend accounts.
4. Choose the admin and support email addresses.
5. Recruit the first 8–12 founders.
6. Decide the initial maximum bid and permanent daily UTC boundary.
7. Begin legal review.

Once the hosting project and database exist, the next engineering task is the staging deployment and real-email configuration—not another product feature.
