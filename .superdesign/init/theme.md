# Theme and styling source

## Styling architecture

- No Tailwind configuration exists.
- No global stylesheet exists.
- No theme provider exists.
- Every page defines CSS inside its own HTML file.
- `mcp.html` is the source of truth for the MCP page theme.
- `index.html` uses the same main palette and font pair, with one additional shadow token.
- `terms.html` and `privacy.html` use a smaller Inter-only legal page theme.

## Fonts

The MCP and home pages load Inter and Instrument Serif from Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&amp;family=Instrument+Serif:ital@0;1&amp;display=swap" rel="stylesheet">
```

- Body and interface type: Inter.
- Display type: Instrument Serif, with Georgia and generic serif fallbacks.
- Code and footer metadata: `ui-monospace`, SFMono-Regular, Menlo, Consolas, monospace.

## Full MCP page CSS

Source: the complete primary `<style>` block in `mcp.html`.

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
    --black: #1F1511;
    --ink: #1F1511;
    --cream: #FFFFFF;
    --cream-soft: #F4F4F2;
    --white: #FFFFFF;
    --gray-dark: #1F1511;
    --gray-mid: #5C4F47;
    --gray-light: #8B7E73;
    --accent: #2563EB;
    --accent-soft: #DBEAFE;
    --accent-deep: #1E3A8A;
    --warm-shadow: 0 12px 32px rgba(31,21,17,0.10), 0 2px 8px rgba(31,21,17,0.06);
    --offset-shadow: 6px 6px 0 rgba(31,21,17,0.14);
    --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
}

html { scroll-behavior: smooth; scroll-padding-top: 90px; }
body {
    font-family: 'Inter', sans-serif;
    background: var(--cream);
    color: var(--ink);
    overflow-x: hidden;
    line-height: 1.5;
    letter-spacing: -0.02em;
    -webkit-font-smoothing: antialiased;
}
::selection { background: var(--accent); color: var(--white); }

h1, h2, .footer-install h2 {
    font-family: 'Instrument Serif', Georgia, serif;
    font-weight: 400;
    letter-spacing: -0.01em;
}

nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 20px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(242, 237, 227, 0.82);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(31, 21, 17, 0.06);
    transition: transform 0.4s var(--ease-smooth);
}
nav.nav--hidden { transform: translateY(-100%); }
.nav-logo { display: inline-flex; align-items: center; gap: 10px; color: var(--black); text-decoration: none; position: relative; z-index: 1100; }
.nav-links { display: flex; align-items: center; gap: 32px; }
.nav-links a {
    font-size: 14px;
    font-weight: 500;
    color: var(--black);
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: opacity 0.5s var(--ease-smooth);
}
.nav-links a:hover { opacity: 0.6; }
.nav-cta {
    display: inline-flex;
    align-items: center;
    padding: 10px 18px;
    background: var(--ink);
    color: var(--white) !important;
    border-radius: 999px;
    font-size: 13px !important;
    font-weight: 600 !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    transition: background 0.4s var(--ease-smooth), transform 0.3s var(--ease-smooth) !important;
}
.nav-cta:hover { background: var(--accent); transform: translateY(-1px); opacity: 1 !important; }
.nav-toggle { display: none; background: transparent; border: 0; padding: 8px; cursor: pointer; color: var(--black); z-index: 1100; }
.nav-toggle-bar { display: block; width: 26px; height: 2px; background: currentColor; margin: 5px 0; transition: transform 0.3s var(--ease-smooth), opacity 0.3s var(--ease-smooth); }
.nav-toggle.is-open .nav-toggle-bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-toggle.is-open .nav-toggle-bar:nth-child(2) { opacity: 0; }
.nav-toggle.is-open .nav-toggle-bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

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

.hero {
    min-height: 92vh;
    padding: 160px 48px 100px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(31,21,17,0.1);
}
.hero-inner { width: 100%; max-width: 1180px; margin: 0 auto; }
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
.hero h1 { max-width: 1030px; font-size: clamp(52px, 8.3vw, 112px); line-height: 0.92; margin-bottom: 28px; }
.hero h1 span { color: var(--accent); }
.hero-copy { max-width: 760px; font-size: clamp(18px, 2.1vw, 22px); color: var(--gray-mid); line-height: 1.55; }
.hero-copy strong { color: var(--ink); }
.hero-actions { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 40px; }

section { padding: 100px 48px; }
.section-inner { max-width: 1180px; margin: 0 auto; }
.section-head { max-width: 820px; margin-bottom: 52px; }
.section-head h2 { font-size: clamp(44px, 6.5vw, 78px); line-height: 0.98; margin-bottom: 18px; }
.section-head p { font-size: 18px; color: var(--gray-mid); line-height: 1.65; }

.skills-section { background: var(--cream-soft); }
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
.tier-note { text-align: center; font-size: 18px; font-weight: 600; margin-top: 34px; }
.tier-note span { color: var(--gray-mid); font-weight: 400; }

.install-section { background: var(--cream-soft); }
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
pre {
    max-width: 100%;
    padding: 18px 20px;
    overflow-x: auto;
    border-radius: 12px;
    background: var(--ink);
    color: var(--white);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 13px;
    line-height: 1.55;
    letter-spacing: 0;
    white-space: pre;
}
.prompt-list { list-style: none; display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
.prompt-list li { border: 1px solid rgba(31,21,17,0.14); background: var(--cream); border-radius: 999px; padding: 10px 14px; font-size: 14px; color: var(--ink); }

.faq-section { max-width: 960px; margin: 0 auto; }
.faq-section .section-head { margin-bottom: 28px; }
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
.platform-table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 14px; }
.platform-table th, .platform-table td { text-align: left; padding: 12px; border: 1px solid rgba(31,21,17,0.14); }
.platform-table th { color: var(--ink); background: var(--cream-soft); }

footer { background: var(--gray-dark); color: var(--white); padding: 90px 48px 36px; }
.footer-install { max-width: 1180px; margin: 0 auto; }
.footer-install h2 { max-width: 900px; font-size: clamp(50px, 9vw, 112px); line-height: 0.9; margin-bottom: 26px; }
.footer-install p { color: rgba(255,255,255,0.7); font-size: 18px; margin-bottom: 30px; }
.footer-actions { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.footer-actions .btn-primary { background: var(--accent); border-color: var(--accent); }
.footer-command { margin-top: 42px; }
.footer-command pre { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); }
.footer-bottom {
    max-width: 1180px;
    margin: 80px auto 0;
    padding-top: 24px;
    border-top: 1px solid rgba(255,255,255,0.1);
    display: flex;
    justify-content: space-between;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--gray-light);
    gap: 20px;
}
.footer-links { display: flex; gap: 28px; }
.footer-links a { color: var(--gray-light); text-decoration: none; }
.footer-links a:hover { color: var(--white); }

a:focus-visible, button:focus-visible, summary:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }

@media (max-width: 980px) {
    nav { padding: 16px 24px; }
    .nav-toggle { display: block; }
    .nav-links {
        position: fixed;
        inset: 0;
        background: var(--black);
        color: var(--white);
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 28px;
        padding: 80px 24px 40px;
        transform: translateX(100%);
        transition: transform 0.4s var(--ease-smooth);
        z-index: 1050;
    }
    .nav-links a { font-size: 22px; color: var(--white); }
    .nav-links.is-open { transform: translateX(0); }
    body.nav-open { overflow: hidden; }
    body.nav-open nav { backdrop-filter: none; -webkit-backdrop-filter: none; background: transparent; border-bottom: none; transform: none; }
    body.nav-open .nav-logo img { filter: brightness(0) invert(1); }
    .nav-toggle.is-open { color: var(--white); }
}

@media (max-width: 760px) {
    .hero { min-height: auto; padding: 130px 24px 76px; }
    .hero h1 { font-size: clamp(48px, 15vw, 72px); }
    section { padding: 72px 24px; }
    .section-head { margin-bottom: 36px; }
    .skills-grid, .tiers-grid { grid-template-columns: 1fr; }
    .skill-card.wide { grid-column: auto; grid-template-columns: 1fr; gap: 18px; }
    .tier-card { padding: 30px 24px; }
    .install-card { grid-template-columns: 1fr; gap: 12px; padding: 26px 22px; }
    .install-card::before { font-size: 36px; }
    .access-pill { display: block; width: fit-content; margin: 8px 0 0; }
    footer { padding: 72px 24px 30px; }
    .footer-bottom { flex-direction: column; }
}

@media (max-width: 480px) {
    .hero-actions, .footer-actions { align-items: stretch; flex-direction: column; }
    .btn-primary, .btn-secondary { text-align: center; padding-left: 20px; padding-right: 20px; }
    .skill-card { padding: 24px 22px; }
    pre { font-size: 12px; padding: 16px; }
    .prompt-list { display: grid; }
    .platform-table { display: block; overflow-x: auto; }
    .footer-links { gap: 18px; flex-wrap: wrap; }
}

@media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { transition-duration: 0.01ms !important; }
}
```

