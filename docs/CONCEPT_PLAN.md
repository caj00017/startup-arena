# Startup Arena — Concept Plan

> Historical concept document. The implemented scope is defined in `V0.1_PLAN.md`.

**Working domain:** `startuparena.io`  
**Working name:** Startup Arena  
**Status:** Early concept / pre-MVP  
**Core idea:** Gamify startup advertising by turning paid promotion into competitive, community-voted startup battles.

---

## 1. Executive Summary

Startup Arena is a competitive startup discovery platform where founders compete for attention rather than simply buying static ads.

The core product is a recurring startup battle:

1. Two startups are placed head-to-head.
2. Visitors explore both products and vote for the one they would rather use.
3. The winner earns free promotion, ranking benefits, and potentially remains champion.
4. Founders bid for the right to become a future challenger.
5. The process repeats, producing an ongoing game that people can visit for entertainment, discovery, and startup research.

The central thesis is:

> People visit because the site is a game. Founders pay because people visit the site.

Instead of hiding ads inside unrelated content, the ads themselves become the content.

---

## 2. Problem

AI has dramatically lowered the barrier to building and launching software.

It has **not** lowered the barrier to distribution nearly as much.

A growing number of founders can now:

- build an MVP quickly;
- launch with a small team or alone;
- iterate rapidly;
- create polished landing pages and demos;
- ship multiple products per year.

But many immediately hit the same bottleneck:

> "How do I get my first 10, 100, or 1,000 users?"

Existing options often have weaknesses:

- startup directories feel passive and oversaturated;
- generic ad platforms require targeting knowledge and meaningful budgets;
- Product Hunt is highly launch-day oriented;
- social media reach is inconsistent;
- founder communities can become self-promotional;
- sponsorships can be expensive without clear engagement;
- many directories have little reason for non-founders to return.

Startup Arena attempts to solve the distribution problem by making startup promotion itself entertaining.

---

## 3. Core Product Thesis

Startup Arena should be thought of as:

> **A competitive startup discovery platform with an advertising marketplace underneath it.**

It should **not** feel primarily like:

> "A website where founders pay to list their startups."

The visible product is competition, discovery, rankings, streaks, and voting.

The monetization layer is access to that attention.

### Core Rule

> **Money buys entry, not victory.**

Founders can pay for a chance to compete.

They cannot buy:

- votes;
- vote weighting;
- guaranteed wins;
- hidden ranking boosts;
- favorable match outcomes.

Once a startup enters the arena, the community decides the result.

This rule should be central to the product's identity and trust model.

---

## 4. Core Game Loop

### Daily Battle

Each category has an active battle.

Example:

> **Developer Tools Arena**  
> Startup A vs. Startup B  
> "Which would you rather use?"

Visitors can:

1. view each startup's card;
2. visit each startup;
3. watch a short demo;
4. compare the products;
5. cast one vote;
6. see the live or final result.

### Winner

The winner may:

- retain the title of category champion;
- advance automatically into the next battle;
- increase its win streak;
- receive free site-wide promotion;
- gain ranking points;
- earn a permanent battle history entry;
- receive a "Startup Arena Champion" badge;
- receive social/newsletter promotion later.

### Challenger

The next challenger is selected from founders bidding for an upcoming slot.

A possible model:

1. Founders submit their startup to a category.
2. Approved startups may bid for the next challenger position.
3. Highest qualifying bid when the auction closes becomes the next challenger.
4. The challenger cannot pay to affect voting after entering.

### Winner-Stays-On Model

Preferred early mechanic:

> **The winner remains champion until defeated.**

This creates:

- streaks;
- rivalries;
- upset wins;
- anticipation;
- recurring storylines;
- stronger incentive to challenge dominant startups.

Example:

> AcmeAI — 7-day champion  
> Tomorrow: AcmeAI vs. BuildBot

The question becomes:

> "Can BuildBot dethrone AcmeAI?"

That is more engaging than two unrelated startups resetting every day.

---

## 5. Categories

Categories make Startup Arena useful as a discovery engine rather than only a daily game.

Potential launch categories:

- AI
- Developer Tools
- Cybersecurity
- Productivity
- Consumer Apps
- Business / SaaS
- Creator Tools
- Fintech

Do **not** launch with too many categories.

