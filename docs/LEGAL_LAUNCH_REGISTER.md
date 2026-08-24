# Startup Arena — Legal and Privacy Launch Register

**Status:** Working legal-review packet; not legal advice

**Last reviewed:** August 24, 2026

This is the single working record of the legal, privacy, payment, advertising, and trust questions Chris should understand before authorizing a public paid launch. It describes the product as built, records approved operational choices, and identifies decisions that still need qualified counsel or tax advice. It is not a substitute for advice tailored to Startup Arena's legal entity, launch geography, users, or transactions.

## 1. Product facts counsel should evaluate

- Startup Arena publishes one startup matchup at a time. Verified users vote, and the winner becomes or remains champion.
- Founders bid in a public auction for the right to appear as a future challenger. The winning eligible bid is charged after the auction closes. Payment buys placement, not votes, an endorsement, a guaranteed audience, or a guaranteed win.
- The opening positions are invited rather than auction-earned: Chris's Nexura is the opening champion and one invited founder supplies the opening challenger.
- Startup names, submitted descriptions and media, destination links, matchup history, final vote totals, auction activity, results, and leaderboard records may be public.
- Accounts use verified email. Stripe receives payment details directly; Startup Arena stores Stripe identifiers rather than full card numbers.
- The service uses Cloudflare Turnstile for bot protection and first-party, pseudonymous traffic measurement. Voting records contain keyed IP and optional user-agent hashes for duplicate-vote and abuse review, not the raw values.
- Vercel, Neon, Resend, Stripe, and Cloudflare are the currently planned production providers. Their contracts, data locations, subprocessors, security terms, and deletion behavior must be reviewed for the chosen launch geography.
- The public leaderboard is based on durable final battle records. It does not require raw visitor analytics or individual votes.

### Approved business defaults awaiting final implementation/legal validation

- Canonical production domain: `https://startuparena.io`.
- Initial launch scope: U.S. participants and USD. Counsel must approve the eligibility language and whether technical geographic enforcement is required; a marketing statement alone does not prevent access from elsewhere.
- Minimum account age: 18. The final Terms, account flow, and enforcement still need to match this choice.
- Daily boundary: 00:00 UTC; the auction closes at 23:00 UTC.
- Maximum accepted bid: $250, with the existing $5 opening minimum and $1 increment.
- Refund position: a winning payment is final once its battle is scheduled, except Startup Arena refunds a placement it cancels and does not deliver. Counsel must validate the complete cancellation, delay, replay, failure, and chargeback treatment.
- Placement labels: “Paid challenger” for an auction-earned placement and “Invited opening placement” for Nexura and the first challenger. Wildcard/fallback placements must not be mislabeled as paid.
- One monitored mailbox may initially receive support, privacy, moderation, dispute, accessibility, and operational alerts. The actual address and escalation owner remain to be configured.

## 2. Approved data-retention schedule

| Record | Purpose | Approved or working period | What happens at expiry |
|---|---|---|---|
| Browser visitor token | Unique and returning visitor measurement | Up to 8 days in an HTTP-only first-party cookie | Browser expires it; the raw server event follows the 30-day rule below |
| Raw traffic events and keyed visitor hashes tied to a battle | Founder delivery reporting and launch analysis | 30 days after the battle is finalized or cancelled | Automatically deleted |
| Raw events without a battle | Submission and unassociated traffic operations | 30 days after event creation | Automatically deleted |
| Individual votes and keyed IP/user-agent hashes | Duplicate-vote prevention, moderation, and result complaints | 30 days after the battle is finalized or cancelled | Automatically deleted; the frozen final totals and winner remain |
| Magic-link records | One-time email verification | 15 minutes | Automatically deleted after expiry |
| Login sessions | Account authentication | 30 days unless signed out earlier | Automatically deleted after expiry |
| Final battle fields | Public result and crown-time leaderboard | While Startup Arena operates, subject to the final account/deletion policy | Retained: participants, schedule, status, final totals, winner, streak, and finalization time |
| Startup and account records | Submission ownership, moderation, and service access | Not yet finalized | Counsel must define closure, deletion, correction, and public-record treatment |
| Bids, Stripe references, refunds, chargebacks, tax support, and dispute evidence | Transaction fulfillment and legal/accounting support | Not yet finalized; expressly outside the 30-day analytics cleanup | Set with counsel/accountant after geography and entity are chosen |
| Audit logs and processed-webhook IDs | Security, operator accountability, and payment idempotency | Not yet finalized; expressly outside the 30-day analytics cleanup | Set by event category rather than retaining every audit event forever |
| Database backups and provider logs | Recovery, security, and provider operations | Provider-dependent | Confirm roll-off periods and ensure deleted live data ages out of backups and logs |

