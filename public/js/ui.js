import { state } from './app.js';
import { writeSession, SESSION_VIEW_KEY, SESSION_PALETTE_KEY, SESSION_THEME_KEY } from './storage.js';
import { playSound } from './sounds.js';

//UI
export const statusEl = document.getElementById('status');
export const subtitlesEl = document.getElementById('subtitles');
export const startBtn = document.getElementById('startBtn');
export const newConvBtn = document.getElementById('newConvBtn');
export const viewModeBtn = document.getElementById('viewModeBtn');
export const paletteBtn = document.getElementById('paletteBtn');
export const themeBtn = document.getElementById('themeBtn');
export const historyBtn = document.getElementById('historyBtn');
export const historyCloseBtn = document.getElementById('historyClose');

export let subtitleTimers = [];

export function clearSubtitleTimers() {
  subtitleTimers.forEach(timer => clearTimeout(timer));
  subtitleTimers.length = 0;
}

export function setBtnLabel(text) {
  const label = startBtn.querySelector('.btn-label');
  if (label) label.textContent = text;
}

export function setStatus(message) {
  statusEl.classList.remove('fade-in');
  void statusEl.offsetWidth;
  statusEl.textContent = message;
  statusEl.classList.add('fade-in');
}

export function setResponseMode(mode) {
  state.responseMode = mode;
  const isCompact = mode === 'compact';
  startBtn.setAttribute('data-mode', mode);

  if (state.isSpeaking) {
    setBtnLabel('Cortar');
    return;
  }

  if (!state.hasStartedOnce) {
    setBtnLabel('Iniciar');
    return;
  }

  setBtnLabel(isCompact ? 'Modo breve' : 'Modo extendido');
}

export function setHoverState() {
  if (state.isSpeaking || !state.hasStartedOnce) return;
  setBtnLabel('Cambiar modo');
}

export function applyThemeUI() {
  const isPreview = state.viewMode === 'preview';

  document.body.classList.toggle('theme-preview', isPreview);
  document.body.classList.toggle('palette-azul', state.paletteMode === 'azul');
  document.body.classList.toggle('light', state.themeMode === 'light');

  viewModeBtn.textContent = isPreview ? 'Preview' : 'Proyección';

  paletteBtn.classList.toggle('hidden', !isPreview);
  themeBtn.classList.toggle('hidden', !isPreview);
  if (isPreview) {
    paletteBtn.textContent = state.paletteMode === 'azul' ? 'Azul' : 'Rosa';
    themeBtn.textContent = state.themeMode === 'light' ? 'Claro' : 'Oscuro';
  }
}

export function toggleViewMode() {
  playSound('click');
  state.viewMode = state.viewMode === 'projection' ? 'preview' : 'projection';
  writeSession(SESSION_VIEW_KEY, state.viewMode);
  applyThemeUI();
  setStatus(state.viewMode === 'projection'
    ? 'Modo proyección: negro puro para el acrílico.'
    : 'Modo preview: solo para probar sin acrílico.');
}

export function togglePalette() {
  playSound('click');
  state.paletteMode = state.paletteMode === 'rosa' ? 'azul' : 'rosa';
  writeSession(SESSION_PALETTE_KEY, state.paletteMode);
  applyThemeUI();
}

export function toggleTheme() {
  playSound('click');
  state.themeMode = state.themeMode === 'dark' ? 'light' : 'dark';
  writeSession(SESSION_THEME_KEY, state.themeMode);
  applyThemeUI();
}