A dead category is worse than no category.

Initial MVP may launch with:

- one global arena; or
- 3–5 broad categories.

Categories can expand based on submission volume.

### Category Pages

Example:

`startuparena.io/cybersecurity`

A category page could show:

- current champion;
- current battle;
- challenger auction;
- top-ranked startups;
- longest win streak;
- recent battles;
- all-time champions;
- startup directory for that niche.

Long term, these pages could become useful search/discovery destinations.

Example search intent:

> "Best cybersecurity startups"

Instead of presenting an arbitrary editorial list, Startup Arena can show historical competition data.

---

## 6. Startup Rankings

Every startup should accumulate a battle record.

Possible stats:

- wins;
- losses;
- win percentage;
- total votes received;
- total battles;
- longest streak;
- current streak;
- category rank;
- average vote share;
- total profile visits;
- total outbound clicks;
- historical opponents.

Example:

### Acme Security

**Record:** 12–3  
**Longest streak:** 7 wins  
**Lifetime vote share:** 64%  
**Category:** Cybersecurity

Battle history:

| Date | Opponent | Result | Vote |
|---|---|---|---|
| Aug 21 | PhishGuard | Win | 63–37 |
| Aug 20 | Vaultly | Win | 52–48 |
| Aug 19 | SecureFox | Loss | 46–54 |

This historical data can become one of the platform's strongest long-term assets.

---

## 7. Voting

The voting question should emphasize product interest rather than abstract startup quality.

Preferred prompt:

> **Which would you rather use?**

Alternatives worth testing:

- Which product would you try?
- Which startup deserves to advance?
- Which product is more compelling?
- Which one would you click first?

Avoid:

> "Which is the better idea?"

That can reward hypothetical concepts rather than actual products.

### Voting Requirements

Potential MVP:

- login required;
- one vote per account per battle;
- vote cannot be changed after submission;
- no founder self-voting from affiliated accounts;
- basic rate limiting;
- automated suspicious-vote detection.

Later:

- account age weighting;
- verified-user badges;
- reputation systems;
- bot/fraud scoring;
- CAPTCHA / Turnstile;
- device and IP heuristics;
- vote anomaly detection.

Voting integrity is extremely important because founders are paying to enter.

---

## 8. Founder Submission Flow

A founder submits:

- startup name;
- logo;
- URL;
- short tagline;
- longer description;
- category;
- screenshots;
- optional short demo/GIF/video;
- founder identity;
- social links;
- pricing model;
- launch status.

Suggested battle card constraints:

### Startup Name
Short.

### One-Sentence Pitch
Strict character limit.

Example:

> "Automatically harden your Linux servers against common misconfigurations."

### CTA
- Visit Startup
- Try Product
- View Demo

### Optional Demo
Prefer a short visual asset over large blocks of copy.

The cards for both startups should remain structurally symmetrical.

---

## 9. Bidding System

The bidding system is how Startup Arena monetizes attention.

### Basic Auction

Founders compete for the next challenger position in a category.

Example:

### Tomorrow's AI Challenger

| Startup | Bid |
|---|---:|
| BuildBot | $84 |
| AgentForge | $71 |
| PromptDesk | $55 |

Auction closes in:

`03:41:22`

Highest valid bid wins the challenger slot.

### Important Questions

Need to decide:

- first-price or second-price auction?
- public or hidden bids?
- minimum bid?
- automatic bid increments?
- maximum bid?
- refund policy?
- charge immediately or only upon winning?
- what happens if a startup is rejected after bidding?
- how far in advance can founders bid?
- can the same startup bid repeatedly?
- can previous champions challenge again?
- does a losing startup receive anything?

### Possible Early Model

Simplest MVP:

- public bids;
- fixed minimum;
- highest bid wins;
- winner is charged;
- losing bidders are not charged;
- bidding closes at a fixed time;
- admin approval required before bidding eligibility.

Stripe can handle payment authorization and capture.

---

## 10. Monetization

### Primary Revenue

**Paid challenger slots**

Founders bid for the right to enter an arena battle.

### Potential Future Revenue