The automated cleanup runs after the authenticated scheduled rollover. An expired report says that its source data is no longer retained instead of showing misleading zero totals. Founder startup cards use durable crown time rather than a shrinking “all-time clicks” number.

The 30-day choice is an operational policy, not a universal period supplied by law. It is based on the limited fraud-review and reporting purpose and must still be checked against the final launch geography. Regulators generally expect a purpose-specific, documented period and deletion when that purpose ends; a keyed hash remains pseudonymous data, not necessarily anonymous data.

## 3. Must resolve before accepting live payments

### Contracting identity and acceptance

- Identify the legal entity operating Startup Arena, its legal and trade names, business address, and support contact.
- Have counsel approve Terms, Privacy, Rules, and the paid-placement/refund policy under that entity and the chosen governing law.
- Decide where affirmative acceptance is required. At minimum, counsel should evaluate click-through acceptance when submitting a startup, saving a payment method, and placing a binding bid; retain the accepted policy version and timestamp if required.
- State that founders have authority to bind the startup and that voters meet the chosen age and eligibility requirements.

### Paid and invited placement disclosure

- Label an auction-earned challenger close to the startup card with clear text such as “Paid challenger” or “Paid placement.” Do not rely on “promoted,” an icon, or a disclosure elsewhere on the page.
- Label Nexura and the opening challenger as invited opening placements. Explain that they did not win an earlier auction because none existed.
- Repeat the commercial-nature disclosure anywhere the placement is materially represented, including matchup, auction, rules, and share-preview contexts where appropriate.
- Never imply that Startup Arena independently selected a paid challenger on merit, endorsed it, or sold votes. The public winner is a community battle result, not an objective “best startup” claim.

The FTC evaluates the overall impression and says native advertising disclosures should be clear, prominent, understandable, and close to the content they qualify. The current draft wording is a product proposal; counsel must approve its exact use.

### Auction, payment, cancellation, and dispute terms

- Define exactly when a bid becomes binding, what the bidder is buying, auction close and tie rules, bidder eligibility, maximum bids, and how a saved payment method is used off-session.
- Define outcomes for payment failure, no eligible bid, operator cancellation, delayed or cancelled battles, destination outages, fraud, disqualification, duplicate charges, refunds, chargebacks, and force-majeure/provider failures.
- State what traffic or reporting is and is not promised. Do not guarantee impressions, clicks, votes, conversions, revenue, or a particular slot if the rules allow cancellation or rescheduling.
- Decide whether a corrected or replayed battle changes the paid placement, crown-time record, or refund. Align the operator controls with that answer.
- Ask counsel whether the auction format, community voting, or any founder/voter incentive triggers auction, contest, sweepstakes, gambling, commercial co-venture, or promotional laws in each launch jurisdiction. Do not add random prizes or pay-to-vote mechanics without a new review.
- Complete Stripe business identity, receipt, statement-descriptor, customer-support, Radar, refund, and live-webhook configuration. Provider approval does not replace legal review.

### Privacy notice and individual rights

- Publish a final notice that accurately lists collected data, purposes, legal bases where applicable, public fields, providers/categories of recipients, retention, international transfers, security approach, rights, and a monitored contact.
- Determine which state, federal, and international privacy laws apply based on business size, geography, targeting, and actual users. Avoid claiming CCPA/GDPR compliance merely because the product follows some of their principles.
- Document a request workflow for access, correction, deletion, and appeal: intake channel, identity verification, response owner, deadline tracking, search locations, provider requests, exceptions, and completion evidence.
- Decide how an account deletion request affects public startup identity, final results, bids, audit evidence, and the foreign-key ownership record. Prefer de-identifying an owner where lawful over erasing truthful public competition history, but have counsel approve the rule and disclosure.
- Confirm that Startup Arena does not sell or share personal information for cross-context behavioral advertising. If the product or providers change, reassess notices, contracts, and opt-out signals before adding the new use.
- Review cookie/storage consent requirements before serving the EU, UK, or other consent jurisdictions. “First-party” and “analytics” do not by themselves settle whether consent is required.

