import {
  WORKSHEET_FIELDS,
  buildClaudePrompt,
  buildStepPrompt,
  buildDesignPartnerOffer,
  buildOutreachMessage,
  hasWorksheetAnswers,
  normalizeWorksheet,
  resolveWorksheetId,
  storageKey,
} from './first-ten-worksheet.mjs';

const steps = ['assumptions', 'conversations', 'prompts', 'offer', 'outreach'];
const form = document.getElementById('worksheetForm');
const saveStatus = document.getElementById('saveStatus');
const stepCount = document.getElementById('stepCount');
const previousButton = document.getElementById('previousStep');
const nextButton = document.getElementById('nextStep');
const copyClaudeTop = document.getElementById('copyClaudeTop');
const copyClaudeBottom = document.getElementById('copyClaudeBottom');
const offerPreview = document.getElementById('offerPreview');
const outreachPreview = document.getElementById('outreachPreview');
const shareDialog = document.getElementById('shareDialog');
const shareForm = document.getElementById('shareForm');
const shareMessage = document.getElementById('shareMessage');
const submitWorksheet = document.getElementById('submitWorksheet');
const toast = document.getElementById('toast');

const worksheetId = resolveWorksheetId(window.location.hash, window.crypto);
const draftKey = storageKey(worksheetId);
let currentStep = 0;
let saveTimer;
let storageWorks = true;

if (!window.location.hash.includes(`worksheet=${worksheetId}`)) {
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#worksheet=${worksheetId}`);
}

function readAnswers() {
  const values = {};
  for (const field of WORKSHEET_FIELDS) {
    const control = form.elements.namedItem(field);
    values[field] = control ? control.value : '';
  }
  return normalizeWorksheet(values);
}

function hydrateAnswers(answers) {
  const safeAnswers = normalizeWorksheet(answers);
  for (const field of WORKSHEET_FIELDS) {
    const control = form.elements.namedItem(field);
    if (control) control.value = safeAnswers[field];
  }
}

function setSaveStatus(message, state = 'saved') {
  saveStatus.lastChild.textContent = ` ${message}`;
  saveStatus.dataset.state = state;
}

function loadDraft() {
  try {
    const raw = window.localStorage.getItem(draftKey);
    if (!raw) return;
    const draft = JSON.parse(raw);
    hydrateAnswers(draft.answers);
    if (Number.isInteger(draft.step) && draft.step >= 0 && draft.step < steps.length) {
      currentStep = draft.step;
    }
  } catch {
    storageWorks = false;
    setSaveStatus('Browser save unavailable', 'error');
  }
}

function saveDraft() {
  if (!storageWorks) return;
  try {
    window.localStorage.setItem(draftKey, JSON.stringify({
      worksheetVersion: 1,
      worksheetId,
      savedAt: new Date().toISOString(),
      step: currentStep,
      answers: readAnswers(),
    }));
    setSaveStatus('Saved in this browser');
  } catch {
    storageWorks = false;
    setSaveStatus('Browser save unavailable', 'error');
  }
}

function queueSave() {
  if (!storageWorks) return;
  setSaveStatus('Saving...', 'saving');
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveDraft, 220);
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2600);
}

function updatePreviews() {
  const answers = readAnswers();
  offerPreview.textContent = buildDesignPartnerOffer(answers)
    || 'Fill in the exchange above to build your offer.';

  const outreachFields = [
    answers.outreachName,
    answers.outreachSignal,
    answers.outreachProduct,
    answers.outreachCredibility,
    answers.outreachQuestion,
  ];
  outreachPreview.textContent = outreachFields.some(Boolean)
    ? buildOutreachMessage(answers)
    : 'Fill in the fields above to build your message.';
}

