# Page dependency trees

## Static page model

The site has no component import graph. Each page contains its complete HTML and CSS. Local JavaScript dependencies are traced below. Image files are listed when they render in the page body. Favicon and social preview assets are metadata, not visible page components.

## /mcp

Entry: `mcp.html`

Rendered structure:

- Fixed site navigation
- Hero
- Skills grid
- Free and member tier comparison
- Four-step installation section
- Native details and summary FAQ
- Install and newsletter footer

Dependencies:

- `mcp.html`
  - `images/ig-logo/ig-logo-full.png`, rendered navigation logo
  - `js/analytics.js`, module script
    - `js/analytics-core.mjs`, campaign sanitizing, link classification, API classification, and request enrichment
  - `images/favicon/favicon-32.png`, metadata
  - `images/favicon/favicon-16.png`, metadata
  - `images/favicon/favicon.ico`, metadata
  - `images/favicon/apple-touch-icon.png`, metadata
  - `images/og/og-card.png`, social preview metadata
  - Google Fonts, external Inter and Instrument Serif CSS
  - Beehiiv subscribe embed, external iframe

No local HTML component files or external stylesheets are imported. The full page style and navigation behavior are inside `mcp.html`.

## /

Entry: `index.html`

Rendered structure:

- Fixed site navigation
- Marketing Brain hero and email form
- Marketing system explanation and proof sections
- Community, workshop, and services paths
- Case studies and testimonials
- Newsletter section
- Large contact and sitemap footer
- Context-sensitive quick dock

Dependencies:

- `index.html`
  - `images/ig-logo/ig-logo-full.png`
  - `images/blinq/logo.svg`
  - `images/case-studies/ebay-pla.jpg`
  - `images/case-studies/promptcowboy-hero.png`
  - `images/clemenger-bbdo/bbdo.svg`
  - `images/ebay/logo.svg`
  - `images/events/canva.svg`
  - `images/events/generate.svg`
  - `images/events/pma.png`
  - `images/events/salesforce.svg`
  - `images/headshot.jpg`
  - `images/kfc/logo.svg`
  - `images/nextdocs/logo.png`
  - `images/ogilvy/logo.svg`
  - `images/prompt-cowboy/logo.png`
  - `images/speaking/generate-mic.jpg`
  - `images/startmate/logo.svg`
  - `images/testimonials/lotus-z.jpg`
  - `images/testimonials/pallavi-roy.jpg`
  - `images/velocity/logo.svg`
  - YouTube thumbnail, external image
  - `js/analytics.js`
    - `js/analytics-core.mjs`
  - favicon and social preview metadata assets
  - Google Fonts, external Inter and Instrument Serif CSS

`index.html` is over 2500 lines and contains several additional inline `<style>` and `<script>` blocks. For later design context, use relevant line ranges from the actual rendered section plus the navigation and footer ranges recorded in `layouts.md`.

## /terms

Entry: `terms.html`

Rendered structure:

- Centered legal document container
- Back link
- Inter heading and updated date
- Stacked paragraphs, lists, and section headings

Dependencies:

- `terms.html`
  - `js/analytics.js`
    - `js/analytics-core.mjs`
  - favicon and social preview metadata assets
  - Google Fonts, external Inter CSS

There is no rendered logo, navigation, footer, image, or separate stylesheet.

## /privacy

Entry: `privacy.html`

Rendered structure:

- Centered legal document container
- Back link
- Inter heading and updated date
- Stacked paragraphs, lists, section headings, and external policy links

Dependencies:

- `privacy.html`
  - `js/analytics.js`
    - `js/analytics-core.mjs`
  - favicon and social preview metadata assets
  - Google Fonts, external Inter CSS

There is no rendered logo, navigation, footer, image, or separate stylesheet.

## Shared analytics integration

All four entries load this exact module tag in the document head:

```html
<script type="module" src="/js/analytics.js"></script>
```

`js/analytics.js` initializes PostHog with autocapture and session recording disabled. It records page views and page leaves, classifies link clicks by destination and placement, records MCP install intent and membership checkout intent, tracks first-party form outcomes, stores sanitized first-touch and latest-touch campaign attribution, and removes advertising click identifiers. The module imports all classification and sanitizing functions from `js/analytics-core.mjs`.