- featured startup placements;
- sponsored category pages;
- premium analytics;
- startup profile upgrades;
- founder verification;
- newsletter sponsorships;
- promoted battle replays;
- category sponsorships;
- API access to rankings/trends;
- paid market validation reports;
- startup scouting tools for investors;
- recruitment listings on startup profiles.

The initial product should avoid over-monetization.

The battle itself must remain trustworthy.

---

## 11. Founder Analytics

Advertising becomes much more valuable if founders can measure what happened.

Possible analytics:

- battle impressions;
- startup-card views;
- website clicks;
- demo plays;
- votes received;
- vote share;
- click-through rate;
- visitors who viewed both startups;
- visitors who voted after visiting;
- referral conversions, if measurable;
- geographic distribution;
- referral source.

Example:

> 1,382 people viewed your matchup  
> 846 voted  
> 412 visited your site  
> 61% chose your competitor  
> Visitors who opened both sites chose you 72% of the time

This starts to turn Startup Arena into a lightweight market-validation platform in addition to advertising.

---

## 12. Consumer / Voter Experience

The platform must be fun even for users who are not founders.

Reasons to visit:

- discover new products;
- influence which startup wins;
- watch streaks;
- see upset victories;
- browse category leaders;
- compare competing products;
- follow favorite startups;
- participate in tournaments;
- see daily results.

Potential engagement features:

- daily featured battle;
- prediction polls;
- win streak notifications;
- favorite categories;
- "underdog" labels;
- upset alerts;
- battle comments;
- shareable result cards;
- user voting streaks;
- badges;
- season championships.

Do not overbuild these for MVP.

---

## 13. Content Flywheel

Startup Arena automatically generates content from platform activity.

Examples:

> "BuildBot defeats AgentForge 58–42."

> "Acme Security extends its streak to six wins."

> "Tiny bootstrapped tool dethrones the AI category's month-long champion."

> "Top 10 developer tools on Startup Arena this month."

Potential channels:

- homepage;
- category pages;
- X;
- LinkedIn;
- newsletter;
- RSS;
- Discord;
- API.

The advertising creates the content.

The content attracts users.

The users make advertising valuable.

---

## 14. Product Flywheel

The desired flywheel:

1. Interesting startups compete.
2. People visit because the battles are entertaining.
3. Visitors discover products and vote.
4. Founder participants receive real traffic.
5. Other founders see that attention.
6. Founders bid for future challenger positions.
7. Better / more interesting startups enter.
8. Battles become more compelling.
9. More users return.

In shorthand:

> **Competition → attention → founder demand → better competition → more attention**

---

## 15. Brand Positioning

Working positioning:

> **Startup Arena — Where startups compete for attention.**

Alternative:

> **The competitive discovery platform for startups.**

Possible terminology:

- Arena
- Champion
- Challenger
- Battle
- Matchup
- Win Streak
- Upset
- Battle Record
- Leaderboard
- Hall of Fame
- Challenger Auction
- Division / Category

The visual identity should probably feel:

- competitive;
- modern;
- internet-native;
- slightly playful;
- credible enough for founders to spend money.

Avoid making it look like:

- a gambling platform;
- a crypto project;
- a generic SaaS dashboard;
- a cheesy esports site.

---

## 16. MVP Scope

The MVP should test one fundamental question:

> **Will people repeatedly vote on startup matchups, and will founders pay for access to that attention?**

### MVP Features

#### Public

- homepage;
- one active battle;
- startup A card;
- startup B card;
- startup outbound links;
- vote button;
- current/final vote totals;
- champion display;
- battle countdown;
- recent battle history;
- basic leaderboard.

#### Founder

- authentication;
- submit startup;
- startup profile;
- bid for challenger slot;
- basic analytics;
- payment handling.

#### Admin

- approve/reject submissions;
- approve category assignment;
- manage active battle;
- resolve disputes;
- disqualify fraudulent startups;
- manually trigger/repair battle rollover;
- inspect suspicious voting.

### Explicitly Out of MVP

- dozens of categories;
- investor dashboards;
- advanced recommendations;
- native mobile app;
- complicated reputation system;
- extensive social features;
- comments;
- tournaments;
- full ad marketplace;
- complex ranking algorithm;
- AI-generated startup reviews.

---

## 17. Possible MVP Evolution

### Phase 0 — Manual Validation

Before building substantial infrastructure:

