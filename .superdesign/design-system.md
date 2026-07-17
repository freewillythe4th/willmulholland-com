# Intelligent Growth website design system

Status: Current production visual system, documented 14 July 2026.

Sources inspected: `index.html`, `mcp.html`, `terms.html`, `privacy.html`, and every asset in `images/ig-logo/`.

The MCP funnel sketch was approved on 14 July 2026. Preserve this visual system while implementing the approved information architecture and conversion flow.

## Brand character

Intelligent Growth is editorial, practical, direct, and human. The site combines an expressive serif for ideas with a disciplined sans serif for instruction and interface copy. The look is mostly white, warm black, and royal blue, with off-white panels, restrained radial washes, thin dark borders, and tactile shadows.

The visual system should feel like an experienced marketer's working system, not a generic SaaS template. Keep layouts spacious, copy led, and specific. Use diagrams, code-like labels, and real proof where they help explain a workflow. Avoid decorative gradients, neon palettes, glass-heavy cards, stock illustrations, and unfamiliar typefaces.

## Logo, mandatory

Every Intelligent Growth design must use the real Intelligent Growth logo. Never redraw, regenerate, approximate, trace, or replace it with text, initials, a generic mountain, or a placeholder mark.

The current web navigation uses:

- `/images/ig-logo/ig-logo-full.png`, 426 by 318 pixels, rendered at 46 pixels high with automatic width.
- Alt text: `Intelligent Growth`.
- On the dark mobile menu, the existing asset may be inverted with `filter: brightness(0) invert(1)`.

Available real assets:

- `images/ig-logo/ig-logo-full.png`, standard stacked mountain and wordmark.
- `images/ig-logo/ig-logo-full-hires.png`, 2048 by 1530, high resolution stacked lockup.
- `images/ig-logo/ig-logo-full.svg`, vector version of the stacked lockup.
- `images/ig-logo/ig-nav-lockup.png`, 645 by 140, horizontal navigation lockup.
- `images/ig-logo/ig-wordmark-1line.png`, 1572 by 120, one-line wordmark.
- `images/ig-logo/ig-lockup-bigword.png`, 1605 by 150, wide lockup.
- `images/ig-logo/ig-mark.png`, 388 by 164, mountain mark.
- `images/ig-logo/ig-word.png`, 426 by 159, stacked wordmark.

Choose the real asset whose proportions fit the placement. Preserve its aspect ratio and transparent background. Use a high resolution or vector source for large output. Visually verify any derived colour treatment before shipping.

## Colour system

Core tokens:

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
}
```

Usage:

- `#FFFFFF` is the main page canvas, card surface, and light text on dark areas.
- `#F4F4F2` is the soft section band, muted card surface, and quiet chip background.
- `#1F1511` is the primary text, dark section, dark button, card outline, and code surface. It is a warm black, not pure black.
- `#5C4F47` is body copy and secondary information.
- `#8B7E73` is metadata, muted labels, and lower emphasis text.
- `#2563EB` is the main action, link, selected state, accent dot, and highlighted number.
- `#DBEAFE` is the quiet blue chip and badge surface.
- `#1E3A8A` is blue text on light blue and the darker link or eyebrow colour.

Supporting colours are rare and contextual:

- `#A3E635` is a small live or active signal on dark backgrounds, never a general action colour.
- `#B0413E` marks a problem or crossed-out old state.
- `#E06C5A`, `#E0B44A`, and `#4FA56B` appear only as tiny window controls in the file-tree card.

Approved translucent values include:

- Quiet dark borders: `rgba(31,21,17,0.06)` through `rgba(31,21,17,0.14)`.
- Stronger input border: `rgba(31,21,17,0.25)`.
- Quiet white borders on dark surfaces: `rgba(255,255,255,0.10)` through `rgba(255,255,255,0.16)`.
- Dark secondary copy: `rgba(255,255,255,0.60)` through `rgba(255,255,255,0.80)`.
- Blue panel border: `rgba(37,99,235,0.14)` through `rgba(37,99,235,0.16)`.

Background effects should remain faint. The homepage hero uses blue at 0.10 opacity, lime at 0.07 opacity, and a sparse 28 pixel dot grid. The newsletter panel uses `#F8FBFF` to `#F3F7FF`. Do not introduce new gradient colours.

