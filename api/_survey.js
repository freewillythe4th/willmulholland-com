function safeText(value, maxLength = 80) {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>/]/g, '').trim().slice(0, maxLength);
}

export function safeSurveyFields(body = {}) {
  const challenges = Array.isArray(body.challenges)
    ? body.challenges.slice(0, 10).map((value) => safeText(value)).filter(Boolean)
    : [];

  return {
    challenges,
    companyStage: safeText(body.companyStage),
  };
}