- recruit 10–20 startups;
- create several mock matchups;
- test whether founders are willing to participate;
- manually run voting;
- collect feedback;
- test whether participants share their battles.

Could potentially run the earliest version with some operations performed manually behind the scenes.

### Phase 1 — Single Arena

- one daily battle;
- winner stays on;
- challenger bidding;
- basic voting;
- profiles;
- Stripe;
- battle archive.

### Phase 2 — Categories

- 3–5 active categories;
- category champions;
- category rankings;
- category-specific bidding.

### Phase 3 — Growth

- social sharing;
- newsletter;
- follows;
- notifications;
- richer analytics;
- improved anti-fraud;
- SEO category pages.

### Phase 4 — Platform

- tournament events;
- APIs;
- trend data;
- premium founder analytics;
- investor / scout tools;
- sponsored events;
- startup ecosystem partnerships.

---

## 18. Data Model — Conceptual

Likely entities:

### User

```text
id
email
username
role
created_at
verified_at
reputation
```

### FounderProfile

```text
id
user_id
name
bio
social_links
verified
```

### Startup

```text
id
owner_id
name
slug
url
tagline
description
logo_url
demo_url
category_id
status
created_at
approved_at
```

### Category

```text
id
name
slug
description
active
```

### Battle

```text
id
category_id
startup_a_id
startup_b_id
champion_startup_id
challenger_startup_id
starts_at
ends_at
status
winner_id
total_votes
```

### Vote

```text
id
battle_id
user_id
startup_id
created_at
ip_hash
device_fingerprint_optional
fraud_score_optional
```

### Bid

```text
id
startup_id
category_id
user_id
amount
status
created_at
auction_id
stripe_payment_reference
```

### Auction

```text
id
category_id
battle_slot
opens_at
closes_at
winning_bid_id
status
```

### StartupAnalytics

Could initially be event based rather than one row per startup.

Events:

```text
battle_impression
startup_card_view
outbound_click
demo_play
vote
share
```

---

## 19. Candidate Technical Architecture

This section is intentionally tentative for discussion with Codex.

### Frontend

Potential:

- Next.js
- TypeScript
- React
- Tailwind CSS

Reasons:

- fast MVP development;
- strong SSR/SEO support;
- good routing for startup/category pages;
- easy deployment options.

### Backend

Options:

#### Option A — Next.js Full Stack

- Next.js server actions / API routes;
- PostgreSQL;
- Prisma or Drizzle;
- background jobs / cron;
- Stripe.

Good for a fast MVP.

#### Option B — Dedicated API

- Next.js frontend;
- Go / Node backend;
- PostgreSQL;
- Redis;
- worker service.

More architectural overhead, probably unnecessary initially.

### Database

PostgreSQL is likely appropriate because:

- relational battle history;
- users;
- startups;
- bids;
- payments;
- votes;
- rankings.

### Authentication

Possible:

- Auth.js;
- Clerk;
- Supabase Auth.

### Payments

Stripe.

Need careful implementation for:

- bid authorization;
- payment capture;
- refunds;
- disputes;
- receipts.

### Scheduling

Need deterministic battle rollover.

Possibilities:

- cron;
- queue worker;
- managed scheduler;
- Vercel Cron;
- Cloudflare Workers Cron;
- dedicated lightweight worker.

Battle state changes should be transaction-safe.

### Anti-Abuse

Potential tools:

- Cloudflare Turnstile;
- rate limiting;
- hashed IP tracking;
- device heuristics;
- email verification;
- account age;
- anomaly detection.

---

## 20. Battle State Machine

Codex should probably help design this carefully.

Possible states:

```text
SCHEDULED
LIVE
ENDED
VALIDATING
FINALIZED
CANCELLED
```

Flow:

```text
SCHEDULED
   |
   v
LIVE
   |
   v
ENDED
   |
   v
VALIDATING
   |
   +--> CANCELLED
   |
   v
FINALIZED
```

At finalization:

1. suspicious votes are handled;
2. winner is determined;
3. rankings update;
4. streak updates;
5. battle is archived;
6. next challenger is selected;
7. next battle is scheduled.

This process must be idempotent so rerunning a failed job does not corrupt rankings or charge someone twice.

---

## 21. Ranking Model

Do not overcomplicate rankings early.

