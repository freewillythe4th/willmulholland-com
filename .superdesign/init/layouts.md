# Shared layout patterns

## Source model

There are no imported layout components. Each HTML page owns its shell markup and CSS. `mcp.html` and `index.html` repeat the same fixed navigation pattern, use the same 46 pixel Intelligent Growth logo asset, and use related dark footer patterns. `terms.html` and `privacy.html` intentionally use a minimal document shell with no navigation or footer.

## MCP fixed navigation

- Source: `mcp.html`
- Renders on: `/mcp`
- Behavior: fixed translucent header, hide on downward scroll after 120 pixels, full-screen mobile menu below 980 pixels, Escape closes the menu.

Full markup:

```html
<nav>
    <a href="/" class="nav-logo"><img src="/images/ig-logo/ig-logo-full.png" alt="Intelligent Growth" style="height:46px;width:auto;display:block;"></a>
    <div class="nav-links" id="navLinks">
        <a href="/workshop">Workshop</a>
        <a href="/brain">Marketing Brain</a>
        <a href="/mcp">MCP</a>
        <a href="/work-with-me">Work with me</a>
        <a href="/work.html">Case studies</a>
        <a href="/podcast">Podcast</a>
        <a href="/blog">Blog</a>
        <a href="/traffic">Free gift</a>
        <a href="#install" class="nav-cta">Install the MCP</a>
    </div>
    <button type="button" class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="navLinks">
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
    </button>
</nav>
```

Full navigation CSS:

```css
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
```

Full navigation behavior:

```html
<script>
    (function() {
        var toggle = document.getElementById('navToggle');
        var links = document.getElementById('navLinks');
        if (!toggle || !links) return;
        function setOpen(open) {
            toggle.classList.toggle('is-open', open);
            links.classList.toggle('is-open', open);
            document.body.classList.toggle('nav-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        toggle.addEventListener('click', function() { setOpen(!links.classList.contains('is-open')); });
        links.querySelectorAll('a').forEach(function(a) { a.addEventListener('click', function() { setOpen(false); }); });
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && links.classList.contains('is-open')) setOpen(false); });
    })();

    (function () {
        var nav = document.querySelector('nav');
        if (!nav) return;
        var last = window.pageYOffset;
        window.addEventListener('scroll', function () {
            var y = window.pageYOffset;
            if (y > last && y > 120) nav.classList.add('nav--hidden');
            else nav.classList.remove('nav--hidden');
            last = y;
        }, { passive: true });
    })();
</script>
```

## MCP footer

- Source: `mcp.html`
- Renders on: `/mcp`
- Structure: large dark install call to action, Beehiiv subscribe iframe, terminal command, and compact legal row.

Full markup:

```html
<footer>
    <div class="footer-install">
        <h2>Give your AI the method.</h2>
        <p>Start free in two minutes, or join Intelligent Growth OS for every craft skill and the complete reference library.</p>
        <div class="footer-actions">
            <a href="https://intelligent-growth.beehiiv.com/upgrade" class="btn-primary">Join Intelligent Growth OS</a>
        </div>
        <div class="footer-subscribe">
            <div class="command-label">Or start with the free newsletter and tools</div>
            <iframe src="https://embeds.beehiiv.com/d946ff58-e98b-4ce9-8e62-73a698514f47?slim=true" data-test-id="beehiiv-embed" height="52" frameborder="0" scrolling="no" style="margin: 0; border-radius: 0; background-color: transparent; width: 100%; max-width: 480px;" title="Subscribe to Intelligent Growth"></iframe>
        </div>
        <div class="footer-command">
            <div class="command-label">Free Claude Code install</div>
            <pre><code>claude mcp add intelligent-growth --transport http https://mcp.intelligentgrowth.app/mcp</code></pre>
        </div>
    </div>
    <div class="footer-bottom">
        <span>&copy; 2026 Will Mulholland. All rights reserved.</span>
        <div class="footer-links">
            <a href="/">Home</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
        </div>
    </div>
</footer>
```

Full footer CSS:

```css
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

@media (max-width: 760px) {
    footer { padding: 72px 24px 30px; }
    .footer-bottom { flex-direction: column; }
}

@media (max-width: 480px) {
    .footer-actions { align-items: stretch; flex-direction: column; }
    .footer-links { gap: 18px; flex-wrap: wrap; }
}
```

## Home page shell reference

- Source: `index.html`
- Renders on: `/`
- Shared pattern: same fixed navigation structure, menu items, logo image, burger control, and hide-on-scroll behavior.
- Difference from `/mcp`: the final action says Subscribe and targets `#subscribe`. The home footer is larger and includes email, social icons, a service card, and a four-column sitemap.

Full home navigation markup:

