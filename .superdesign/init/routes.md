# Route map

## Routing model

- Hosting: Vercel static hosting.
- Router: `vercel.json` route rules, not a client-side router.
- Page entries: standalone `.html` files.
- The filesystem handle appears after the explicit `/mcp`, `/brain`, `/preview-deck`, and `/augmented` rules. Existing static files and API functions can resolve before the later named routes.
- The final catch-all serves `index.html` for unmatched paths.

## Key routes

- `/` -> `index.html`. Main Intelligent Growth marketing page with fixed navigation, complex self-contained page sections, newsletter forms, a large footer, and quick dock.
- `/mcp` -> `mcp.html`. MCP product page with hero, skills, access tiers, installation guide, FAQ, and install footer.
- `/privacy` -> `privacy.html`. Minimal legal document shell.
- `/terms` -> `terms.html`. Minimal legal document shell.
- `/brain` -> `brain.html`. Marketing Brain page.
- `/workshop` -> `workshop.html`. Workshop page.
- `/work-with-me` -> `work-with-me.html`. Services page.
- `/blog` -> `blog.html`. Blog index.
- `/podcast` -> `podcast.html`. Podcast page.
- `/traffic` -> `traffic.html`. Free resource landing page.

All four key pages load `/js/analytics.js` as a module. `mcp.html` and `index.html` render `/images/ig-logo/ig-logo-full.png` in the navigation. The legal pages do not render a logo.

## Full router configuration

Source: `vercel.json`

```json
{
  "routes": [
    {
      "src": "/brain",
      "dest": "/brain.html"
    },
    {
      "src": "/preview-deck",
      "dest": "/preview-deck.html"
    },
    {
      "src": "/augmented",
      "dest": "/augmented.html"
    },
    {
      "src": "/mcp",
      "dest": "/mcp.html"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/blog",
      "dest": "/blog.html"
    },
    {
      "src": "/blog/marketing-is-the-bottleneck",
      "dest": "/blog/marketing-is-the-bottleneck.html"
    },
    {
      "src": "/blog/claude-prompts-for-product-marketers",
      "dest": "/blog/claude-prompts-for-product-marketers.html"
    },
    {
      "src": "/system",
      "dest": "/system.html"
    },
    {
      "src": "/podcast",
      "dest": "/podcast.html"
    },
    {
      "src": "/workshop",
      "dest": "/workshop.html"
    },
    {
      "src": "/training",
      "dest": "/training.html"
    },
    {
      "src": "/workshop-confirmed",
      "dest": "/workshop-confirmed.html"
    },
    {
      "src": "/workshop-recording",
      "dest": "/workshop-recording.html"
    },
    {
      "src": "/community",
      "dest": "/community.html"
    },
    {
      "src": "/scroll-sequence",
      "dest": "/scroll-sequence.html"
    },
    {
      "src": "/traffic",
      "dest": "/traffic.html"
    },
    {
      "src": "/traffic-thanks",
      "dest": "/traffic-thanks.html"
    },
    {
      "src": "/traffic-guide",
      "dest": "/traffic-guide.html"
    },
    {
      "src": "/resource-download",
      "dest": "/resource-download.html"
    },
    {
      "src": "/check-inbox",
      "dest": "/check-inbox.html"
    },
    {
      "src": "/welcome-survey",
      "dest": "/welcome-survey.html"
    },
    {
      "src": "/resource-delivery",
      "dest": "/resource-delivery.html"
    },
    {
      "src": "/work-with-me",
      "dest": "/work-with-me.html"
    },
    {
      "src": "/survey",
      "dest": "/survey.html"
    },
    {
      "src": "/privacy",
      "dest": "/privacy.html"
    },
    {
      "src": "/terms",
      "dest": "/terms.html"
    },
    {
      "src": "/pitch",
      "dest": "https://ig-pitch.vercel.app/"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```
