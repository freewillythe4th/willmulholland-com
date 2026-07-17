# Acquisition tracking

The Intelligent Growth site uses one shared PostHog layer on every public page. It measures the path from acquisition to meaningful intent without sending form contents or email addresses to PostHog.

## What is measured

- `$pageview` and `$pageleave` for traffic, landing pages, paths, sessions, and engagement.
- `site cta clicked` with the destination type and placement.
- `mcp install intent` when someone opens the MCP install section.
- `membership checkout intent` when someone clicks the paid membership upgrade.
- `site form submitted`, `site form succeeded`, and `site form failed` for first-party forms.
- First-touch and latest-touch UTM attribution on custom events.
- Initial and latest referring domain, with the path and query removed.

The browser also sends sanitized UTM source, medium, campaign, content, and term fields to the first-party signup endpoint. Beehiiv stores those fields on the subscription.

## Privacy controls

- No email addresses, names, form answers, request bodies, or response bodies are sent to PostHog.
- Full query strings and full referrer URLs are removed before events are sent.
- `gclid`, `fbclid`, and `msclkid` are not retained.
- Autocapture and session recording are disabled.
- Person profiles are created only for explicitly identified product users. The public website does not identify newsletter visitors.
- Website visitors and MCP members are not joined at an individual level. Cross-product reporting is aggregate unless a future consented identity design is approved.

## UTM naming standard

Use lowercase words joined with underscores.

- `utm_source`: where the link appeared, such as `linkedin`, `beehiiv`, `youtube`, or a partner name.
- `utm_medium`: the channel type. Allowed values are `organic_social`, `paid_social`, `email`, `dm`, `referral`, `partner`, `profile`, `podcast`, and `community`.
- `utm_campaign`: the initiative, such as `mcp_launch` or `brain_cohort_2026_07`.
- `utm_content`: the exact placement or creative, such as `launch_post`, `profile_featured`, `comment_link`, or `dm_01`.
- `utm_term`: optional keyword or audience label.

Do not put names, email addresses, account IDs, or other personal data in a UTM value.

## Build a tracked link

From the repository:

```bash
npm run utm -- --url https://intelligentgrowth.app/mcp --source linkedin --medium organic_social --campaign mcp_launch --content launch_post
```

Output:

```text
https://intelligentgrowth.app/mcp?utm_source=linkedin&utm_medium=organic_social&utm_campaign=mcp_launch&utm_content=launch_post
```

Recommended LinkedIn placements:

- Main post: `source=linkedin`, `medium=organic_social`, `content=launch_post`
- Featured profile link: `source=linkedin`, `medium=profile`, `content=profile_featured`
- Comment link: `source=linkedin`, `medium=organic_social`, `content=comment_link`
- Direct message: `source=linkedin`, `medium=dm`, `content=dm_01`

Keep the same campaign across all links for one launch. Change only the content value when comparing placements or creative.

## PostHog dashboard recipe

Create a website acquisition dashboard with these views:

1. Unique visitors and sessions over time.
2. Pageviews broken down by `utm_source`, then `$referring_domain` for untagged traffic.
3. MCP page visitors broken down by `utm_campaign` and `utm_content`.
4. `site cta clicked` broken down by `destination_type` and `placement`.
5. A funnel from MCP pageview to `mcp install intent`.
6. A funnel from landing pageview to `site form succeeded`.
7. Form success rate using submitted, succeeded, and failed events, broken down by `form_type`.
8. Membership checkout intent broken down by source and campaign.

Custom event filters become available after the first matching production event arrives. The existing MCP activation dashboard remains separate because website visitors are anonymous and MCP members use a protected account identifier.

## Verification

```bash
npm test
npm run analytics:check
```

The installation command is repeatable and can repair a missing shared tag:

```bash
npm run analytics:install
```

## Implementation sources

- [PostHog JavaScript configuration](https://posthog.com/docs/libraries/js/config)
- [PostHog UTM segmentation](https://posthog.com/docs/data/utm-segmentation)
- [PostHog custom event capture](https://posthog.com/docs/product-analytics/capture-events)
- [Beehiiv create subscription API](https://developers.beehiiv.com/api-reference/subscriptions/create)
