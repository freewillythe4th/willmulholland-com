# Shared UI primitives

## Runtime and source shape

- Framework: none. Pages are static HTML documents.
- Component library: none.
- CSS approach: page-local CSS inside `<style>` elements, plus inline styles for a small number of elements.
- Shared JavaScript: `/js/analytics.js`, which imports `/js/analytics-core.mjs`.
- Shared component directory: none. Reusable patterns are copied between HTML files rather than imported.
- Primary design target: `mcp.html`.

The blocks below are literal source fragments from `mcp.html`. They are the complete markup and CSS for each named page-local primitive.

## BrandLogoLink

- Source: `mcp.html`, navigation markup
- Asset: `images/ig-logo/ig-logo-full.png`, 426 by 318 pixels, transparent PNG
- Description: linked Intelligent Growth mountain and two-line wordmark, rendered at 46 pixels high.

```html
<a href="/" class="nav-logo"><img src="/images/ig-logo/ig-logo-full.png" alt="Intelligent Growth" style="height:46px;width:auto;display:block;"></a>
```

```css
.nav-logo { display: inline-flex; align-items: center; gap: 10px; color: var(--black); text-decoration: none; position: relative; z-index: 1100; }
```

The real brand asset directory contains:

- `images/ig-logo/ig-logo-full.png`, 426 by 318, used by the current `mcp.html` render and many other site pages.
- `images/ig-logo/ig-logo-full-hires.png`, 2048 by 1530.
- `images/ig-logo/ig-logo-full.svg`, 1278 by 954 point view box, black vector artwork.
- `images/ig-logo/ig-nav-lockup.png`, 645 by 140.
- `images/ig-logo/ig-wordmark-1line.png`, 1572 by 120.
- `images/ig-logo/ig-mark.png`, 388 by 164.
- `images/ig-logo/ig-lockup-bigword.png`, 1605 by 150.
- `images/ig-logo/ig-word.png`, 426 by 159.

Do not substitute a generic logo. The current page renders `ig-logo-full.png`, not the SVG or the horizontal lockups.

## PrimaryButton and SecondaryButton

- Source: `mcp.html`
- Description: pill-shaped uppercase calls to action with dark filled and dark outlined variants.

```css
.btn-primary, .btn-secondary {
    display: inline-block;
    padding: 16px 32px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border-radius: 999px;
    text-decoration: none;
    transition: all 0.5s var(--ease-smooth);
}
.btn-primary { background: var(--ink); color: var(--white); border: 1px solid var(--ink); }
.btn-primary:hover { background: var(--accent); border-color: var(--accent); border-radius: 16px; }
.btn-secondary { background: transparent; color: var(--ink); border: 1px solid var(--ink); }
.btn-secondary:hover { border-radius: 16px; }
```

```html
<div class="hero-actions">
    <a href="#install" class="btn-primary">Install in 2 minutes</a>
    <a href="https://intelligent-growth.beehiiv.com/upgrade" class="btn-secondary">Join Intelligent Growth OS</a>
</div>
```

## Eyebrow

- Source: `mcp.html`
- Description: small blue uppercase label with a blue circular marker.

```css
.eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--accent-deep);
    margin-bottom: 24px;
}
.eyebrow::before { content: ''; width: 8px; height: 8px; background: var(--accent); border-radius: 50%; }
```

```html
<div class="eyebrow">What is inside</div>
```

## SectionHeader

- Source: `mcp.html`
- Description: eyebrow, Instrument Serif heading, and optional supporting paragraph in an 820 pixel content column.

```css
.section-head { max-width: 820px; margin-bottom: 52px; }
.section-head h2 { font-size: clamp(44px, 6.5vw, 78px); line-height: 0.98; margin-bottom: 18px; }
.section-head p { font-size: 18px; color: var(--gray-mid); line-height: 1.65; }
```

```html
<div class="section-head">
    <div class="eyebrow">What is inside</div>
    <h2>60+ tools, with the method attached.</h2>
    <p>Every skill carries the full frameworks and reference libraries behind it, not summaries. It updates automatically whenever Will sharpens a skill in his own work.</p>
</div>
```

## SkillCard

- Source: `mcp.html`
- Description: bordered white card with offset shadow, code chip, and body copy. The wide variant spans both columns and uses the dark theme.

```css
.skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; }
.skill-card {
    background: var(--white);
    border: 1px solid var(--ink);
    border-radius: 18px;
    padding: 30px;
    box-shadow: var(--offset-shadow);
    transition: transform 0.4s var(--ease-smooth), box-shadow 0.4s var(--ease-smooth);
}
.skill-card:hover { transform: translate(-2px, -2px); box-shadow: 9px 9px 0 rgba(31,21,17,0.16); }
.skill-card.wide { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(220px, 0.7fr) 1.3fr; gap: 28px; align-items: center; background: var(--ink); color: var(--white); border-color: var(--ink); }
.code-chip {
    display: inline-block;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0;
    color: var(--accent-deep);
    background: var(--accent-soft);
    border-radius: 8px;
    padding: 7px 10px;
    margin-bottom: 18px;
}
.skill-card.wide .code-chip { margin-bottom: 0; background: var(--accent); color: var(--white); justify-self: start; }
.skill-card p { color: var(--gray-mid); font-size: 17px; line-height: 1.6; }
.skill-card.wide p { color: rgba(255,255,255,0.8); font-size: 18px; }
```