### Age and children

- Implement and enforce the approved 18+ account rule; have counsel approve the representation and any age-verification expectations.
- Do not knowingly collect personal information from children under 13 without a COPPA review and the required parental notice/consent controls. Passive identifiers and public submissions can count as collection.
- If teens may vote, counsel should review state privacy rules, public-record implications, marketing, and consent language.

### Startup content, claims, links, and intellectual property

- Require founders to represent that submitted text, logos, screenshots, videos, names, and links are accurate, lawful, non-infringing, and authorized for Startup Arena to host, resize, display, and promote.
- Define prohibited products and claims, malware/phishing response, impersonation review, trademark/copyright complaints, takedown, repeat abuse, and appeal procedures.
- State that Startup Arena does not verify every founder claim and is not responsible for third-party destinations, without using that disclaimer as a substitute for reasonable moderation.
- Decide whether a DMCA agent/safe-harbor process is appropriate for the amount and kind of user-submitted content.

### Voting integrity and result complaints

- Publish voter eligibility, one-vote rules, permitted founder campaigning, prohibited automation/purchased votes/vote farms, moderation authority, tie handling, and consequences.
- Keep the operator review queue and raw fraud evidence available during the 30-day window. Define a monitored complaint route and what evidence a complainant must provide.
- Define whether a result becomes final immediately for public display but remains correctable for 30 days, and what notice is shown if a finalized result is corrected. There is no dedicated appeals feature today.
- After individual votes are deleted, investigate only from durable totals/audit/provider evidence and do not imply that a vote-level reconstruction remains possible.

### Financial records and tax

- Engage an accountant for entity, income-tax, sales-tax/VAT/GST, marketplace-facilitator, invoicing, nexus, and information-reporting questions. A challenger placement may be treated as advertising or another digital service differently by jurisdiction.
- Create a financial retention schedule from the actual return, limitations, chargeback, and provider requirements. The IRS says records should be kept as long as needed to substantiate income or deductions; this is why payment records are not part of the 30-day raw-analytics deletion.
- Reconcile Stripe payouts, fees, refunds, disputes, and the application's bid/payment state. Limit database access and never store full card data.

### Email and outreach

- Keep magic-link and service emails transactional and accurate.
- Treat founder invitations, launch announcements, and promotional digests as potentially commercial email. Review CAN-SPAM requirements for truthful routing/subjects, ad identification where required, a valid postal address, opt-out, timely suppression, and vendor monitoring.
- Maintain a suppression record if marketing begins; do not delete it in a way that causes future mail to someone who opted out.

### Accessibility and nondiscrimination

- Test keyboard navigation, focus, labels and errors, heading structure, contrast, zoom/reflow, screen-reader output, reduced motion, and media alternatives. Automated checks alone are insufficient.
- Choose a documented technical target such as WCAG 2.2 AA and provide a monitored accessibility contact. Counsel should assess ADA and state-law applicability to the final business and geography.

### Security, incidents, and providers

- Maintain least-privilege provider and admin access, strong unique secrets, environment separation, encryption in transit/at rest, dependency updates, backups, restoration tests, and logging that avoids secrets and raw identifiers.
- Write an incident plan covering detection, containment, evidence preservation, provider escalation, counsel/insurance contact, affected-data analysis, jurisdiction-specific notice deadlines, and user communication.
- Inventory provider contracts and data processing terms. Confirm deletion/backups, breach notice, subprocessors, cross-border transfers, availability, export, and account-closure behavior.
- Decide whether cyber, technology errors-and-omissions, media, or general liability insurance is appropriate.

## 4. Product changes likely after legal decisions

- Versioned acceptance controls for Terms/Rules/Privacy on founder submission, payment setup, or bid placement as counsel directs.
- Visible “Paid challenger” and “Invited opening placement” labels in every required context.
- Final support, privacy-rights, moderation, dispute, and accessibility contact paths.
- Final bid/refund/cancellation/result-correction copy and any audited refund or replay control.
- An account/data-request workflow, including an approved way to preserve public competition history while deleting or de-identifying account data.
- Geography/age enforcement and cookie consent controls if the approved launch scope requires them.
- Category-specific financial, audit, webhook, provider-log, and backup retention schedules.

