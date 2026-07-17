import {
  connectionValueFor,
  normalizeClient,
  normalizeJob,
  starterPromptFor,
} from './mcp-start-core.mjs';

const params = new URLSearchParams(window.location.search);
const job = normalizeJob(params.get('job'));
let client = null;
let connectionCopied = false;
let promptCopied = false;

const jobLabels = {
  competitive_gap: 'the competitive gap',
  positioning_diagnosis: 'a free positioning diagnosis',
  positioning: 'a positioning review',
  messaging: 'a messaging review',
  launch: 'a launch plan',
};

const clientButtons = Array.from(document.querySelectorAll('[data-client]'));
const instructions = Array.from(document.querySelectorAll('[data-instruction]'));
const promptBox = document.getElementById('prompt-box');
const promptValue = document.getElementById('starter-prompt');
const readyButton = document.getElementById('ready-button');
const stepLabel = document.getElementById('current-step');
const jobLabel = document.getElementById('job-label');
const heading = document.getElementById('setup-heading');
const intro = document.getElementById('setup-intro');
const unavailableNotice = document.getElementById('setup-unavailable');

function capture(eventName, properties) {
  if (window.igAnalytics) window.igAnalytics.captureFunnel(eventName, properties);
}

function setProgress(step) {
  document.querySelectorAll('[data-progress]').forEach((item) => {
    const itemStep = Number(item.dataset.progress);
    item.classList.toggle('is-complete', itemStep < step);
    item.classList.toggle('is-current', itemStep === step);
  });
  stepLabel.textContent = `Step ${step} of 4`;
}

function selectClient(value) {
  client = normalizeClient(value);
  connectionCopied = false;
  promptCopied = false;

  clientButtons.forEach((button) => {
    const selected = button.dataset.client === client;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });

  instructions.forEach((instruction) => {
    instruction.classList.toggle('is-active', instruction.dataset.instruction === client);
  });

  document.querySelectorAll('[data-connection-value]').forEach((node) => {
    node.textContent = connectionValueFor(client);
  });
  document.querySelectorAll('.copy-button').forEach((button) => {
    button.classList.remove('is-copied');
    button.textContent = button.dataset.copy === 'prompt' ? 'Copy prompt' : (client === 'claude_code' ? 'Copy command' : 'Copy URL');
  });

  promptValue.textContent = starterPromptFor(job);
  promptBox.hidden = false;
  readyButton.classList.remove('is-visible');
  heading.textContent = 'Connect Intelligent Growth.';
  intro.textContent = 'Use the instruction for your client, then copy the starter prompt below.';
  setProgress(2);
  capture('mcp_client_selected', { client });
  capture('mcp_setup_step_completed', { step: 'client_selected', client });
}

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  input.remove();
}

clientButtons.forEach((button) => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => selectClient(button.dataset.client));
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy]');
  if (!button || !client) return;

  const kind = button.dataset.copy;
  const value = kind === 'connection' ? connectionValueFor(client) : starterPromptFor(job);
  try {
    await copyText(value);
    button.classList.add('is-copied');
    button.textContent = 'Copied';
  } catch {
    button.textContent = 'Select and copy';
    return;
  }

  if (kind === 'connection' && !connectionCopied) {
    connectionCopied = true;
    setProgress(3);
    capture('mcp_connection_copied', { client, auth_mode: 'oauth' });
    capture('mcp_setup_step_completed', { step: 'connection_copied', client });
  }

  if (kind === 'prompt' && !promptCopied) {
    promptCopied = true;
    setProgress(4);
    readyButton.classList.add('is-visible');
    capture('mcp_starter_prompt_copied', { job, client });
    capture('mcp_setup_step_completed', { step: 'prompt_copied', client });
  }
});

readyButton.addEventListener('click', () => {
  capture('mcp_setup_step_completed', { step: 'ready_to_run', client });
  heading.textContent = 'You are ready to run the job.';
  intro.textContent = 'Return to your AI client, paste the starter prompt and bring the real context already on your desk.';
  readyButton.textContent = 'Ready';
  readyButton.disabled = true;
});

document.querySelectorAll('[data-troubleshooting]').forEach((details) => {
  details.addEventListener('toggle', () => {
    if (details.open) capture('mcp_troubleshooting_opened', { issue: details.dataset.troubleshooting, client: client || 'other' });
  });
});

jobLabel.textContent = jobLabels[job];

if (params.get('help') === 'unavailable' && unavailableNotice) {
  unavailableNotice.hidden = false;
  window.addEventListener('load', () => {
    window.requestAnimationFrame(() => {
      unavailableNotice.focus({ preventScroll: true });
      unavailableNotice.scrollIntoView({ block: 'start' });
    });
  }, { once: true });
}
