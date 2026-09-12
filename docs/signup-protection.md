# Signup protection

Status: locally implemented and mocked-provider tested. No production activation or real subscriber calls performed by this patch.

## Configuration and rollout

Set these server environment variables on the intended Vercel production deployment:

- `SIGNUPS_PAUSED=1`: keeps all three POST handlers closed with HTTP 503. GET `/api/signup-config` reports `enabled:false` and no site key.
- `TURNSTILE_SITE_KEY`: public site key for a Cloudflare Managed widget.
- `TURNSTILE_SECRET_KEY`: matching secret, server only. Never put it in source or client code.
- Existing Beehiiv and Telegram configuration stays required for its existing purpose.

Create a Managed widget restricted to `intelligentgrowth.app`, `www.intelligentgrowth.app`, `willmulholland.com`, and `www.willmulholland.com`. The server also independently checks exactly these four names. Preview Vercel hostnames are intentionally rejected. Actions must exactly match `subscribe`, `workshop_register`, or `community_apply` for the corresponding endpoint.

Deploy with the pause still set. Verify the public configuration exposes no secret, each POST returns 503 without downstream work, and all 21 protected forms load the helper. Remove the pause (`SIGNUPS_PAUSED=0`) only for an explicitly authorised validation/reopening window with real matching keys configured. Missing keys fail closed regardless of the pause setting. Environment changes require a new deployment when using Vercel environment configuration.

During that approved window, verify each hostname and all three actions with controlled test identities authorised by Will. A successful Beehiiv call can send confirmation email, and workshop/community submissions can notify Will through Telegram. Mocks do not verify live email delivery, automation timing, widget host configuration, or the actual subscriber status. Check the new subscriber is pending confirmation and that course automations do not bypass confirmation. Record the actual API status and native account state; do not assume the API label `validating` is equivalent to double opt-in Pending. Keep the pause active if any of those checks fail.

## Enforcement

Every request goes through server-side Siteverify before Beehiiv or Telegram. Tokens have a maximum of 2048 characters, must have strict boolean success, the expected action and allowed hostname, and a fresh challenge timestamp. Cloudflare enforces single use; failed and duplicate responses are rejected. There is no client bypass flag, no permissive hostname wildcard, no cached verification success and no retries of potentially consumed tokens. Siteverify has a five-second abort deadline. Provider errors log only fixed messages or status codes, never token values, subscriber details or response bodies.

All new subscription creation requests set `double_opt_override:'on'` and `reactivate_existing:false`, regardless of client input. This preserves the inactive state of previously unsubscribed addresses because fresh confirmation on reactivation is not guaranteed by the API documentation. Existing active addresses do not necessarily receive another confirmation email. The form copy distinguishes new signups and gives previously unsubscribed readers a contact route.

Workshop/community retain their existing best-effort list-add behavior and Telegram operational capture. Their success indicates application capture, not confirmed newsletter membership. Beehiiv or Telegram requests have eight-second abort deadlines. A timeout does not prove a provider performed no action; avoid automatic replays.

The browser loads only the public site key from `/api/signup-config`, renders one Managed widget per form, and submits that form's token with each request. It resets consumed tokens after every attempt, resets expired/timed-out challenges, clears errored tokens, and blocks missing tokens. No global fetch interception is introduced. Existing honeypots remain a supplementary measure.

## Inventory and tests

Protected frontend files: index, blog, brain, podcast, resources, team-brain, traffic, workshop, workshop-confirmed, preview-deck, preview-superpower, training and community. There are 21 forms and 18 submit call sites. The workshop reserve modal only navigates to the waitlist and makes no signup request.

Run:

```sh
node --test tests/signup-security.test.mjs tests/signup-client.test.mjs tests/subscribe-hardening.test.mjs tests/subscribe-forms.test.mjs tests/brain-cohort-eoi.test.mjs
npm test
```

The inherited full repository suite has seven unrelated MCP copy failures and one optional missing-vault skip. Compare against the exact base `f461d9d` before attributing failures to this patch.

## Monitoring and rollback

Monitor Vercel response counts for 400/403/503/5xx, Cloudflare verification failures versus successes, legitimate completion rates and Beehiiv confirmation-to-active conversion. Do not log emails, tokens or IP addresses in this patch. New bot-like volume is investigated from aggregate data before subscriber cleanup.

Emergency rollback is to deploy with `SIGNUPS_PAUSED=1`, or restore the already verified pause deployment. Do not roll back to the unprotected handler just to restore conversion. No subscriber deletion, suppression, billing change or credential rotation belongs to this patch.

## Official sources

- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
- https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/
- https://developers.beehiiv.com/api-reference/subscriptions/create
