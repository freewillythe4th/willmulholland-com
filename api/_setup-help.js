const SETUP_MESSAGE = "Hey, I'd love to use Intelligent Growth. How do I get started?";

export function buildSetupHelpUrl(baseUrl) {
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') return null;

  if (url.hostname === 'wa.me' && /^\/\d+$/.test(url.pathname)) {
    url.searchParams.set('text', SETUP_MESSAGE);
    return url.toString();
  }

  const phone = url.searchParams.get('phone');
  if (
    url.hostname !== 'api.whatsapp.com'
    || !/^\/send\/?$/.test(url.pathname)
    || !/^\d+$/.test(phone || '')
  ) return null;

  url.searchParams.set('text', SETUP_MESSAGE);
  url.searchParams.set('type', 'phone_number');
  url.searchParams.set('app_absent', '0');
  return url.toString();
}