## 5. Counsel decision sheet

| Decision | Current state | Owner |
|---|---|---|
| Operating entity, legal name, address | Open | Chris/counsel |
| Production domain | `startuparena.io` selected; Vercel/Porkbun configuration pending | Chris/Codex |
| Monitored support/privacy/alert address | One-mailbox approach approved; actual address pending | Chris |
| Launch countries/states and USD scope | U.S./USD approved as business default; eligibility/enforcement needs review | Chris/counsel/accountant |
| Minimum voter/founder age | 18+ approved; implementation/legal wording pending | Chris/counsel/Codex |
| Binding-bid moment and policy acceptance evidence | Open | Counsel/Codex |
| Refund, cancellation, replay, correction, and chargeback policy | Cancellation-only refund default approved; edge cases need counsel | Chris/counsel |
| Paid and invited placement labels | “Paid challenger” / “Invited opening placement” approved; implementation pending | Counsel/Codex |
| Vote complaint and result-finality policy | 30-day evidence window approved; correction procedure open | Chris/counsel |
| Account deletion and public-history treatment | Open | Counsel/Codex |
| Financial/payment/tax retention | Open | Accountant/counsel |
| Audit/webhook/security-evidence retention | Open | Counsel/Codex |
| Cookie consent and privacy-rights scope | Depends on geography | Counsel |
| Governing law, venue, liability, indemnity, dispute resolution | Open | Counsel |

## 6. Repository evidence for review

- Public operational drafts: `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, and `src/app/rules/page.tsx`.
- Data fields and relationships: `src/db/schema.ts` and `docs/ARCHITECTURE.md`.
- Retention rules and cleanup: `src/services/retention.ts` and `src/app/api/cron/rollover/route.ts`.
- Voting and fraud handling: `src/services/voting.ts`, `src/services/rollover.ts`, and `src/app/admin/moderation/page.tsx`.
- Auction/payment behavior: `src/services/auction.ts`, `src/lib/payments.ts`, and `src/services/rollover.ts`.
- Reporting and leaderboard: `src/services/analytics.ts` and `src/lib/leaderboard.ts`.
- Operational recovery: `docs/OPERATIONS.md`.

## 7. Authoritative starting references

These are starting points, not an exhaustive legal analysis, and some apply only if Startup Arena or its users meet their scope.

- [FTC — Protecting Personal Information: A Guide for Business](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business): collect only what is needed, document retention, restrict access, and dispose securely.
- [FTC — Native Advertising: A Guide for Businesses](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses): commercial content must not mislead users about its nature; necessary disclosures should be clear and prominent.
- [FTC — CAN-SPAM Act: A Compliance Guide for Business](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business): rules for commercial email, including B2B messages.
- [FTC — COPPA Six-Step Compliance Plan](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business): coverage and controls when collecting personal information from children under 13.
- [California Attorney General — CCPA overview](https://oag.ca.gov/privacy/ccpa): consumer notice, access, correction, deletion, opt-out, and nondiscrimination rights for covered businesses.
- [California Privacy Protection Agency — Data Minimization Enforcement Advisory](https://cppa.ca.gov/pdf/enfadvisory202401.pdf): assess collection, use, retention, and sharing against specific purposes.
- [European Commission — GDPR principles](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en): purpose limitation, data minimization, storage limitation, security, and accountability when applicable.
- [UK ICO — Storage limitation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/): justify and document periods, review data, and erase or anonymize when no longer needed.
- [IRS — Recordkeeping](https://www.irs.gov/businesses/small-businesses-self-employed/recordkeeping): preserve records long enough to substantiate income and deductions.
- [U.S. Department of Justice — Guidance on Web Accessibility and the ADA](https://www.ada.gov/resources/web-guidance/): accessibility considerations for businesses offering services on the web.

## 8. Maintenance rule

Update this register whenever the product changes what it collects, publishes, sells, promises, or sends; whenever a provider or geography changes; and whenever counsel approves or rejects a listed choice. Do not silently turn a working assumption into public policy. The deployed Terms, Privacy, Rules, controls, provider settings, support process, and operator behavior must all match.