The legal pages are a deliberately plain variant. They use pure black `#000000`, white, `#525252`, and the same `#2563EB` link colour.

## Typography

Load from Google Fonts:

- `Inter`, weights 300 through 900.
- `Instrument Serif`, regular and italic.

Roles:

- Display headings use `Instrument Serif, Georgia, serif`, usually weight 400.
- Body copy, navigation, buttons, labels, inputs, and interface text use `Inter, sans-serif`.
- Commands, compact metadata, technical labels, counters, and file-tree details use `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` or the browser monospace fallback.

Type behaviour:

- Body default: 16 pixels, line height 1.5, letter spacing `-0.02em`.
- Long body copy: 17 to 18 pixels, line height 1.55 to 1.7.
- Hero display: fluid, generally `clamp(40px, 5.6vw, 84px)` on the current homepage and `clamp(52px, 8.3vw, 112px)` on the MCP page. Use line height 0.92 to 1.05.
- Section display: usually `clamp(36px, 6vw, 72px)` or `clamp(44px, 6.5vw, 78px)`, with line height near 1.
- Card display: 28 to 44 pixels.
- Labels and eyebrows: 11 to 12 pixels, Inter 700, uppercase, letter spacing 0.10em to 0.16em.
- Navigation: 14 pixels, Inter 500, uppercase, letter spacing 0.10em.
- Buttons: 13 to 14 pixels, Inter 600 or 700, uppercase for primary page actions. The compact navigation action uses sentence case.
- Legal pages: Inter only. Heading one is `clamp(2rem, 5vw, 3rem)` at weight 800. Heading two is 1.4rem at weight 700.

Keep serif headings concise. Use italic Instrument Serif only for a small phrase of emphasis, not an entire interface. Do not add another display face.

## Layout and spacing

The system uses generous page spacing and compact internal card spacing.

Primary layout values:

- Navigation gutters: 48 pixels desktop, 24 pixels below 980 pixels.
- Standard section gutters: 48 pixels desktop, 24 pixels mobile.
- Homepage section vertical padding: usually 80 to 100 pixels.
- MCP section vertical padding: 100 pixels desktop, 72 pixels below 760 pixels.
- Hero top clearance: 120 to 160 pixels to account for fixed navigation.
- General content maximum: 1180 to 1200 pixels.
- Wide homepage maximum: 1400 pixels.
- Focused FAQ maximum: 900 to 960 pixels.
- Legal page maximum: 720 pixels.
- Common grid gaps: 18, 22, 24, 28, 32, 40, 48, and 64 pixels.
- Common card padding: 24 to 44 pixels. Large feature cards may use 56 to 64 pixels.

Use a 4 pixel base rhythm, with most visible spacing landing on 8, 12, 16, 18, 22, 24, 28, 32, 40, 48, 64, 72, 80, or 100 pixels. Maintain clear separation between an eyebrow, heading, body copy, and action group.

Desktop layouts favour two or three columns. Most grids collapse to one column between 800 and 900 pixels. The homepage hero uses a two-column 1.04fr and 0.96fr split with a 64 pixel gap. The MCP hero is a single wide copy column.

## Borders, radii, and shadows

Borders are thin and visible. They help the page feel like a working document and keep soft surfaces grounded.

- Default card border: 1 pixel solid `#1F1511` or `rgba(31,21,17,0.08)` through `0.14` for quieter cards.
- Selected or result panel border: up to 1.5 pixels in `#2563EB`.
- Section dividers: 1 pixel at 0.10 to 0.12 dark opacity.
- Dark surface borders: 1 pixel at 0.10 to 0.16 white opacity.
- Small chips: 8 pixel radius.
- Inputs, small panels, and media: 12 to 18 pixel radius.
- Main cards: 16 to 24 pixel radius.
- Pills and primary actions: 999 pixel radius.
- Occasional editorial image shapes: asymmetric 100 and 24 pixel corners.

Shadow tokens:

```css
--warm-shadow: 0 12px 32px rgba(31,21,17,0.10), 0 2px 8px rgba(31,21,17,0.06);
--warm-shadow-hover: 0 20px 48px rgba(31,21,17,0.16), 0 4px 12px rgba(31,21,17,0.08);
--offset-shadow: 6px 6px 0 rgba(31,21,17,0.14);
```

