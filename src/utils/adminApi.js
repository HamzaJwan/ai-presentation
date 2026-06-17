const tokenKey = 'ai-workshop-admin-token';

export function getStoredAdminToken() {
  try {
    return sessionStorage.getItem(tokenKey) || '';
  } catch {
    return '';
  }
}

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(tokenKey);
  } catch {
    // sessionStorage may be unavailable.
  }
}

function storeAdminToken(token) {
  try {
    sessionStorage.setItem(tokenKey, token);
  } catch {
    // sessionStorage may be unavailable.
  }
}

export async function adminFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getStoredAdminToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response = await fetch(url, { ...options, headers });
  if (response.status !== 401) return response;

  const nextToken = window.prompt('أدخل رمز الإدارة لحفظ التغييرات:');
  if (!nextToken) return response;
  storeAdminToken(nextToken.trim());
  headers.set('Authorization', `Bearer ${nextToken.trim()}`);
  response = await fetch(url, { ...options, headers });
  return response;
}

export async function readJsonApi(url, fallback = null) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

export async function saveSlideOverride(slideId, payload) {
  const response = await adminFetch(`/api/content/slides/${slideId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('تعذر حفظ الشريحة.');
  return response.json();
}

export async function saveSlideNotes(slideId, speakerNotes) {
  const response = await adminFetch(`/api/content/slides/${slideId}/notes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ speakerNotes })
  });
  if (!response.ok) throw new Error('تعذر حفظ ملاحظات المتحدث.');
  return response.json();
}

export async function uploadMediaFile({ file, slideId, slot, brand, caption, fit, align, tint, glow }) {
  const form = new FormData();
  form.append('slideId', slideId);
  form.append('slot', slot);
  form.append('brand', brand || 'generic');
  form.append('caption', caption || file.name);
  form.append('fit', fit || 'cover');
  form.append('align', align || 'center');
  form.append('tint', String(tint ?? 0.08));
  form.append('glow', glow || 'medium');
  form.append('file', file);

  const response = await adminFetch('/api/media/upload', { method: 'POST', body: form });
  if (!response.ok) throw new Error('تعذر رفع الملف وحفظه.');
  return response.json();
}

export async function saveSettings(payload) {
  const response = await adminFetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('تعذر حفظ الإعدادات.');
  return response.json();
}
