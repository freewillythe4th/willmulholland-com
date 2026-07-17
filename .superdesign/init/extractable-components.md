# Extractable Superdesign components

## Extraction note

These patterns are embedded in static HTML files. They are candidates for Superdesign DraftComponents, not existing framework components. Preserve the real logo asset, exact labels, inline SVG icons, and CSS values from source.

## SiteNav

- Source: `mcp.html`, navigation markup, CSS, and menu script. Cross-check `index.html` for the Subscribe variant.
- Category: layout
- Description: fixed translucent navigation with Intelligent Growth logo, uppercase links, pill action, and full-screen mobile menu.
- Extractable props: `activeItem` with default `mcp`, `homeHref` with default `/`, `ctaHref` with default `#install`, `isOpen` with default `false`.
- Hardcoded: `images/ig-logo/ig-logo-full.png`, menu labels, burger bars, typography, colors, spacing, breakpoints.

## McpFooter

- Source: `mcp.html`, footer markup and CSS.
- Category: layout
- Description: dark install footer with large display heading, membership action, Beehiiv embed, command block, and legal links.
- Extractable props: `homeHref` with default `/`, `privacyHref` with default `/privacy`, `termsHref` with default `/terms`.
- Hardcoded: heading, install command, Beehiiv embed, copyright, colors, type, and layout.

## HomeFooter

- Source: `index.html`, footer markup and footer CSS.
- Category: layout
- Description: dark two-column contact footer with social icons, service card, sitemap, and legal row.
- Extractable props: `servicesHref` with default `/work-with-me`, `privacyHref` with default `#`, `termsHref` with default `#`.
- Hardcoded: contact copy, social icons, sitemap labels, card copy, typography, colors, and inline styles.

## LegalDocumentShell

- Source: `terms.html` and `privacy.html`.
- Category: layout
- Description: centered 720 pixel legal document with back link, title, date, and stacked prose.
- Extractable props: `homeHref` with default `/`.
- Hardcoded: Inter-only styling, 80 pixel top padding, 120 pixel bottom padding, heading scale, list and link styling.

## HeroActions

- Source: `mcp.html`.
- Category: basic
- Description: wrapping pair of primary and secondary pill actions.
- Extractable props: `primaryHref` with default `#install`, `secondaryHref` with default `https://intelligent-growth.beehiiv.com/upgrade`.
- Hardcoded: action labels, uppercase text, borders, colors, hover radius change.

## SectionHeader

- Source: `mcp.html`.
- Category: basic
- Description: blue dot eyebrow, large Instrument Serif heading, and optional supporting paragraph.
- Extractable props: none.
- Hardcoded: content, 820 pixel width, text sizes, colors, and spacing.

## SkillCard

- Source: `mcp.html`.
- Category: basic
- Description: offset-shadow skill card with code chip, body copy, and optional dark wide variant.
- Extractable props: `isWide` with default `false`.
- Hardcoded: skill label and copy, border, radius, shadow, hover offset, and theme values.

## TierCard

- Source: `mcp.html`.
- Category: basic
- Description: pricing and access comparison card with checkmarked feature list and dark member variant.
- Extractable props: `isMember` with default `false`.
- Hardcoded: tier name, price, feature copy, checkmark, borders, shadow, and colors.

## InstallCard

- Source: `mcp.html`.
- Category: basic
- Description: auto-numbered instruction card with access pill, command block, and explanatory copy.
- Extractable props: `showAccessPill` with default `true`.
- Hardcoded: platform copy, commands, automatic counter, typography, spacing, and colors.

## FAQAccordion

- Source: `mcp.html`.
- Category: basic
- Description: native details and summary row with plus marker and expanded answer.
- Extractable props: `isOpen` with default `false`.
- Hardcoded: question and answer copy, plus marker, borders, typography, and spacing.

## CommandBlock

- Source: `mcp.html`.
- Category: basic
- Description: uppercase micro-label above a dark monospaced command panel.
- Extractable props: none.
- Hardcoded: label, command text, dark background, 12 pixel radius, monospaced font, and horizontal overflow.