Use the soft warm shadow for floating media and softer cards. Use the offset shadow for outlined product, proof, pricing, testimonial, and system cards. On hover, offset cards move 2 pixels up and left and expand the shadow to 9 pixels. Do not mix multiple shadow styles on one component.

## Shared components

### Fixed navigation

- Fixed at the top with z-index 1000.
- Desktop padding is 20 by 48 pixels.
- Background is white at 0.82 to 0.94 opacity with a 10 to 16 pixel backdrop blur. MCP pages use the same white treatment as the homepage and `/brain`.
- Bottom border is 1 pixel `rgba(31,21,17,0.06)`.
- Use the real logo at 46 pixels high.
- Links are uppercase Inter labels with a 32 pixel gap.
- The final action is a dark sentence-case pill that becomes blue on hover and rises 1 pixel.
- The navigation hides upward when scrolling down and returns when scrolling up.

At 980 pixels and below, replace links with the burger control. The menu becomes a full-screen warm-black panel that slides in from the right. Links are 22 pixels and white. Lock body scroll while open. Invert the real logo for the dark panel. Support Escape, maintain `aria-expanded`, and restore the menu state when a link is chosen.

### Buttons and calls to action

- Primary: warm black surface, white text, 16 by 32 pixel padding, 999 pixel radius.
- Blue primary actions are allowed for the single most important conversion or member action.
- Secondary: transparent surface, 1 pixel warm-black border, matching size and pill radius.
- Hover: primary becomes blue, both primary and secondary may tighten from a pill to a 16 pixel radius over 0.5 seconds.
- Compact navigation action: 10 by 18 pixel padding, 13 pixel type.
- On screens below 480 pixels, stack major action groups and make buttons full width or stretch aligned.

### Eyebrows and labels

Use a 12 pixel uppercase Inter label at weight 700 and 0.14em tracking. Standard section labels use deep blue text and an 8 pixel blue dot with a 10 to 12 pixel gap. Technical labels may omit the dot and use gray. Keep one label system per section.

### Cards

The established card family includes:

- Outlined offset card: white, 1 pixel ink border, 16 to 20 pixel radius, offset shadow.
- Soft information card: white or off-white, quiet border, 12 to 18 pixel radius, warm shadow or no shadow.
- Dark card: warm-black surface, white type, blue or light-blue details.
- Blue emphasis card: blue surface, white type, used sparingly.
- Editorial proof card: image or system visual above compact text, with gentle hover lift.

Cards may move up by 4 to 6 pixels on hover. A grid should use consistent surfaces and radii, unless an intentional dark or blue card marks a different state.

### Chips, badges, and code

- Quiet chip: off-white, gray text, 8 pixel radius, 6 to 13 pixel padding.
- Blue chip or access badge: light-blue surface, deep-blue text, 700 weight.
- Status pill: 999 pixel radius, compact uppercase label.
- Commands: warm-black code block, white text, 12 pixel radius, 13 pixel monospace, 18 by 20 pixel padding, horizontal scrolling when needed.
- Never allow a long command to force the page wider than the viewport.

### Forms

- Text inputs use Inter, 15 to 16 pixel type, white background, 14 to 18 pixel internal padding.
- Hero email input is a pill. Newsletter fields may be square or lightly rounded inside a compact panel.
- Default input border is dark at 0.15 to 0.25 opacity. Focus border is blue.
- Submit actions are blue with white text and a clear disabled or in-progress label.
- Put result or error copy next to the form without shifting the whole page unexpectedly.
- Never capture or display sensitive values in decorative UI or analytics.

### FAQ

- One question per row with a 1 pixel quiet divider.
- Question is 19 pixels, weight 600, with at least 24 pixels of vertical padding.
- Use a plus icon that rotates 45 degrees when open.
- Answer is 16 pixels, gray, line height 1.6 to 1.65, with a readable maximum width.
- Prefer native `details` and `summary`, or provide equivalent button semantics and state.

### Footer

- Warm-black full-width surface with generous 80 to 120 pixel top padding.
- Large Instrument Serif statement or editorial call to action.
- White primary copy, muted white secondary copy, thin white dividers.
- Links are compact and become blue or white on hover.
- Footer metadata uses 12 pixel uppercase monospace with 0.10em tracking.
- Mobile stacks columns and action groups. Long email addresses may wrap anywhere.

