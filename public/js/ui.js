import { state } from './app.js';
import { writeSession } from './storage.js';
import { playSound } from './sounds.js';

//UI
export const statusEl = document.getElementById('status');
export const subtitlesEl = document.getElementById('subtitles');
export const startBtn = document.getElementById('startBtn');
export const newConvBtn = document.getElementById('newConvBtn');
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

