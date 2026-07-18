# Intelligent Growth MCP funnel specification

Date: 2026-07-14
Status: Approved and in implementation
Branch: `codex/ig-mcp-funnel`

## Product objective

Help the person who owns product marketing alone move from a real job on their desk to a useful first result. The funnel should feel personal and low-friction without making Will the only way to get started.

## What to copy from Proxy

- Lead with a recognisable job and result.
- Make setup feel small.
- Offer a high-touch WhatsApp path for early users.
- Show the output inside the AI client.
- Keep a useful public GitHub presence.
- Publish search pages around specific jobs people already look for.
- Join quantitative product analytics with direct tester feedback.

## What not to copy

- Do not make WhatsApp the only route.
- Do not lead with protocol details.
- Do not expose the server implementation just because Proxy exposes theirs.
- Do not borrow Proxy's visual identity or wording.
- Do not present logos or outcomes that Intelligent Growth cannot substantiate.

## Journey

### Route A: self-serve

1. Visitor lands on `/mcp` from LinkedIn, newsletter, search, referral, or direct traffic.
2. Visitor selects `Run the free competitive gap`.
3. `/mcp/start?job=competitive-gap` asks which client they use.
4. The page shows only the instructions for that client.
5. The visitor connects the MCP and copies the starter prompt.
6. The AI client runs the free job.
7. The result recommends a relevant next job without an unnecessary free-tier message for paid members.

### Route B: setup help

1. Visitor selects `Get setup help on WhatsApp`.
2. WhatsApp opens a prefilled one-to-one message to Will.
3. The message includes the visitor's chosen client and intended job when known.
4. Will helps them connect, watches the first run, and asks for friction and repeat-use feedback.

## Landing page information architecture

1. Navigation with the real Intelligent Growth logo.
2. Outcome-led hero with the free competitive-gap call to action.
3. Small proof strip for skill coverage, supported clients, and automatic updates.
4. Concrete jobs: positioning, messaging, launch, and competitive.
5. A side-by-side proof section showing generic AI versus Intelligent Growth on the same brief.
6. Three-step explanation: connect, bring context, review a usable first version.
7. Visual output examples inside the AI client.
8. Clear free and member boundaries.
9. Self-serve onboarding choice with WhatsApp as optional help.
10. FAQs covering Claude, ChatGPT, judgment, context, privacy, and protected skill instructions.
11. Final result-led call to action.

## Messaging contract

### Hero

Eyebrow: Product marketing Connector for Claude and ChatGPT

Headline: Do sharper product marketing work, without a bigger team.

Subhead: Intelligent Growth plugs the way I run product marketing into your Claude, so it turns your homepage, customer interviews and product context into sharper positioning, messaging, launch plans and competitive work. Connect once, no code.

Primary action: Run the free competitive gap

Secondary action: Get setup help on WhatsApp

Tertiary action: See the full catalogue

Proof line: 53 product marketing skills, updated as I sharpen them, across Claude and ChatGPT.

### Voice

- Direct and personal.
- One thought per sentence.
- Short paragraphs with enough rhythm to feel written by a person.
- Specific jobs and honest constraints.
- Confident claim followed by a grounded explanation.
- No hype, corporate filler, fake urgency, or copied Tyler Denk phrases.

## Pricing boundary

- Free: connection, catalogue discovery, and the current free skills.
- Member: seven-day free trial converting to A$49 per month, with a payment card required. A$490 per year remains available without the trial while the founding offer remains active.
- Do not publish a supporter tier until its entitlement and checkout are confirmed in the live billing system.
- Paid members should never receive copy that tells them a skill is free.

## Public and private repository boundary

### Private runtime repository

Keep `freewillythe4th/intelligent-growth-mcp` private. It may contain:

- Method execution and routing.
- Protected prompts and method bodies.
- Provider integrations.
- Entitlement and membership logic.
- Deployment configuration.
- Private provenance controls.
- Security and abuse prevention.

### Public companion repository

Create a separate repository for:

- Product README and demo media.
- Hosted connection URL.
- Supported clients and setup steps.
- Example jobs and starter prompts.
- Public capability catalogue.
- Public architecture diagram that stops at the server boundary.
- Privacy, security, terms, and responsible-use links.
- Troubleshooting and issue templates.
- A disclosure explaining that hosted methods execute privately and are not included in the repository.

The public repository must not contain method bodies, provider prompts, source documents, provenance metadata, member data, server credentials, deployment secrets, private API routes, or code that can reconstruct the protected runtime.

## Exposure gates

- Secret scan passes.
- No private source names or disallowed attributions appear.
- No method or reference-library files appear.
- No private runtime code is copied.
- Every environment file is a placeholder only.
- Public install guidance points to the hosted service.
- Repository visibility is changed only after the public contents pass the exposure audit.

## Analytics contract

The exact PostHog cards, activation definitions, attribution limits and privacy rules are specified in `docs/posthog-funnel-dashboard.md`.

### Existing website events to preserve

- Page viewed and page left.
- Safe first-touch and latest-touch UTM attribution.
- Sanitized referrer domains.
- Calls to action.
- Membership checkout intent.

### New website events

- `mcp_start_clicked`, properties: job and placement.
- `mcp_help_clicked`, properties: channel and placement.
- `mcp_client_selected`, properties: client.
- `mcp_connection_copied`, properties: client and auth mode.
- `mcp_starter_prompt_copied`, properties: job and client.
- `mcp_setup_step_completed`, properties: step and client.

Never include message contents, prompt text, copied commands, email addresses, phone numbers, access tokens, full URLs, or form values.

### Product events to join

- Anonymous OAuth connection.
- First method invoked.
- First successful free result.
- First successful paid result.
- Second active day within 14 days.
- Access friction and safe error categories.

## SEO plan

- Keep the main `/mcp` page focused on the product and first result.
- Build job pages from real capabilities, starting with competitive gap, homepage positioning review, messaging review, and launch brief.
- Each page should show the job, required inputs, what comes back, an example, and the same self-serve activation path.
- Track search impressions and clicks in Search Console, then connect landing page and campaign source to activation in PostHog.

## MCP host routes

- `https://mcp.intelligentgrowth.app/` should show a small branded server page or redirect to the canonical product page.
- `https://mcp.intelligentgrowth.app/terms` should redirect to `https://intelligentgrowth.app/terms`.
- `https://mcp.intelligentgrowth.app/privacy` should redirect to `https://intelligentgrowth.app/privacy`.
- The `/mcp` protocol route must remain unchanged.

## Verification

- Unit tests for event names, safe properties, URL building, client selection, copy actions, and route behavior.
- Secret and provenance scans for the public companion.
- Real browser review at desktop and mobile sizes.
- Keyboard, focus, contrast, reduced-motion, and screen-reader-label checks.
- Link and redirect verification.
- Production event verification without sending personal or prompt data.
- One bounded self-serve activation from landing page to completed free result.
