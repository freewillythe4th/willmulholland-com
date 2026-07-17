# Intelligent Growth public repository exposure audit

Date: 2026-07-14
Status: Pre-build audit

## Decision

Do not change the visibility of `freewillythe4th/intelligent-growth-mcp`.

The current repository is the protected runtime. It contains enough method, routing, entitlement, protection, and deployment detail that publishing it would work against the product boundary Will chose.

Build a separate public companion repository from an explicit allowlist. Do not create it by copying the private repository and deleting files afterward.

## Current private repository findings

The private repository correctly ignores live environment settings, generated bundles, OAuth state, access keys, audit logs, and installed dependencies. Its `.env.example` contains placeholders rather than live values.

It also contains material that must not enter the public companion:

- `src/` contains private method selection, application, model routing, access control, protection, and authentication behavior.
- `content/` contains public tools plus method-adjacent material that should be reviewed item by item rather than copied wholesale.
- `EXPOSURE-MANIFEST.md` names private source files, protected method context, and internal source identifiers. It is an internal audit artifact, not public documentation.
- `deploy/` and deployment scripts reveal infrastructure and operational details that are unnecessary for a hosted-product user.
- Internal tester reviews and operations documents contain product weaknesses, implementation choices, and private operating context.
- The environment template currently names the server-side model split and model identifiers. Those details are useful to operators but unnecessary for the public companion.

## Public companion allowlist

The public repository should be generated from new files only:

- `README.md`
- `LICENSE`
- `SECURITY.md`
- `PRIVACY.md`
- `CONTRIBUTING.md`
- `docs/getting-started.md`
- `docs/clients/claude.md`
- `docs/clients/chatgpt.md`
- `docs/clients/claude-code.md`
- `docs/example-jobs.md`
- `docs/how-it-works.md`
- `docs/troubleshooting.md`
- `docs/data-and-method-boundary.md`
- `assets/` containing approved logos, screenshots, and demo media only
- `.github/ISSUE_TEMPLATE/bug.yml`
- `.github/ISSUE_TEMPLATE/feature.yml`
- `.github/pull_request_template.md`
- A small link or connection helper only if it contains no private execution logic

## Public companion denylist

The publishing check must reject:

- `.env` files other than a reviewed placeholder template.
- Credentials, API tokens, access keys, phone numbers outside approved public calls to action, email addresses outside approved support copy, and customer identifiers.
- Private method files, reference documents, source libraries, prompts, routing instructions, model identifiers, or provider configuration.
- `EXPOSURE-MANIFEST.md` or any file that names private source filenames.
- Internal source identifiers or provenance labels.
- Internal tester transcripts, session links, audit logs, product analytics identifiers, or member data.
- Deployment addresses, remote hosts, service files, tunnel settings, provisioning scripts, or backup paths.
- Runtime entitlement logic, content protection thresholds, extraction detection rules, or rate-limit internals.
- Disallowed source and author names already covered by the MCP provenance controls.

## What the public repository should prove

Proxy's repository proves that its product exists, is understandable, and is easy to try. Intelligent Growth can provide the same confidence without publishing the protected runtime.

The public companion should prove:

- What the product does.
- Where it runs.
- How to connect it.
- Which jobs it can help with.
- What a useful result looks like.
- What data it does and does not collect.
- Where the private hosted boundary begins.
- How to report a bug or ask for help.

It should not prove how the protected methods are assembled or executed.

## Required publishing checks

1. Build the repository from the allowlist.
2. Scan every file and the initial commit for secrets.
3. Scan for private method filenames and internal source identifiers.
4. Scan for disallowed provenance names.
5. Confirm all links point to public pages.
6. Confirm screenshots contain no member identity, private prompt, token, browser profile, analytics key, or internal path.
7. Confirm the hosted connection URL is the only production endpoint exposed.
8. Confirm the repository cannot run the private server locally.
9. Review the staged file list before the first public push.

## Public architecture statement

Use this level of detail publicly:

```text
Your AI client
      |
      | secure MCP connection
      v
Intelligent Growth hosted service
      |
      | selects and applies the relevant method privately
      v
Structured recommendation and working deliverable
```

Do not publish the provider layer, method composition, prompt chain, source selection, protection thresholds, or deployment topology.

