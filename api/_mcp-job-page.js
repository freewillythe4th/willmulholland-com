const JOBS = Object.freeze({
  'competitive-gap': {
    eventJob: 'competitive-gap',
    eyebrow: 'Free competitive gap workflow',
    title: 'Find the competitive opening your next positioning decision can use.',
    description: 'Bring the competitors buyers compare you with. Intelligent Growth finds repeated claims, weak spots and usable openings, then tells you what needs more evidence.',
    question: 'Where is the market crowded, and where can your product credibly stand apart?',
    inputs: ['Your product or homepage', 'Three to five competitor pages', 'The buyer and use case', 'Any customer evidence or business constraint'],
    outputs: ['Repeated category patterns', 'Gaps and weakly owned claims', 'A recommended opening', 'Reasoning, assumptions and missing proof'],
    example: 'Instead of another list of competitor features, the result identifies the claim everyone already owns, the opening your evidence can support and what to validate before using it.',
    cta: 'Run the free competitive gap',
  },
  'positioning-review': {
    eventJob: 'positioning',
    eyebrow: 'Positioning review for product marketers',
    title: 'Turn a vague difference into a positioning direction you can defend.',
    description: 'Bring the homepage, product context, customer evidence and alternatives. Intelligent Growth recommends the market frame and difference, then shows the assumptions behind the call.',
    question: 'What should this product be known for, by whom, and against which alternative?',
    inputs: ['Current homepage or positioning', 'Audience and use case', 'Alternatives buyers consider', 'Customer evidence and business goal'],
    outputs: ['A recommended market frame', 'A differentiated value', 'Reasoning tied to your context', 'Assumptions and missing proof'],
    example: 'The result makes one positioning call, explains why that direction is stronger than the alternatives and separates evidence from assumptions so the team knows what to test.',
    cta: 'Review my positioning',
  },
  'messaging-review': {
    eventJob: 'messaging',
    eyebrow: 'Messaging review for product marketers',
    title: 'Turn scattered customer language into a message the team can use.',
    description: 'Bring the offer, customer language, current message and proof. Intelligent Growth builds a hierarchy, sharpens the value and flags where the claim outruns the evidence.',
    question: 'What should we say first, what supports it, and what can we prove?',
    inputs: ['The offer and audience', 'Interview notes or customer language', 'Current homepage or sales message', 'Available proof and objections'],
    outputs: ['A clear messaging hierarchy', 'Value propositions and support points', 'Proof and objection gaps', 'A usable first draft to edit'],
    example: 'The result prioritises one lead message, builds the supporting story below it and shows which claims need customer proof before they become homepage copy.',
    cta: 'Sharpen my messaging',
  },
  'launch-brief': {
    eventJob: 'launch',
    eyebrow: 'Launch brief for product marketers',
    title: 'Make the launch call, align the team and get the useful work moving.',
    description: 'Bring the product change, audience, deadline, evidence and constraint. Intelligent Growth recommends the launch shape and turns it into a brief, actions and measures.',
    question: 'What kind of launch does this change deserve, and what must happen for it to work?',
    inputs: ['The product change and audience', 'Deadline and business goal', 'Customer evidence and readiness', 'Channels, owners and constraints'],
    outputs: ['A recommended launch call', 'Narrative and launch brief', 'Channel and stakeholder actions', 'Measures tied to the launch goal'],
    example: 'The result distinguishes a meaningful market launch from a product update, then gives each stakeholder the actions and measures that follow from that decision.',
    cta: 'Plan my launch',
  },
});

export const JOB_PAGE_SLUGS = Object.freeze(Object.keys(JOBS));

function list(items) {
  return items.map((item) => `<li>${item}</li>`).join('');
}