function renderStep(options = {}) {
  document.querySelectorAll('[data-step]').forEach((section) => {
    section.hidden = section.dataset.step !== steps[currentStep];
  });

  document.querySelectorAll('[data-step-target]').forEach((tab, index) => {
    const active = index === currentStep;
    tab.classList.toggle('is-active', active);
    tab.classList.toggle('is-complete', index < currentStep);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  previousButton.disabled = currentStep === 0;
  nextButton.hidden = currentStep === steps.length - 1;
  stepCount.textContent = `Step ${currentStep + 1} of ${steps.length}`;
  const isFinalStep = currentStep === steps.length - 1;
  const copyLabel = isFinalStep ? 'Copy complete worksheet' : 'Copy this step for Claude';
  copyClaudeTop.textContent = copyLabel;
  copyClaudeBottom.textContent = copyLabel;

  const activeTab = document.querySelector(`[data-step-target="${steps[currentStep]}"]`);
  if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

  if (options.focus) {
    const activeSection = document.querySelector(`[data-step="${steps[currentStep]}"]`);
    const heading = activeSection && activeSection.querySelector('h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    document.querySelector('.step-nav').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (options.save !== false) saveDraft();
}

async function copyText(text, successMessage) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand('copy');
      helper.remove();
      if (!copied) throw new Error('Copy unavailable');
    }
    showToast(successMessage);
  } catch {
    showToast('Copy failed. Select the preview and copy it manually.');
  }
}

function copyForClaude() {
  const answers = readAnswers();
  if (!hasWorksheetAnswers(answers)) {
    showToast('Add at least one answer first.');
    return;
  }
  const isFinalStep = currentStep === steps.length - 1;
  const prompt = isFinalStep
    ? buildClaudePrompt(answers)
    : buildStepPrompt(answers, currentStep);
  copyText(prompt, isFinalStep ? 'Complete worksheet copied.' : 'This step copied.');
}

loadDraft();
updatePreviews();
renderStep({ save: false });

form.addEventListener('input', () => {
  updatePreviews();
  queueSave();
});

nextButton.addEventListener('click', () => {
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    renderStep({ focus: true });
  }
});

previousButton.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep -= 1;
    renderStep({ focus: true });
  }
});

document.querySelectorAll('[data-step-target]').forEach((tab, index, tabs) => {
  tab.addEventListener('click', () => {
    currentStep = index;
    renderStep({ focus: true });
  });
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') currentStep = 0;
    if (event.key === 'End') currentStep = tabs.length - 1;
    if (event.key === 'ArrowLeft') currentStep = (currentStep - 1 + tabs.length) % tabs.length;
    if (event.key === 'ArrowRight') currentStep = (currentStep + 1) % tabs.length;
    renderStep({ focus: false });
    tabs[currentStep].focus();
  });
});

copyClaudeTop.addEventListener('click', copyForClaude);
copyClaudeBottom.addEventListener('click', copyForClaude);
document.getElementById('copyOutreach').addEventListener('click', () => {
  const answers = readAnswers();
  const message = buildOutreachMessage(answers);
  if (!answers.outreachSignal && !answers.outreachProduct && !answers.outreachQuestion) {
    showToast('Build the message first.');
    return;
  }
  copyText(message, 'Outreach message copied.');
});

document.getElementById('openShareDialog').addEventListener('click', () => {
  if (!hasWorksheetAnswers(readAnswers())) {
    showToast('Add at least one answer before sharing.');
    return;
  }
  shareMessage.textContent = '';
  shareMessage.classList.remove('is-error');
  shareDialog.showModal();
  document.getElementById('shareName').focus();
});

document.getElementById('closeShareDialog').addEventListener('click', () => shareDialog.close());
shareDialog.addEventListener('click', (event) => {
  if (event.target === shareDialog) shareDialog.close();
});

shareForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const consent = document.getElementById('shareConsent');
  if (!consent.checked) {
    shareMessage.textContent = 'Please confirm the sharing note first.';
    shareMessage.classList.add('is-error');
    consent.focus();
    return;
  }

  submitWorksheet.disabled = true;
  submitWorksheet.textContent = 'Sending...';
  shareMessage.textContent = '';
  shareMessage.classList.remove('is-error');

  try {
    const response = await fetch('/api/first-ten-worksheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worksheetId,
        answers: readAnswers(),
        name: document.getElementById('shareName').value,
        email: document.getElementById('shareEmail').value,
        company: document.getElementById('company').value,
        consent: true,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Submission failed');

    shareDialog.close();
    consent.checked = false;
    showToast('Copy sent to Will. Your browser draft is unchanged.');
  } catch (error) {
    shareMessage.textContent = error.message === 'Submission failed'
      ? 'Could not send this copy. Your browser draft is safe. Try again.'
      : error.message;
    shareMessage.classList.add('is-error');
  } finally {
    submitWorksheet.disabled = false;
    submitWorksheet.textContent = 'Send copy';
  }
});

window.addEventListener('pagehide', saveDraft);