## Home page root token block

Source: `index.html`. This matches the MCP palette and adds `--warm-shadow-hover`.

```css
:root {
    --black: #1F1511;
    --ink: #1F1511;
    --cream: #FFFFFF;
    --cream-soft: #F4F4F2;
    --white: #FFFFFF;
    --gray-dark: #1F1511;
    --gray-mid: #5C4F47;
    --gray-light: #8B7E73;
    --accent: #2563EB;
    --accent-soft: #DBEAFE;
    --accent-deep: #1E3A8A;
    --warm-shadow: 0 12px 32px rgba(31,21,17,0.10), 0 2px 8px rgba(31,21,17,0.06);
    --warm-shadow-hover: 0 20px 48px rgba(31,21,17,0.16), 0 4px 12px rgba(31,21,17,0.08);
    --offset-shadow: 6px 6px 0 rgba(31,21,17,0.14);
    --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Legal page full CSS

Source: identical style blocks in `terms.html` and `privacy.html`.

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
:root {
    --black: #000000;
    --white: #FFFFFF;
    --gray-mid: #525252;
    --accent: #2563EB;
}
body {
    font-family: 'Inter', sans-serif;
    background: var(--white);
    color: var(--black);
    line-height: 1.6;
    letter-spacing: -0.01em;
}
.container {
    max-width: 720px;
    margin: 0 auto;
    padding: 80px 24px 120px;
}
h1 {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    margin-bottom: 8px;
}
.updated {
    color: var(--gray-mid);
    font-size: 0.9rem;
    margin-bottom: 48px;
}
h2 {
    font-size: 1.4rem;
    font-weight: 700;
    margin-top: 40px;
    margin-bottom: 16px;
    letter-spacing: -0.02em;
}
p, li {
    margin-bottom: 12px;
    color: var(--black);
}
ul {
    padding-left: 24px;
    margin-bottom: 16px;
}
a {
    color: var(--accent);
    text-decoration: underline;
}
.back {
    display: inline-block;
    margin-bottom: 32px;
    color: var(--gray-mid);
    text-decoration: none;
    font-size: 0.9rem;
}
.back:hover { color: var(--black); }
```

## Responsive breakpoints visible in the MCP page

- 980 pixels: fixed navigation changes to the full-screen mobile overlay.
- 760 pixels: page sections stack, padding reduces, cards become one column, footer bottom becomes a column.
- 480 pixels: action rows stack, command text shrinks, prompt pills become a grid.
- Reduced motion: smooth scrolling is disabled and transition duration is nearly zero.
