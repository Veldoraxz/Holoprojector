import { state } from './app.js';
import { writeSession } from './storage.js';
import { SESSION_VIEW_KEY, SESSION_PALETTE_KEY, SESSION_THEME_KEY } from './config.js';
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

export let subtitleTimers = [];

// Frena y borra los temporizadores que controlan la aparición de subtítulos
export function clearSubtitleTimers() {
  subtitleTimers.forEach(timer => clearTimeout(timer));
  subtitleTimers.length = 0;
}

// Cambia el texto del botón principal (por ejemplo, de "Iniciar" a "Cortar" o "Modo breve")
export function setBtnLabel(text) {
  const label = startBtn.querySelector('.btn-label');
  if (label) label.textContent = text;
}

// Muestra un mensaje corto en pantalla (como "Escuchando..." o "Pensando...") con una animación suave
export function setStatus(message) {
  statusEl.classList.remove('fade-in');
  void statusEl.offsetWidth;
  statusEl.textContent = message;
  statusEl.classList.add('fade-in');
}

// Ajusta el modo de respuesta de la IA (respuestas cortas o detalladas) y actualiza el botón en consecuencia
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

// Cambia temporalmente el texto del botón cuando le pasas el mouse por encima
export function setHoverState() {
  if (state.isSpeaking || !state.hasStartedOnce) return;
  setBtnLabel('Cambiar modo');
}

// Aplica los colores, temas y estilos visuales seleccionados por el usuario (modo claro, oscuro, proyección, etc.)
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

// Alterna entre el modo 'Proyección' (fondo negro para el holograma) y 'Preview' (con colores de fondo)
export function toggleViewMode() {
  playSound('click');
  state.viewMode = state.viewMode === 'projection' ? 'preview' : 'projection';
  writeSession(SESSION_VIEW_KEY, state.viewMode);
  applyThemeUI();
  setStatus(state.viewMode === 'projection'
    ? 'Modo proyección: negro puro para el acrílico.'
    : 'Modo preview: solo para probar sin acrílico.');
}

// Cambia la paleta de colores del fondo cuando estás en modo Preview (entre rosa y azul)
export function togglePalette() {
  playSound('click');
  state.paletteMode = state.paletteMode === 'rosa' ? 'azul' : 'rosa';
  writeSession(SESSION_PALETTE_KEY, state.paletteMode);
  applyThemeUI();
}

// Alterna el modo Preview entre tema oscuro (para poca luz) y tema claro (para lugares iluminados)
export function toggleTheme() {
  playSound('click');
  state.themeMode = state.themeMode === 'dark' ? 'light' : 'dark';
  writeSession(SESSION_THEME_KEY, state.themeMode);
  applyThemeUI();
}