function renderPositioningPage() {
  const freeStartUrl = '/mcp/start?job=positioning_diagnosis';
  const memberStartUrl = '/mcp/start?job=positioning';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Free positioning diagnosis and full positioning review | Intelligent Growth</title>
  <meta name="description" content="Diagnose the market frame buyers are likely to assume, the biggest positioning risk, the missing evidence and the next research action.">
  <link rel="canonical" href="https://intelligentgrowth.app/mcp/positioning-review">
  <link rel="icon" type="image/png" href="/images/favicon/favicon-32.png">
  <link rel="stylesheet" href="/css/mcp-funnel.css">
  <script type="module" src="/js/analytics.js"></script>
  <script type="module" src="/js/mcp-nav.js"></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <nav class="site-nav" aria-label="Primary navigation">
    <a class="site-nav__brand" href="/" aria-label="Intelligent Growth home"><img src="/images/ig-logo/ig-logo-full.png" alt="Intelligent Growth"></a>
    <div class="site-nav__links" id="site-nav-links"><a href="/mcp">MCP overview</a><a href="/mcp#catalogue">All workflows</a><a class="button button-primary button-small" href="${freeStartUrl}" data-ig-event="mcp_start_clicked" data-ig-job="positioning_diagnosis" data-ig-placement="navigation">Start free diagnosis</a></div>
    <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav-links"><span></span><span></span><span></span></button>
  </nav>
  <main id="main">
    <header class="hero job-page-hero">
      <div class="container">
        <p class="eyebrow">Free positioning diagnosis</p>
        <h1>Find what your positioning currently communicates.</h1>
        <p class="lead">See the market frame buyers are likely to assume, the biggest weakness in the current story, and the proof you still need.</p>
        <div class="hero__actions"><a class="button button-primary" href="${freeStartUrl}" data-ig-event="mcp_start_clicked" data-ig-job="positioning_diagnosis" data-ig-placement="hero">Diagnose my positioning</a><a class="button button-secondary" href="#member-workflow">See full member review</a></div>
      </div>
    </header>
    <section class="section section-white">
      <div class="container job-page-question"><p class="eyebrow">The decision</p><h2>Is your difference visible to a buyer, or only to your team?</h2><p class="lead">Start with the current copy, audience, buyer alternative and available evidence. The diagnosis finds the most important uncertainty before anyone makes a final positioning call.</p></div>
    </section>
    <section class="section" id="what-you-get">
      <div class="container job-page-columns">
        <article class="job-page-list"><p class="eyebrow">Inputs</p><h2>What you bring</h2><ul>${list(['Product and audience', 'Buyer alternative', 'Current homepage copy', 'Available customer evidence'])}</ul></article>
        <article class="job-page-list job-page-list--dark"><p class="eyebrow">Output</p><h2>What comes back</h2><ul>${list(['Current market frame', 'Biggest positioning risk', 'Likely buyer alternative', 'Missing evidence', 'Next research action'])}</ul></article>
      </div>
    </section>
    <section class="section section-white"><div class="narrow"><p class="eyebrow">What useful means</p><h2>A focused diagnosis you can act on.</h2><p class="lead">It makes the current buyer signal visible, separates evidence from assumptions and gives you one useful research action. It is not a final positioning decision.</p><p class="lead">You challenge the diagnosis, check the assumptions and decide what deserves deeper work.</p></div></section>
    <section class="section-blue member-workflow" id="member-workflow">
      <div class="container member-workflow__grid">
        <div><p class="eyebrow">Member workflow</p><h2>Full positioning review</h2><p class="lead">Move from diagnosis to a positioning direction grounded in your product, customer evidence and buyer alternatives.</p><a class="button member-workflow__button" href="${memberStartUrl}" data-ig-event="mcp_start_clicked" data-ig-job="positioning" data-ig-placement="proof">Run the full positioning review</a></div>
        <div class="member-workflow__outputs" aria-label="Full review outputs">
          <article><span>01</span><h3>Final market-frame recommendation</h3></article>
          <article><span>02</span><h3>Differentiated value</h3></article>
          <article><span>03</span><h3>Completed positioning brief</h3></article>
          <article><span>04</span><h3>Reasoning, assumptions and quality criteria</h3></article>
        </div>
      </div>
    </section>
  </main>
  <footer class="mcp-footer"><div class="mcp-footer__inner"><div class="mcp-footer__legal"><span>&copy; 2026 Will Mulholland</span><a href="/mcp">MCP overview</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div></div></footer>
</body>
</html>`;
}

export function renderJobPage(slug) {
  const job = JOBS[slug];
  if (!job) return null;
  if (slug === 'positioning-review') return renderPositioningPage();
  const startUrl = `/mcp/start?job=${encodeURIComponent(job.eventJob)}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${job.title} | Intelligent Growth</title>
  <meta name="description" content="${job.description}">
  <link rel="canonical" href="https://intelligentgrowth.app/mcp/${slug}">
  <link rel="icon" type="image/png" href="/images/favicon/favicon-32.png">
  <link rel="stylesheet" href="/css/mcp-funnel.css">
  <script type="module" src="/js/analytics.js"></script>
  <script type="module" src="/js/mcp-nav.js"></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <nav class="site-nav" aria-label="Primary navigation">
    <a class="site-nav__brand" href="/" aria-label="Intelligent Growth home"><img src="/images/ig-logo/ig-logo-full.png" alt="Intelligent Growth"></a>
    <div class="site-nav__links" id="site-nav-links"><a href="/mcp">MCP overview</a><a href="/mcp#catalogue">All workflows</a><a class="button button-primary button-small" href="${startUrl}" data-ig-event="mcp_start_clicked" data-ig-job="${job.eventJob}" data-ig-placement="navigation">Start this job</a></div>
    <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav-links"><span></span><span></span><span></span></button>
  </nav>
  <main id="main">
    <header class="hero job-page-hero">
      <div class="container">
        <p class="eyebrow">${job.eyebrow}</p>
        <h1>${job.title}</h1>
        <p class="lead">${job.description}</p>
        <div class="hero__actions"><a class="button button-primary" href="${startUrl}" data-ig-event="mcp_start_clicked" data-ig-job="${job.eventJob}" data-ig-placement="hero">${job.cta}</a><a class="text-link" href="#what-you-get">See what comes back</a></div>
      </div>
    </header>
    <section class="section section-white">
      <div class="container job-page-question"><p class="eyebrow">The decision</p><h2>${job.question}</h2><p class="lead">Start with the current page, evidence and constraint. The product should ask for what is missing before it recommends anything.</p></div>
    </section>
    <section class="section" id="what-you-get">
      <div class="container job-page-columns">
        <article class="job-page-list"><p class="eyebrow">Inputs</p><h2>What you bring</h2><ul>${list(job.inputs)}</ul></article>
        <article class="job-page-list job-page-list--dark"><p class="eyebrow">Output</p><h2>What comes back</h2><ul>${list(job.outputs)}</ul></article>
      </div>
    </section>
    <section class="section section-white"><div class="narrow"><p class="eyebrow">What useful means</p><h2>One recommendation, with the thinking visible.</h2><p class="lead">${job.example}</p><p class="lead">You challenge the recommendation, check the assumptions and make the final call.</p></div></section>
    <section class="section-blue final-cta"><div class="narrow"><p class="eyebrow">Run it in your client</p><h2>Bring the current context. Decide from the work.</h2><p class="lead">Connect once, paste the context and get a structured first version you can review.</p><a class="button" href="${startUrl}" data-ig-event="mcp_start_clicked" data-ig-job="${job.eventJob}" data-ig-placement="footer">${job.cta}</a></div></section>
  </main>
  <footer class="mcp-footer"><div class="mcp-footer__inner"><div class="mcp-footer__legal"><span>&copy; 2026 Will Mulholland</span><a href="/mcp">MCP overview</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div></div></footer>
</body>
</html>`;
}