```html
<article class="skill-card">
    <code class="code-chip">pmm_positioning</code>
    <p>A structured positioning review: who it is for, what it is, and why it is better. Paste a homepage URL and get the sharper version.</p>
</article>
<article class="skill-card wide">
    <code class="code-chip">ig_experience_search</code>
    <p>Searches the PMM Experience Database, with thousands of real answers from senior product marketers.</p>
</article>
```

## TierCard

- Source: `mcp.html`
- Description: paired free and member comparison cards with dark member variant and checkmarked feature rows.

```css
.tiers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }
.tier-card { border: 1px solid var(--ink); border-radius: 20px; padding: 40px; background: var(--white); box-shadow: var(--offset-shadow); }
.tier-card.member { background: var(--ink); color: var(--white); }
.tier-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 14px; }
.tier-card h3 { font-family: 'Instrument Serif', Georgia, serif; font-size: 38px; font-weight: 400; line-height: 1.05; margin-bottom: 8px; }
.tier-price { color: var(--gray-mid); font-size: 15px; margin-bottom: 26px; }
.tier-card.member .tier-price { color: rgba(255,255,255,0.64); }
.feature-list { list-style: none; }
.feature-list li { position: relative; padding: 14px 0 14px 28px; border-top: 1px solid rgba(31,21,17,0.1); font-size: 16px; line-height: 1.5; }
.feature-list li::before { content: '\2713'; position: absolute; left: 0; top: 14px; color: var(--accent); font-weight: 800; }
.tier-card.member .feature-list li { border-color: rgba(255,255,255,0.12); }
```

```html
<article class="tier-card">
    <div class="tier-label">Free</div>
    <h3>No account needed</h3>
    <p class="tier-price">Connect it and start asking.</p>
    <ul class="feature-list">
        <li>Browse the full catalogue</li>
        <li>Marketer insights search</li>
        <li>Newsletter archive search</li>
        <li>Templates index</li>
        <li>Charts</li>
        <li>Help and licence</li>
    </ul>
</article>
```

## InstallCard

- Source: `mcp.html`
- Description: numbered instruction card with optional access pill, command block, and explanatory copy.

```css
.install-list { display: grid; gap: 22px; counter-reset: install; }
.install-card {
    counter-increment: install;
    display: grid;
    grid-template-columns: 66px minmax(0, 1fr);
    gap: 24px;
    background: var(--white);
    border: 1px solid rgba(31,21,17,0.14);
    border-radius: 18px;
    padding: 34px;
}
.install-card::before {
    content: counter(install, decimal-leading-zero);
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 48px;
    line-height: 1;
    color: var(--accent);
}
.install-card h3 { font-size: 22px; margin-bottom: 8px; }
.access-pill { display: inline-block; margin-left: 8px; padding: 4px 8px; border-radius: 999px; background: var(--accent-soft); color: var(--accent-deep); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; vertical-align: 3px; }
.install-card p { color: var(--gray-mid); font-size: 16px; line-height: 1.65; }
.install-card p + p { margin-top: 12px; }
.command-block { margin: 18px 0 10px; }
.command-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray-light); margin-bottom: 8px; }
```

```html
<article class="install-card">
    <div>
        <h3>Claude Code <span class="access-pill">Full access</span></h3>
        <p>Run one of these commands in your terminal.</p>
        <div class="command-block">
            <div class="command-label">Free</div>
            <pre><code>claude mcp add intelligent-growth --transport http https://mcp.intelligentgrowth.app/mcp</code></pre>
        </div>
        <div class="command-block">
            <div class="command-label">Member</div>
            <pre><code>claude mcp add intelligent-growth --transport http https://mcp.intelligentgrowth.app/mcp --header "Authorization: Bearer you@youremail.com"</code></pre>
        </div>
        <p>The email on your membership is your key. There is nothing else to set up.</p>
    </div>
</article>
```

## FAQAccordion

- Source: `mcp.html`
- Description: native details and summary accordion with a rotating plus marker.

```css
details { border-bottom: 1px solid rgba(31,21,17,0.14); }
summary {
    list-style: none;
    cursor: pointer;
    padding: 24px 46px 24px 0;
    position: relative;
    font-size: 19px;
    font-weight: 600;
}
summary::-webkit-details-marker { display: none; }
summary::after { content: '+'; position: absolute; right: 4px; top: 19px; font-size: 28px; font-weight: 400; color: var(--gray-mid); transition: transform 0.3s var(--ease-smooth); }
details[open] summary::after { transform: rotate(45deg); }
.faq-answer { color: var(--gray-mid); font-size: 16px; line-height: 1.65; padding: 0 46px 24px 0; }
.faq-answer a { color: var(--accent-deep); }
```

```html
<details>
    <summary>What is the Intelligent Growth MCP?</summary>
    <div class="faq-answer">It is Will's product marketing method packaged as tools Claude and ChatGPT can use on your work.</div>
</details>
```