Possible MVP ranking:

1. current win streak;
2. total wins;
3. win percentage;
4. total vote share as tiebreaker.

Long term, consider an Elo-like rating.

An Elo system could make battles useful even when startups have different numbers of appearances.

Potential dimensions:

- global Elo;
- category Elo;
- seasonal ranking;
- lifetime ranking.

Avoid presenting rankings as objective startup quality.

They represent performance **within Startup Arena battles**.

---

## 22. Matchmaking

Initially:

> Champion vs. auction-winning challenger.

Later, possible variants:

- ranked matchmaking;
- random underdog battles;
- tournament brackets;
- seasonal championships;
- category qualifiers;
- invite-only featured battles;
- newcomer divisions.

Startup similarity matters.

A password manager vs. a password manager is more meaningful than:

> password manager vs. AI music app.

Category structure should gradually become specific enough to support meaningful comparisons without fragmenting the audience.

---

## 23. Trust and Fairness Principles

Startup Arena only works if users believe the outcomes mean something.

Core principles:

1. **Money buys entry, not votes.**
2. Votes are never sold.
3. Paid placement is clearly disclosed.
4. Match rules are public.
5. Vote-fraud policies are public.
6. Founders cannot secretly sponsor favorable results.
7. Rankings explain their methodology.
8. Startups may appeal disqualifications.
9. Platform admins retain authority to remove scams, malware, illegal services, or abusive submissions.
10. Sponsored content outside battles remains clearly labeled.

---

## 24. Abuse / Failure Modes

### Vote Buying

Founder sends people to mass-vote.

Question:

Is external campaigning allowed?

Potential policy:

- sharing the battle is encouraged;
- automated votes are prohibited;
- paid vote farms are prohibited;
- suspicious spikes may be invalidated.

This needs careful thought because founders sharing their battle could itself drive growth.

### Bot Voting

Mitigations:

- account requirement;
- email verification;
- rate limiting;
- CAPTCHA;
- anomaly detection;
- IP/device heuristics.

### Fake Startups

Require:

- functioning website;
- meaningful product/demo;
- submission review.

### Scam / Malware Links

Need:

- manual moderation;
- automated URL safety checks;
- reporting;
- immediate suspension capability.

### Rich Founder Dominance

If challenger slots become expensive, bootstrapped founders may be excluded.

Possible future solutions:

- free wildcard slots;
- newcomer tournaments;
- community-selected challengers;
- capped auctions;
- earned credits;
- sponsored indie-founder slots.

### Incumbent Champion Dominance

A startup could theoretically stay champion forever.

Possible rules:

- maximum streak;
- mandatory retirement into Hall of Fame;
- championship round;
- cooldown.

But a long undefeated streak could also be excellent content.

Do not solve this until it becomes a real problem.

---

## 25. Cold Start Strategy

This is probably the hardest non-technical problem.

Need enough:

- startups;
- voters;
- compelling battles.

Potential strategy:

### Recruit First Competitors Manually

Find early-stage startups on:

- X;
- Indie Hackers;
- Hacker News;
- Reddit;
- Product Hunt;
- startup Discords;
- university incubators;
- AI builder communities.

Offer early battles free.

Pitch:

> "We're building a competitive startup discovery site. Want to be one of the first startups in the arena?"

### Seed the First Battles

Choose visually compelling products with:

- obvious value proposition;
- functioning demos;
- similar categories;
- founders willing to share.

### Let Founders Drive Initial Traffic

This is key.

Each founder has a reason to send their audience to the battle:

> "We're competing today. Vote for us."

Thus contestants help create the audience that makes future slots valuable.

### Introduce Paid Bidding Only After Attention Exists

Do not charge significant amounts before measurable traffic exists.

Potential progression:

1. free invites;
2. nominal bid minimum;
3. real competitive auctions;
4. category-specific pricing.

---

## 26. Growth Loops

### Founder Sharing Loop

Founder competes → shares battle → followers visit → some become repeat users → future founders want access.

### Results Sharing Loop

Winner receives a share card:

> "We won today's Developer Tools Arena."

### Challenger Loop

Users discover a startup and tell another founder:

> "You should challenge them."

### Category SEO Loop

Battle history produces increasingly rich category pages.

### Newsletter Loop

