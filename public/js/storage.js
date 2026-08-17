import { PERSISTENT_KEY, SESSION_MODE_KEY, SESSION_VIEW_KEY, SESSION_PALETTE_KEY, SESSION_THEME_KEY, SEVEN_DAYS_MS } from './config.js';
import { updateMeta } from './history.js';
import { setStatus } from './ui.js';
import { playSound } from './sounds.js';
import { state } from './app.js';

//ALMACENAMIENTO
export function readSession(key, fallback) {
  try {
    const value = sessionStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (err) {
    return fallback;
  }
}

export function writeSession(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (err) {
    console.warn('No se pudo guardar la preferencia:', err);
  }
}

export function persistSession() {
  try {
    localStorage.setItem(PERSISTENT_KEY, JSON.stringify(state.conversationHistory));
    localStorage.setItem(SESSION_MODE_KEY, state.responseMode);
  } catch (err) {
    console.warn('No se pudo guardar la historia:', err);
  }
}

export function loadPersistentState() {
  try {
    const saved = localStorage.getItem(PERSISTENT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        state.conversationHistory = parsed;
      }
    }
    const savedMode = localStorage.getItem(SESSION_MODE_KEY);
    if (savedMode === 'compact' || savedMode === 'detailed') {
      state.responseMode = savedMode;
    }
  } catch (err) {
    console.warn('No se pudo restaurar la historia persistente:', err);
  }

  const now = Date.now();
  let changed = false;
  const fresh = [];
  for (const msg of state.conversationHistory) {
    const ts = typeof msg.ts === 'number' ? msg.ts : now;
    if (now - ts <= SEVEN_DAYS_MS) {
      fresh.push(Object.assign({}, msg, { ts }));
    } else {
      changed = true;
    }
  }
  if (changed || state.conversationHistory.some(msg => typeof msg.ts !== 'number')) {
    state.conversationHistory = fresh;
    persistSession();
  }

  state.sessionMsgCount = state.conversationHistory.filter(m => m.role === 'user').length; // Estimado
  state.viewMode = readSession(SESSION_VIEW_KEY, 'projection');
  state.paletteMode = readSession(SESSION_PALETTE_KEY, 'rosa');
  state.themeMode = readSession(SESSION_THEME_KEY, 'dark');
}

export function clearConversation() {
  state.conversationHistory = [];
  state.sessionMsgCount = 0;
  persistSession();
  updateMeta();
  setStatus('Conversación limpia. Listos para empezar.');
  playSound('activate');
}
