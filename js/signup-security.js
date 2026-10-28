// Explicit managed widgets and reset callbacks:
// https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
(function () {
  'use strict';
  var actions = { '/api/subscribe': 'subscribe', '/api/workshop-register': 'workshop_register', '/api/community-apply': 'community_apply' };
  var states = new Map();
  var bootPromise;

  function message(state, text) { state.message.textContent = text; }
  function reset(state) {
    state.token = '';
    if (state.widget !== undefined && window.turnstile) window.turnstile.reset(state.widget);
  }
  function challengeFailed(state, text) {
    state.token = '';
    state.error = text;
    message(state, text);
    if (state.finish) state.finish(new Error(text));
  }
  function waitForToken(state) {
    if (state.token) return Promise.resolve(state.token);
    message(state, "Checking you're human...");
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        challengeFailed(state, 'Security check timed out. Please try again.');
      }, 15000);
      state.finish = function (error) {
        clearTimeout(timer);
        state.finish = null;
        if (error) reject(error);
        else resolve(state.token);
      };
      // Managed widgets already run on render. Do not reset a pending check
      // when someone submits early. Restart only a previously failed check.
      if (state.error) {
        state.error = '';
        reset(state);
      }
    });
  }
  async function timedFetch(url, options, milliseconds) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, milliseconds);
    try { return await fetch(url, Object.assign({}, options, { signal: controller.signal })); }
    finally { clearTimeout(timer); }
  }
  function loadWidgetScript() {
    return new Promise(function (resolve, reject) {
      if (window.turnstile) { resolve(); return; }
      var script = document.createElement('script');
      var timer = setTimeout(function () { reject(new Error('Security check unavailable')); }, 10000);
      window.igTurnstileReady = function () { clearTimeout(timer); resolve(); };
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=igTurnstileReady';
      script.async = true;
      script.onerror = function () { clearTimeout(timer); reject(new Error('Security check unavailable')); };
      document.head.appendChild(script);
    });
  }
  function boot() {
    if (bootPromise) return bootPromise;
    document.querySelectorAll('form[data-signup-action]').forEach(function (form) {
      if (states.has(form)) return;
      var container = document.createElement('div');
      container.style.width = '100%';
      var status = document.createElement('p');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.style.width = '100%';
      status.style.fontSize = '14px';
      status.textContent = 'Loading security check...';
      form.appendChild(container);
      form.appendChild(status);
      states.set(form, { widget: undefined, token: '', error: '', finish: null, busy: false, message: status, container: container });
    });
    bootPromise = (async function () {
      var response = await timedFetch('/api/signup-config', { cache: 'no-store' }, 8000);
      if (!response.ok) throw new Error('Signups are temporarily unavailable. Please try again later.');
      var config = await response.json();
      if (config.enabled !== true || typeof config.siteKey !== 'string' || !config.siteKey) {
        throw new Error('Signups are temporarily paused. Please try again later.');
      }
      await loadWidgetScript();
      states.forEach(function (state, form) {
        if (state.widget !== undefined) return;
        state.widget = window.turnstile.render(state.container, {
          sitekey: config.siteKey, action: form.getAttribute('data-signup-action'),
          appearance: 'interaction-only', size: 'flexible',
          'response-field': false,
          callback: function (token) {
            if (typeof token !== 'string' || !token.trim()) return;
            state.token = token; state.error = ''; message(state, '');
            if (state.finish) state.finish();
          },
          'expired-callback': function () { challengeFailed(state, 'Security check expired. Please try again.'); reset(state); },
          'timeout-callback': function () { challengeFailed(state, 'Security check timed out. Please try again.'); },
          'error-callback': function (code) {
            challengeFailed(state, 'Security check failed' + (code ? ' (' + code + ')' : '') + '. Please retry or reload this page.');
          },
        });
        message(state, '');
      });
    })().catch(function (error) {
      bootPromise = undefined;
      states.forEach(function (state) { message(state, error.message); });
      throw error;
    });
    // Loading starts before submission. Retain the rejection for submit to
    // handle without creating an unhandled rejection during ordinary browsing.
    bootPromise.catch(function () {});
    return bootPromise;
  }

  window.igSignup = {
    submit: async function (form, url, options) {
      await boot();
      var state = states.get(form);
      if (!state || actions[url] !== form.getAttribute('data-signup-action')) throw new Error('Invalid signup form');
      if (state.busy) throw new Error('Signup already in progress');
      state.busy = true;
      var consumed = false;
      try {
        var token = await waitForToken(state);
        if (!token) throw new Error('Complete the security check and try again.');
        state.token = '';
        consumed = true;
        var payload = JSON.parse(options.body);
        // Tokens come only from this form's widget, never a caller override.
        payload.turnstileToken = token;
        var response = await timedFetch(url, Object.assign({}, options, { body: JSON.stringify(payload) }), 30000);
        if (!response.ok) {
          var detail;
          try { detail = await response.json(); } catch (_) {}
          throw new Error(detail && typeof detail.error === 'string' ? detail.error :
            'Signup failed. Please try again, or email will@intelligentgrowth.app.');
        }
        return response;
      } catch (error) {
        if (error.name === 'AbortError') error = new Error('Signup timed out. Please try again.');
        message(state, error.message);
        throw error;
      } finally {
        if (consumed) reset(state);
        state.busy = false;
      }
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
