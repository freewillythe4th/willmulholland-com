import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { CAMPAIGN_KEYS, sanitizeCampaignValue } from '../js/analytics-core.mjs';

export const ALLOWED_MEDIUMS = new Set([
  'organic_social',
  'paid_social',
  'email',
  'dm',
  'referral',
  'partner',
  'profile',
  'podcast',
  'community',
]);

export function buildTrackedUrl({ url, source, medium, campaign, content, term }) {
  const normalized = {
    utm_source: sanitizeCampaignValue(source),
    utm_medium: sanitizeCampaignValue(medium),
    utm_campaign: sanitizeCampaignValue(campaign),
    utm_content: sanitizeCampaignValue(content),
    utm_term: sanitizeCampaignValue(term),
  };

  if (!url || !normalized.utm_source || !normalized.utm_medium || !normalized.utm_campaign) {
    throw new Error('URL, source, medium, and campaign are required.');
  }
  if (!ALLOWED_MEDIUMS.has(normalized.utm_medium)) {
    throw new Error(`Unknown medium: ${normalized.utm_medium}. Allowed: ${[...ALLOWED_MEDIUMS].join(', ')}`);
  }

  let trackedUrl;
  try {
    trackedUrl = new URL(url);
  } catch {
    throw new Error('URL must be a complete http or https URL.');
  }
  if (!['http:', 'https:'].includes(trackedUrl.protocol)) {
    throw new Error('URL must be a complete http or https URL.');
  }

  for (const key of CAMPAIGN_KEYS) trackedUrl.searchParams.delete(key);
  for (const key of CAMPAIGN_KEYS) {
    if (normalized[key]) trackedUrl.searchParams.set(key, normalized[key]);
  }

  return trackedUrl.toString();
}

function parseArguments(argumentsList) {
  const options = {};
  for (let index = 0; index < argumentsList.length; index += 2) {
    const flag = argumentsList[index];
    const value = argumentsList[index + 1];
    if (!flag || !flag.startsWith('--') || value === undefined) {
      throw new Error('Use named pairs such as --url URL --source linkedin --medium organic_social --campaign mcp_launch.');
    }
    options[flag.slice(2)] = value;
  }
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(buildTrackedUrl(parseArguments(process.argv.slice(2))));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