Daily/weekly email:

> Today's battle  
> Biggest upset  
> Longest streak  
> New challengers

---

## 27. Metrics

### North-Star Candidates

Potential:

**Meaningful startup discovery sessions per day**

or:

**Qualified outbound clicks delivered to competing startups**

Could also track:

> Battles with enough independent votes to produce a meaningful outcome.

### Core Metrics

#### Audience

- daily active voters;
- weekly active voters;
- returning voter rate;
- votes per battle;
- unique battle viewers;
- battle completion rate.

#### Founder

- startup submissions;
- approved startups;
- bidders per auction;
- average winning bid;
- repeat bidder rate;
- founder retention;
- outbound clicks delivered.

#### Marketplace

- auction fill rate;
- bid competition;
- revenue per battle;
- category liquidity.

#### Quality

- vote fraud rate;
- complaint rate;
- broken-link rate;
- startup rejection rate.

---

## 28. Validation Questions

Before committing significant engineering effort, answer:

### Audience

- Do people actually enjoy voting on startup battles?
- Will they return the next day?
- Do users explore both startups before voting?
- Are some categories dramatically more engaging?

### Founder

- Will founders submit products voluntarily?
- Will founders share their battles?
- Do they value traffic from Startup Arena?
- Would they pay for another battle?
- What amount would they pay?

### Marketplace

- Does auctioning one challenger slot create enough scarcity?
- Should there be multiple daily battles?
- Are public bids exciting or intimidating?
- Does winner-stays-on make the platform more compelling?

---

## 29. Important Product Experiments

### Experiment 1 — Voting Prompt

Compare:

- Which would you rather use?
- Which deserves to advance?
- Which startup is more compelling?

### Experiment 2 — Winner Stays On

Compare:

- winner stays on;
- two new startups every day.

Hypothesis:

Winner stays on produces stronger stories and return behavior.

### Experiment 3 — Public Bidding

Compare:

- visible leaderboard;
- sealed auction.

Hypothesis:

Visible bidding itself becomes entertaining content.

### Experiment 4 — Startup Cards

Compare:

- short text only;
- screenshot;
- demo video;
- interactive preview.

### Experiment 5 — Vote Visibility

Compare:

- live vote counts;
- hidden until voting;
- hidden until battle ends.

Hidden results may reduce bandwagon effects.

---

## 30. Open Product Questions

For future discussion:

1. Should users see vote totals before voting?
2. Should results remain hidden until battle completion?
3. Should founders be allowed to campaign publicly?
4. Should voters be required to visit both websites?
5. Should clicking both startups increase vote credibility?
6. How long should a battle last?
7. One battle per day or several?
8. How many launch categories?
9. What prevents wealthy startups from monopolizing challenger slots?
10. Does a losing founder receive analytics or promotional value?
11. Should challengers bid cash, platform credits, or both?
12. Should the winner ever retire?
13. Should categories have separate champions?
14. Should there be a global championship?
15. How are ties handled?
16. Can startups challenge a previous opponent again?
17. How long is the cooldown after losing?
18. What minimum product quality is required?
19. What categories are prohibited?
20. Should AI-generated / wrapper products be treated differently?
21. How much moderation is necessary before launch?
22. Can founders submit multiple startups?
23. Are agency-built/client startups allowed?
24. Should projects need to be publicly available?
25. Should open-source projects compete?

---

## 31. Legal / Operational Considerations

Not legal advice; needs proper review before launch.

Potential issues:

- auction terms;
- payment disputes;
- refunds;
- deceptive-advertising rules;
- disclosure of paid placement;
- privacy policy;
- cookie tracking;
- analytics consent;
- user-generated content;
- intellectual property;
- trademark complaints;
- founder identity verification;
- fraudulent businesses;
- sweepstakes/gambling characterization.

Important:

The system should be positioned as purchasing **advertising/placement**, not wagering on battle outcomes.

Users should not stake money on who wins.

Founders pay for promotional access, not a probabilistic cash prize.

Any prize structure should be reviewed carefully.

---

## 32. Design Sketch — Homepage

