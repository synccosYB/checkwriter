const KEY = 'postSetupAction';

export function setPostSetupAction(action, payload = {}) {
  const value = { action, payload, ts: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch {}
}

export function consumePostSetupAction() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    localStorage.removeItem(KEY);
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

export function clearPostSetupAction() {
  try { localStorage.removeItem(KEY); } catch {}
}