```html
<nav>
    <a href="/" class="nav-logo" style="mix-blend-mode: normal; isolation: isolate; position: relative; z-index: 2000;"><img src="/images/ig-logo/ig-logo-full.png" alt="Intelligent Growth" style="height:46px;width:auto;display:block;"></a>
    <div class="nav-links" id="navLinks">
        <a href="/workshop">Workshop</a>
        <a href="/brain">Marketing Brain</a>
        <a href="/mcp">MCP</a>
        <a href="/work-with-me">Work with me</a>
        <a href="work.html">Case studies</a>
        <a href="/podcast">Podcast</a>
        <a href="/blog">Blog</a>
        <a href="/traffic">Free gift</a>
        <a href="#subscribe" class="nav-cta" id="navSubscribe">Subscribe</a>
    </div>
    <button type="button" class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="navLinks">
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
    </button>
</nav>
```

Full home footer markup:

```html
<footer id="contact">
    <div class="footer-main" style="flex-direction: column; align-items: stretch;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start;" class="footer-grid">
            <div class="footer-cta">
                <h2>LET'S<br>BUILD.</h2>
                <a href="mailto:will@intelligentgrowth.app">will@intelligentgrowth.app</a>
                <p>Or just email me. I read everything.</p>
                <div class="footer-social" style="margin-top: 32px;">
                    <a href="https://www.linkedin.com/in/willmulholland/" target="_blank" rel="noopener" title="LinkedIn" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg></a>
                    <a href="https://www.youtube.com/@WillMulholland" target="_blank" rel="noopener" title="YouTube" aria-label="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg></a>
                </div>
            </div>
            <div class="footer-cta-card" style="background: var(--cream); border-radius: 18px; padding: 40px 32px; display: flex; flex-direction: column; justify-content: center; min-height: 280px; transition: transform 0.5s var(--ease-smooth), box-shadow 0.5s var(--ease-smooth); box-shadow: var(--warm-shadow);">
                <h3 style="font-family: 'Instrument Serif', Georgia, serif; font-size: 36px; font-weight: 400; margin-bottom: 14px; color: var(--ink); line-height: 1.05; letter-spacing: -0.02em;">Want it built with you?</h3>
                <p style="font-size: 16px; color: var(--gray-mid); margin-bottom: 24px; line-height: 1.5;">Tell me what you're working on. I'll come back within 24 hours with the right next step.</p>
                <a href="/work-with-me" style="display: inline-block; background: var(--ink); color: #fff; padding: 14px 28px; border-radius: 999px; font-weight: 600; text-decoration: none; text-align: center; align-self: flex-start; transition: background 0.4s var(--ease-smooth);">Build it with me</a>
            </div>
        </div>
    </div>

    <div class="footer-sitemap">
        <div class="footer-col">
            <h5>Will Mulholland</h5>
            <p>I build AI marketing systems with teams, and teach marketers to build their own. Sydney, working globally.</p>
        </div>
        <div class="footer-col">
            <h5>Work with me</h5>
            <ul>
                <li><a href="/work-with-me">Work with me</a></li>
                <li><a href="/work-with-me">Team training</a></li>
                <li><a href="/work-with-me">Fractional embed</a></li>
                <li><a href="/work-with-me">Speaking</a></li>
                <li><a href="/work-with-me">Sponsorship</a></li>
            </ul>
        </div>
        <div class="footer-col">
            <h5>Work</h5>
            <ul>
                <li><a href="work.html">All case studies</a></li>
                <li><a href="work.html#ebay-pla">eBay</a></li>
                <li><a href="work.html#prompt-cowboy">Prompt Cowboy</a></li>
            </ul>
        </div>
        <div class="footer-col">
            <h5>Blog</h5>
            <ul>
                <li><a href="#newsletter">Intelligent Growth newsletter</a></li>
                <li><a href="/podcast">The podcast</a></li>
                <li><a href="https://www.youtube.com/@WillMulholland" target="_blank">YouTube</a></li>
                <li><a href="https://www.linkedin.com/in/willmulholland/" target="_blank">LinkedIn</a></li>
            </ul>
        </div>
    </div>

    <div class="footer-bottom">
        <span>&copy; 2026 Will Mulholland. All rights reserved.</span>
        <div class="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
        </div>
    </div>
</footer>
```

## Legal document shell

- Sources: `terms.html` and `privacy.html`
- Renders on: `/terms` and `/privacy`
- Structure: centered 720 pixel document column, back link, large Inter heading, updated date, and stacked prose sections.
- No navigation, footer, logo, or Instrument Serif display type is rendered.

Full shell CSS, identical in both pages:

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

Full top-level body pattern from `terms.html`:

```html
<body>
    <div class="container">
        <a href="/" class="back">&larr; Back to intelligentgrowth.app</a>
        <h1>Terms of Service</h1>
        <p class="updated">Last updated: 20 May 2026</p>
        <!-- The document sections continue in this same container. -->
    </div>
</body>
```