```text
+-----------------------------------------------------------+
| STARTUP ARENA                            Sign In   Submit  |
+-----------------------------------------------------------+

              TODAY'S DEVELOPER TOOLS BATTLE

                 06:14:37 remaining

        +----------------+    VS    +----------------+
        |                |          |                |
        |   STARTUP A    |          |   STARTUP B    |
        |                |          |                |
        |  Logo          |          |  Logo          |
        |  One-liner     |          |  One-liner     |
        |  Screenshot    |          |  Screenshot    |
        |                |          |                |
        | [Visit]        |          | [Visit]        |
        | [Vote A]       |          | [Vote B]       |
        +----------------+          +----------------+

                Champion: Startup A — 5 wins

-------------------------------------------------------------

              TOMORROW'S CHALLENGER AUCTION

        BuildBot                              $84
        AgentForge                            $71
        PromptDesk                            $55

                  03:41:22 remaining

                       [Place Bid]

-------------------------------------------------------------

                  CATEGORY LEADERBOARD

        #1 Startup A      12–3
        #2 Startup C       9–2
        #3 Startup D       7–4

-------------------------------------------------------------

                  RECENT BATTLES

        Startup A defeated Startup C     58–42
        Startup C defeated Startup F     64–36
```

---

## 33. Possible Taglines

Working favorite:

> **Where startups compete for attention.**

Others:

> Discover startups. Pick winners.

> Two startups enter. You decide who advances.

> The competitive startup discovery platform.

> Startup discovery, turned into a game.

> Fight for attention.

---

## 34. Initial Development Goal

Do not begin by building a giant platform.

Build the smallest possible system that proves:

1. founders want to compete;
2. users want to vote;
3. founders share battles;
4. traffic reaches the competing startups;
5. somebody eventually pays for a challenger slot.

A technically impressive platform with no competition or audience is a failure.

A janky page where 500 people passionately vote on two startups is validation.

---

## 35. Suggested First Build Milestone

A first internal prototype should support:

- create two startups manually;
- create a battle;
- render both startup cards;
- accept authenticated votes;
- prevent duplicate votes;
- close voting at a configured timestamp;
- declare a winner;
- persist a battle result;
- increment a winner streak;
- generate the next battle;
- show historical results.

Do **not** integrate real bidding until the battle engine works reliably.

Then add:

- founder submissions;
- bidding;
- Stripe;
- founder analytics.

---

## 36. Questions for Codex

When this concept is handed to Codex, useful discussion questions include:

### Architecture

1. What is the simplest production-worthy architecture for this MVP?
2. Should the MVP use a full-stack Next.js application or a separate API?
3. How should battle rollover be implemented safely and idempotently?
4. How should the auction and payment state machines interact?
5. How should ranking updates be handled transactionally?

### Security

6. What is the minimum viable anti-vote-fraud system?
7. What attack surfaces are introduced by startup-submitted URLs and media?
8. How should rate limiting be implemented?
9. How should founder/admin authorization be structured?
10. How should payment webhooks be made idempotent?

### Database

11. What PostgreSQL schema best supports battles, bids, rankings, and history?
12. Should analytics use relational tables initially or an event store?
13. What indexes will matter early?
14. How should category ranking history be represented?

### Product Engineering

15. How should vote counts be cached?
16. Should live battle totals update with polling, SSE, or WebSockets?
17. How should scheduled battle transitions work across deployment failures?
18. How can the architecture stay simple while allowing categories later?

### MVP

19. Which features in this document should be cut from v1?
20. What can be safely manual during initial validation?
21. What should be built first to test the core hypothesis with real users?

---

## 37. Current Concept in One Paragraph

Startup Arena is a gamified startup discovery and advertising platform where startups compete in recurring head-to-head battles. Visitors explore two products and vote for the one they would rather use, while winners earn rankings, streaks, and free promotion. Founders bid for future challenger slots, but money only buys access to the arena—the community determines the winner. Categories create niche-specific arenas and historical rankings, making the platform useful for discovering top products in areas such as AI, developer tools, cybersecurity, and productivity. The business works if battles become entertaining enough that people visit voluntarily, making challenger slots valuable to founders seeking distribution.

---

## 38. Core Principle to Preserve

If the product evolves significantly, preserve this:

> **People visit because it is a game. Founders pay because people visit.**

And:

> **Money buys entry, not victory.**

Those two ideas are the foundation of Startup Arena.
