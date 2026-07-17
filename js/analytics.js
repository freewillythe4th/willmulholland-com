import {
  CAMPAIGN_KEYS,
  FUNNEL_EVENT_RULES,
  classifyApiEndpoint,
  classifyLink,
  enrichJsonRequestBody,
  readCampaignParams,
  referringDomain,
  sanitizeCampaignValue,
  sanitizeFunnelProperties,
  statusGroup,
} from './analytics-core.mjs';

const POSTHOG_KEY = 'phc_rvIhRhYYPjDDzjWcnVa2eU2MHk2vfksuU1aBaNlun6m';
const POSTHOG_HOST = 'https://us.i.posthog.com';
const STORAGE_KEY = 'ig_attribution_v1';

function loadPostHog() {
  (function load(documentObject, posthogObject) {
    let methodIndex;
    let methods;
    let script;
    let firstScript;

    if (posthogObject.__SV) return;
    window.posthog = posthogObject;
    posthogObject._i = [];
    posthogObject.init = function init(key, config, name) {
      function queueMethod(target, methodName) {
        const parts = methodName.split('.');
        if (parts.length === 2) {
          target = target[parts[0]];
          methodName = parts[1];
        }
        const queue = target;
        queue[methodName] = function queuedMethod() {
          queue.push([methodName].concat(Array.prototype.slice.call(arguments)));
        };
      }

      script = documentObject.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `${(config.api_host || '').replace('.i.posthog.com', '-assets.i.posthog.com')}/static/array.js`;
      firstScript = documentObject.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);

      let instance = posthogObject;
      if (name !== undefined) instance = posthogObject[name] = [];
      else name = 'posthog';
      instance.people = instance.people || [];
      instance.toString = function toString(detail) {
        let label = 'posthog';
        if (name !== 'posthog') label += `.${name}`;
        if (!detail) label += ' (stub)';
        return label;
      };
      instance.people.toString = function peopleToString() {
        return `${instance.toString(1)}.people (stub)`;
      };
      methods = 'capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId'.split(' ');
      for (methodIndex = 0; methodIndex < methods.length; methodIndex += 1) {
        queueMethod(instance, methods[methodIndex]);
      }
      posthogObject._i.push([key, config, name]);
    };
    posthogObject.__SV = 1;
  }(document, window.posthog || []));
}

function safeEventUrl(value) {
  if (typeof value !== 'string') return value;
  try {
    const url = new URL(value, window.location.origin);
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

function readStoredAttribution() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return stored && typeof stored === 'object' ? stored : {};
  } catch {
    return {};
  }
}

function writeStoredAttribution(attribution) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Analytics should never block the site when storage is unavailable.
  }
}

function buildAttribution() {
  const stored = readStoredAttribution();
  const incoming = readCampaignParams(window.location.href);
  const hasIncomingCampaign = Object.keys(incoming).length > 0;
  const currentReferrer = referringDomain(document.referrer);
  const ownDomain = window.location.hostname.replace(/^www\./, '');
  const externalReferrer = currentReferrer !== 'direct' && currentReferrer !== ownDomain;

  const attribution = {
    first: stored.first || incoming,
    latest: hasIncomingCampaign ? incoming : (stored.latest || {}),
    initial_referring_domain: stored.initial_referring_domain || currentReferrer,
    latest_referring_domain: externalReferrer
      ? currentReferrer
      : (stored.latest_referring_domain || currentReferrer),
  };

  writeStoredAttribution(attribution);
  return attribution;
}

function pageGroup() {
  const segment = window.location.pathname.split('/').filter(Boolean)[0];
  return segment || 'home';
}

function attributionProperties(attribution) {
  const properties = {
    site_path: window.location.pathname,
    site_page_group: pageGroup(),
    initial_referring_domain: attribution.initial_referring_domain,
    latest_referring_domain: attribution.latest_referring_domain,
  };

  for (const key of CAMPAIGN_KEYS) {
    if (attribution.first[key]) properties[`first_${key}`] = attribution.first[key];
    if (attribution.latest[key]) properties[`latest_${key}`] = attribution.latest[key];
  }

  return properties;
}

loadPostHog();
const attribution = buildAttribution();
const sharedProperties = attributionProperties(attribution);