### Legal pages

Terms and privacy intentionally remove the marketing shell. Use a 720 pixel reading column with 80 pixel top and 120 pixel bottom padding, Inter only, strong black headings, 1.6 line height, blue underlined links, and a quiet back link. Do not add cards, serif display type, decorative backgrounds, or funnel actions to these pages.

## Responsive rules

Design mobile-first behaviour as a reflow of the same content, not a separate visual identity.

- Above 1100 pixels: the optional fixed quick-link dock may appear.
- At 980 pixels: switch navigation to the full-screen mobile menu.
- At 900 pixels: collapse two-column heroes and major feature grids. Remove decorative card rotation. Stage and media sections become one column.
- At 880 pixels: testimonial pairs become one column.
- At 800 pixels: three-column proof grids and most two-column content become one column. Package rows stack. Footer sitemap becomes two columns.
- At 760 pixels: MCP sections use 72 by 24 pixel padding. Pricing, skill, and install grids become one column. Workflow connector diagrams become vertical and may hide complex SVG connectors.
- At 700 pixels: two-column supporting detail grids become one column.
- At 640 pixels: hero and trust spacing tighten, large cards use 20 to 24 pixel gutters, and footer cards reduce internal padding.
- At 600 pixels: form rows stack.
- At 500 pixels: five-column timelines become one column.
- At 480 pixels: major action groups stack, code type drops to 12 pixels, prompt pills become a vertical list, wide tables scroll, and footer links wrap.

Do not reduce body text below 16 pixels for primary content. Preserve a minimum 24 pixel page gutter on most mobile pages, with 20 pixels permitted for dense system diagrams.

## Motion and interaction

Primary easing:

```css
--ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
```

Motion is used to explain state and reward interaction. It should remain calm and short.

- Navigation hide and mobile menu slide: 0.4 seconds.
- Link opacity and button radius changes: 0.3 to 0.5 seconds.
- Card hover lift and shadow change: 0.4 to 0.5 seconds.
- FAQ icon and answer state: 0.3 to 0.4 seconds.
- System diagrams may pulse, reveal rows in sequence, draw connectors, or count up once when entering view.
- The current homepage hero and general scroll-reveal content render immediately. Do not reintroduce page-wide entrance fades.
- Marquee and custom cursor code exist in the older base CSS, but the current homepage hides the cursor and removes the marquee. Do not treat either as an active pattern.

Always support `prefers-reduced-motion: reduce`. Disable pulsing, counting transitions, row reveals, logo rotation, connector drawing, and smooth scrolling where relevant. The complete content and final state must remain visible without animation.

## Accessibility expectations

- Use semantic landmarks: `nav`, `header`, `main`, `section`, and `footer`.
- Keep heading levels in a logical order.
- Give every meaningful image accurate alt text. Decorative SVGs and repeated decorative marks use `aria-hidden="true"`.
- The real logo link uses alt text `Intelligent Growth`.
- Every icon-only link or button needs an `aria-label`.
- Interactive controls must work by keyboard. The mobile menu supports Escape and accurate `aria-expanded` state.
- Use a visible focus style. The MCP page standard is a 3 pixel blue outline with a 4 pixel offset for links, buttons, and summaries.
- Keep native focus behaviour or an equally visible custom treatment for inputs.
- Do not rely on colour alone for status or access level. Pair colour with text, icon shape, or state copy.
- Maintain readable contrast. Use deep blue, not bright blue, for small text on light-blue surfaces.
- Tap targets should be at least 44 by 44 pixels where practical.
- Tables must use header cells and scroll horizontally on narrow screens.
- Form fields require clear labels or unambiguous accessible names, and errors must be available to assistive technology.
- Honour reduced-motion preferences and never hide required content behind animation.
- Avoid horizontal page scrolling. Long code blocks and tables handle their own overflow.

## Funnel design constraint

The new MCP funnel must inherit this system exactly: real logo, Instrument Serif display type, Inter interface type, warm-black and white base, royal blue actions, off-white panels, thin borders, tactile shadows, spacious gutters, and the existing responsive menu.

The approved funnel uses the conversion-led Superdesign direction and its connected setup flow. This document remains the visual source of truth for further pages and components.
