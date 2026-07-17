export const CAMPAIGN_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
];

export const FUNNEL_EVENT_RULES = Object.freeze({
  mcp_start_clicked: ['job', 'placement'],
  mcp_help_clicked: ['channel', 'placement'],
  mcp_job_selected: ['job', 'placement'],
  mcp_client_selected: ['client'],
  mcp_connection_copied: ['client', 'auth_mode'],
  mcp_starter_prompt_copied: ['job', 'client'],
  mcp_setup_step_completed: ['step', 'client'],
  mcp_catalogue_viewed: ['placement'],
  mcp_pricing_viewed: ['placement'],
  mcp_checkout_clicked: ['billing_interval', 'placement'],
  mcp_troubleshooting_opened: ['issue', 'client'],
  mcp_content_cta_clicked: ['content_cluster', 'content_slug', 'primary_keyword', 'destination_job', 'placement'],
});

const FUNNEL_PROPERTY_VALUES = Object.freeze({
  job: new Set(['competitive_gap', 'positioning_diagnosis', 'positioning', 'messaging', 'launch', 'catalogue']),
  placement: new Set(['navigation', 'hero', 'job_card', 'proof', 'catalogue', 'pricing', 'footer', 'setup', 'troubleshooting', 'article_cta']),
  channel: new Set(['whatsapp']),
  client: new Set(['claude_desktop', 'claude_code', 'chatgpt', 'other']),
  auth_mode: new Set(['oauth']),
  step: new Set(['client_selected', 'connection_copied', 'prompt_copied', 'ready_to_run']),
  billing_interval: new Set(['monthly', 'annual']),
  issue: new Set(['connection', 'authentication', 'client', 'other']),
  content_cluster: new Set(['product_marketing_mcp']),
  content_slug: new Set([
    'ai_competitive_analysis_for_product_marketers',
    'how_to_write_positioning_with_ai',
    'how_to_use_ai_for_a_product_launch',
  ]),
  primary_keyword: new Set([
    'ai_competitive_analysis_for_product_marketers',
    'how_to_write_positioning_with_ai',
    'how_to_use_ai_for_a_product_launch',
  ]),
  destination_job: new Set(['competitive_gap', 'positioning_diagnosis', 'launch_brief']),
});

const FIRST_PARTY_HOSTS = new Set([
  'intelligentgrowth.app',
  'www.intelligentgrowth.app',
  'localhost',
  '127.0.0.1',
]);

const API_FORM_TYPES = {
  '/api/subscribe': 'newsletter_signup',
  '/api/community-apply': 'community_application',
  '/api/workshop-register': 'workshop_registration',
  '/api/request-access': 'access_request',
  '/api/lead-survey': 'lead_survey',
  '/api/welcome-survey': 'welcome_survey',
};

export function sanitizeCampaignValue(value) {
  if (typeof value !== 'string') return '';
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)) return '';

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);
}

export function sanitizeFunnelProperties(eventName, properties = {}) {
  const allowedKeys = FUNNEL_EVENT_RULES[eventName];
  if (!allowedKeys || !properties || typeof properties !== 'object') return {};

  return Object.fromEntries(
    allowedKeys.flatMap((key) => {
      const value = sanitizeCampaignValue(properties[key]);
      const allowedValues = FUNNEL_PROPERTY_VALUES[key];
      return value && allowedValues && allowedValues.has(value) ? [[key, value]] : [];
    }),
  );
}

export function readCampaignParams(urlLike) {
  let url;
  try {
    url = new URL(urlLike, 'https://intelligentgrowth.app');
  } catch {
    return {};
  }

  return Object.fromEntries(
    CAMPAIGN_KEYS.flatMap((key) => {
      const value = sanitizeCampaignValue(url.searchParams.get(key));
      return value ? [[key, value]] : [];
    }),
  );
}

export function referringDomain(referrer) {
  if (!referrer) return 'direct';

  try {
    return new URL(referrer).hostname.toLowerCase().replace(/^www\./, '') || 'direct';
  } catch {
    return 'direct';
  }
}

export function classifyLink(href, currentUrl = 'https://intelligentgrowth.app/') {
  if (!href) return null;

  let current;
  let destination;
  try {
    current = new URL(currentUrl, 'https://intelligentgrowth.app');
    destination = new URL(href, current);
  } catch {
    return null;
  }

  if (destination.protocol === 'mailto:' || destination.protocol === 'tel:') {
    return { destination_type: 'contact', destination_path: destination.protocol.slice(0, -1) };
  }

  const path = destination.pathname || '/';
  const normalizedPath = path.length > 1 ? path.replace(/\/$/, '') : path;
  const destinationPath = normalizedPath + (destination.hash === '#install' ? '#install' : '');

  if (destination.hash === '#install' && normalizedPath === '/mcp') {
    return { destination_type: 'mcp_install', destination_path: destinationPath };
  }

  if (destination.hostname.endsWith('beehiiv.com') && normalizedPath === '/upgrade') {
    return { destination_type: 'membership_checkout', destination_path: normalizedPath };
  }

  const internal = destination.origin === current.origin || FIRST_PARTY_HOSTS.has(destination.hostname);
  if (!internal) {
    return { destination_type: 'external', destination_path: normalizedPath };
  }

  const destinationTypes = [
    [/^\/mcp(?:\/|$)/, 'mcp'],
    [/^\/brain(?:\/|$)/, 'marketing_brain'],
    [/^\/(?:workshop|training)(?:\/|$)/, 'workshop'],
    [/^\/traffic(?:\/|$)/, 'free_resource'],
    [/^\/podcast(?:\/|$)/, 'podcast'],
    [/^\/blog(?:\/|$)/, 'blog'],
    [/^\/community(?:\/|$)/, 'community'],
    [/^\/(?:work-with-me|work)(?:\/|$)/, 'services'],
  ];
  const match = destinationTypes.find(([pattern]) => pattern.test(normalizedPath));

  return {
    destination_type: match ? match[1] : 'internal',
    destination_path: destinationPath,
  };
}

export function classifyApiEndpoint(urlLike) {
  let url;
  try {
    url = new URL(urlLike, 'https://intelligentgrowth.app');
  } catch {
    return null;
  }

  if (!FIRST_PARTY_HOSTS.has(url.hostname)) return null;
  return API_FORM_TYPES[url.pathname.replace(/\/$/, '')] || null;
}

export function enrichJsonRequestBody(body, campaign) {
  if (typeof body !== 'string' || !campaign || Object.keys(campaign).length === 0) return body;

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return body;
  }

  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') return body;

  if (parsed.utm_medium && campaign.utm_medium && parsed.utm_medium !== campaign.utm_medium) {
    parsed.form_placement = parsed.form_placement || sanitizeCampaignValue(parsed.utm_medium);
  }

  for (const key of CAMPAIGN_KEYS) {
    if (campaign[key]) parsed[key] = campaign[key];
  }

  return JSON.stringify(parsed);
}

export function statusGroup(status) {
  if (!Number.isInteger(status)) return 'network';
  return `${Math.floor(status / 100)}xx`;
}
