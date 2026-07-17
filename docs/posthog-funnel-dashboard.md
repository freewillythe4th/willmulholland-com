# Intelligent Growth PostHog funnel

Date: 2026-07-14
Status: Event contract implemented, dashboard configuration in progress

## Measurement goal

The product is not activated when someone visits the page, copies a URL or connects the MCP.

The first value event is a successful result for a real product marketing job. The strongest early activation signal is:

1. A successful first job.
2. A second active day within 14 days.

For a free user, the first successful job is `ig_competitive_gap` with `outcome=completed`.

For a member, the first successful paid result is any invocation where `tier=paid`, `required_tier=paid` and `outcome=completed`.

## Funnel model

### Acquisition

1. Relevant page view on `/mcp` or a job page.
2. `mcp_start_clicked`.
3. `mcp_client_selected`.
4. `mcp_connection_copied`.
5. `mcp_starter_prompt_copied`.
6. `mcp_setup_step_completed` with `step=ready_to_run`.

### Product activation

1. `mcp_connection_authorized`.
2. First `mcp_tool_invoked` with `outcome=completed`.
3. First successful free or paid result.
4. Second active day within 14 days.

### Monetisation and assistance

- `mcp_checkout_clicked` for website intent.
- Existing membership checkout intent event for continuity.
- `mcp_help_clicked` for optional WhatsApp assistance.
- `mcp_tool_invoked` with `outcome=access_denied` for upgrade or entitlement friction.
- `mcp_tool_invoked` with `outcome=failed` or `rate_limited` for product friction.

## Dashboard cards

### 1. Relevant visitors

Trend of `$pageview`, filtered to `/mcp` and `/mcp/*`, broken down by `latest_utm_source` and referring domain.

Purpose: understand which acquisition sources bring people to a job page, not just to the site.

### 2. Landing to setup

Ordered funnel:

1. `$pageview` on an MCP page.
2. `mcp_start_clicked`.
3. `mcp_client_selected`.

Break down by `job`, `placement` and `latest_utm_source` one at a time. Do not create a multi-property report that is too sparse to act on.

### 3. Setup completion

Ordered funnel:

1. `mcp_client_selected`.
2. `mcp_connection_copied`.
3. `mcp_starter_prompt_copied`.
4. `mcp_setup_step_completed` filtered to `step=ready_to_run`.

Break down by `client`.

Purpose: find client-specific setup friction.

### 4. Job intent

Trend of `mcp_start_clicked` and `mcp_job_selected`, broken down by `job`.

Purpose: decide which capability pages, examples and methods deserve the next improvement.

### 5. Assisted setup rate

Formula:

`mcp_help_clicked / mcp_start_clicked`

Break down by `placement`.

Purpose: learn where the self-serve explanation is not enough. A high rate is not automatically bad while the product is early.

### 6. Checkout intent

Trend of `mcp_checkout_clicked`, broken down by `billing_interval` and `placement`.

Compare with completed subscription data in the billing system. PostHog intent is not revenue.

### 7. Connections authorised

Trend of `mcp_connection_authorized`, broken down by `client`, `connection_type` and `tier`.

Purpose: confirm real connection volume after website setup intent.

### 8. First successful free result

Unique users with `mcp_tool_invoked`, filtered to:

- `tool=ig_competitive_gap`
- `tier=free`
- `outcome=completed`

Purpose: measure whether the free promise produces a usable first run.

### 9. First successful member result

Unique users with `mcp_tool_invoked`, filtered to:

- `tier=paid`
- `required_tier=paid`
- `outcome=completed`

Break down by `tool` and `client`.

Purpose: understand what members use first and where the highest-value onboarding path should point.

### 10. Second active day within 14 days

Retention insight using successful `mcp_tool_invoked` as both the start and return event. Use daily buckets and report the share that returns on any later day inside 14 days.

Purpose: distinguish a successful demo from a product that becomes part of the work.

### 11. Access and reliability friction

Trend of `mcp_tool_invoked`, broken down by `outcome`, with separate views for:

- `access_denied`
- `failed`
- `rate_limited`

Break down by `tool` and `client` only when the sample is large enough to protect user privacy.

### 12. Result latency

Distribution of `duration_ms` for completed tool calls, reported by tool. Use median and the 95th percentile when PostHog supports it.

Purpose: protect the feeling of a responsive workflow without optimising for speed at the expense of quality.

## Attribution limits

Website visitors and protected MCP users currently have separate anonymous identities. This is intentional and avoids sending email addresses or company content into analytics.

The dashboard can accurately report:

- Campaign to website setup intent.
- Setup step conversion by anonymous website visitor.
- Protected MCP activation and retention by hashed server identity.
- Aggregate comparison between website setup completions and authorised connections.

It must not claim a person-level campaign-to-result conversion rate until a reviewed, opaque handoff identifier exists. Do not join on email, prompt text, company name, copied URL or access token.

## Privacy contract

Allowed properties are fixed enums or bounded operational values:

- Job.
- Placement.
- Client.
- Authentication mode.
- Setup step.
- Billing interval.
- Safe UTM fields.
- Tool, tier, outcome, duration and server version.

Never capture:

- Prompts or outputs.
- Copied connection values or starter prompt text.
- Email addresses or phone numbers.
- Access tokens or credentials.
- Company text or customer records.
- Full URLs or URL query strings.
- Private method or provider details.

Autocapture and session recording remain disabled.

## Initial review cadence

Review weekly while the first testers are onboarding:

1. Read the setup funnel by client.
2. Compare copied setup to authorised connections.
3. Read first successful free and paid jobs.
4. Inspect access and reliability friction.
5. Pair the numbers with the exact tester feedback from that week.

Do not treat the first small sample as a benchmark. After 100 relevant setup sessions, set operating thresholds from the observed distribution and the qualitative reasons behind each drop.