window.posthog.init(POSTHOG_KEY, {
  api_host: POSTHOG_HOST,
  ui_host: 'https://us.posthog.com',
  defaults: '2026-05-30',
  autocapture: false,
  capture_pageview: true,
  capture_pageleave: true,
  disable_session_recording: true,
  person_profiles: 'identified_only',
  before_send(event) {
    if (!event || !event.properties) return event;
    for (const property of ['$current_url', '$referrer', '$initial_referrer']) {
      if (event.properties[property]) event.properties[property] = safeEventUrl(event.properties[property]);
    }
    for (const key of CAMPAIGN_KEYS) {
      if (event.properties[key]) event.properties[key] = sanitizeCampaignValue(event.properties[key]);
    }
    for (const clickId of ['gclid', 'fbclid', 'msclkid', 'dclid', 'gbraid', 'wbraid']) {
      delete event.properties[clickId];
      delete event.properties[`$${clickId}`];
    }
    return event;
  },
});
window.posthog.register(sharedProperties);

function capture(eventName, properties = {}) {
  window.posthog.capture(eventName, { ...sharedProperties, ...properties });
}

function captureFunnel(eventName, properties = {}) {
  if (!FUNNEL_EVENT_RULES[eventName]) return;
  capture(eventName, sanitizeFunnelProperties(eventName, properties));
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;

  if (link.dataset.igEvent) {
    const funnelProperties = {
      job: link.dataset.igJob,
      placement: link.dataset.igPlacement,
      channel: link.dataset.igChannel,
      billing_interval: link.dataset.igBillingInterval,
      content_cluster: link.dataset.contentCluster,
      content_slug: link.dataset.contentSlug,
      primary_keyword: link.dataset.primaryKeyword,
      destination_job: link.dataset.destinationJob,
    };
    captureFunnel(link.dataset.igEvent, funnelProperties);
    if (link.dataset.igEvent === 'mcp_job_selected') {
      captureFunnel('mcp_start_clicked', funnelProperties);
    }
  }

  const classification = classifyLink(link.getAttribute('href'), window.location.href);
  if (!classification) return;

  const placement = link.dataset.analyticsPlacement
    || (link.closest('nav') ? 'navigation' : null)
    || (link.closest('footer') ? 'footer' : null)
    || 'page';

  const properties = {
    ...classification,
    cta: link.dataset.analyticsCta || classification.destination_type,
    placement,
  };

  if (classification.destination_type === 'external') {
    try {
      properties.destination_domain = new URL(link.href).hostname.replace(/^www\./, '');
    } catch {
      return;
    }
  }

  capture('site cta clicked', properties);

  if (classification.destination_type === 'mcp_install') {
    capture('mcp install intent', { placement });
  }
  if (classification.destination_type === 'membership_checkout') {
    capture('membership checkout intent', { placement });
  }
});

const viewedSections = document.querySelectorAll('[data-ig-view-event]');
if ('IntersectionObserver' in window && viewedSections.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      captureFunnel(element.dataset.igViewEvent, { placement: element.dataset.igPlacement });
      observer.unobserve(element);
    });
  }, { threshold: 0.35 });
  viewedSections.forEach((section) => observer.observe(section));
}

const originalFetch = window.fetch.bind(window);
window.fetch = function trackedFetch(input, init = {}) {
  const requestUrl = typeof input === 'string' || input instanceof URL ? input.toString() : input && input.url;
  const formType = classifyApiEndpoint(requestUrl);
  const method = (init.method || (input && input.method) || 'GET').toUpperCase();

  if (!formType || method !== 'POST') return originalFetch(input, init);

  const requestInit = { ...init };
  requestInit.body = enrichJsonRequestBody(requestInit.body, attribution.latest);
  capture('site form submitted', { form_type: formType });

  return originalFetch(input, requestInit)
    .then((response) => {
      capture(response.ok ? 'site form succeeded' : 'site form failed', {
        form_type: formType,
        status_group: statusGroup(response.status),
      });
      return response;
    })
    .catch((error) => {
      capture('site form failed', { form_type: formType, status_group: 'network' });
      throw error;
    });
};

window.igAnalytics = Object.freeze({
  capture,
  captureFunnel,
  attribution: Object.freeze({ ...sharedProperties }),
});
