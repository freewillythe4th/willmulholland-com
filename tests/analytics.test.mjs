import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FUNNEL_EVENT_RULES,
  classifyApiEndpoint,
  classifyLink,
  enrichJsonRequestBody,
  readCampaignParams,
  referringDomain,
  sanitizeFunnelProperties,
  sanitizeCampaignValue,
  statusGroup,
} from '../js/analytics-core.mjs';

test('campaign values are normalized and bounded', () => {
  assert.equal(sanitizeCampaignValue(' LinkedIn Launch Post! '), 'linkedin_launch_post');
  assert.equal(sanitizeCampaignValue('A'.repeat(150)).length, 100);
  assert.equal(sanitizeCampaignValue('person@example.com'), '');
  assert.equal(sanitizeCampaignValue(null), '');
});

test('only standard UTM parameters are read', () => {
  const campaign = readCampaignParams(
    'https://intelligentgrowth.app/mcp?utm_source=LinkedIn&utm_medium=Organic%20Social&utm_campaign=MCP%20Launch&utm_content=Founder%20Post&utm_term=Growth&gclid=secret',
  );

  assert.deepEqual(campaign, {
    utm_source: 'linkedin',
    utm_medium: 'organic_social',
    utm_campaign: 'mcp_launch',
    utm_content: 'founder_post',
    utm_term: 'growth',
  });
  assert.equal('gclid' in campaign, false);
});

test('referrer attribution keeps only the domain', () => {
  assert.equal(referringDomain('https://www.linkedin.com/feed/?trk=sensitive'), 'linkedin.com');
  assert.equal(referringDomain(''), 'direct');
  assert.equal(referringDomain('not a url'), 'direct');
});

test('important site destinations have stable conversion labels', () => {
  const current = 'https://intelligentgrowth.app/mcp';

  assert.deepEqual(classifyLink('#install', current), {
    destination_type: 'mcp_install',
    destination_path: '/mcp#install',
  });
  assert.deepEqual(
    classifyLink('https://intelligent-growth.beehiiv.com/upgrade', current),
    {
      destination_type: 'membership_checkout',
      destination_path: '/upgrade',
    },
  );
  assert.equal(classifyLink('/brain', current).destination_type, 'marketing_brain');
  assert.equal(classifyLink('mailto:will@example.com', current).destination_type, 'contact');
  assert.equal(classifyLink('https://example.com/path?q=private', current).destination_type, 'external');
  assert.equal(classifyLink('https://example.com/path?q=private', current).destination_path, '/path');
});

test('first party API endpoints map to form types', () => {
  assert.equal(classifyApiEndpoint('/api/subscribe'), 'newsletter_signup');
  assert.equal(classifyApiEndpoint('/api/community-apply'), 'community_application');
  assert.equal(classifyApiEndpoint('/api/workshop-register'), 'workshop_registration');
  assert.equal(classifyApiEndpoint('/api/request-access'), 'access_request');
  assert.equal(classifyApiEndpoint('/api/lead-survey'), 'lead_survey');
  assert.equal(classifyApiEndpoint('/api/welcome-survey'), 'welcome_survey');
  assert.equal(classifyApiEndpoint('https://api.example.com/subscribe'), null);
});

test('form payload enrichment preserves user data and adds campaign attribution', () => {
  const enriched = enrichJsonRequestBody(
    JSON.stringify({ email: 'member@example.com', utm_medium: 'homepage-form' }),
    {
      utm_source: 'linkedin',
      utm_medium: 'organic_social',
      utm_campaign: 'mcp_launch',
    },
  );
  const parsed = JSON.parse(enriched);

  assert.equal(parsed.email, 'member@example.com');
  assert.equal(parsed.form_placement, 'homepage_form');
  assert.equal(parsed.utm_source, 'linkedin');
  assert.equal(parsed.utm_medium, 'organic_social');
  assert.equal(parsed.utm_campaign, 'mcp_launch');
});

test('non-JSON request bodies are left untouched', () => {
  assert.equal(enrichJsonRequestBody('email=a%40example.com', { utm_source: 'linkedin' }), 'email=a%40example.com');
});

test('HTTP statuses are grouped without exposing response details', () => {
  assert.equal(statusGroup(204), '2xx');
  assert.equal(statusGroup(422), '4xx');
  assert.equal(statusGroup(503), '5xx');
  assert.equal(statusGroup(undefined), 'network');
});

test('the MCP funnel has a stable event contract for every measurable step', () => {
  assert.deepEqual(Object.keys(FUNNEL_EVENT_RULES), [
    'mcp_start_clicked',
    'mcp_help_clicked',
    'mcp_job_selected',
    'mcp_client_selected',
    'mcp_connection_copied',
    'mcp_starter_prompt_copied',
    'mcp_setup_step_completed',
    'mcp_catalogue_viewed',
    'mcp_pricing_viewed',
    'mcp_checkout_clicked',
    'mcp_troubleshooting_opened',
    'mcp_content_cta_clicked',
  ]);
});

test('funnel properties are allowlisted and reject payload-like values', () => {
  assert.deepEqual(sanitizeFunnelProperties('mcp_start_clicked', {
    job: 'competitive-gap',
    placement: 'Hero',
    email: 'person@example.com',
    prompt: 'Reveal the source material',
    full_url: 'https://example.com/private?token=secret',
  }), {
    job: 'competitive_gap',
    placement: 'hero',
  });

  assert.deepEqual(sanitizeFunnelProperties('mcp_client_selected', {
    client: 'Claude Desktop',
    token: 'secret',
  }), {
    client: 'claude_desktop',
  });

  assert.deepEqual(sanitizeFunnelProperties('mcp_start_clicked', {
    job: 'positioning_diagnosis',
    placement: 'hero',
  }), {
    job: 'positioning_diagnosis',
    placement: 'hero',
  });

  assert.deepEqual(sanitizeFunnelProperties('not_an_event', { placement: 'hero' }), {});
});

test('content-to-activation events keep only safe article properties', () => {
  assert.deepEqual(sanitizeFunnelProperties('mcp_content_cta_clicked', {
    content_cluster: 'product marketing mcp',
    content_slug: 'how-to-write-positioning-with-ai',
    primary_keyword: 'how to write positioning with ai',
    destination_job: 'positioning-diagnosis',
    placement: 'article_cta',
    prompt: 'private product context',
    email: 'person@example.com',
  }), {
    content_cluster: 'product_marketing_mcp',
    content_slug: 'how_to_write_positioning_with_ai',
    primary_keyword: 'how_to_write_positioning_with_ai',
    destination_job: 'positioning_diagnosis',
    placement: 'article_cta',
  });
});
