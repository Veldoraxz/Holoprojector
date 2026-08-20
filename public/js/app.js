import { loadPersistentState, clearConversation } from './storage.js';
import { applyThemeUI, setResponseMode, startBtn, viewModeBtn, paletteBtn, themeBtn, historyBtn, historyCloseBtn, newConvBtn, setHoverState, toggleViewMode, togglePalette, toggleTheme } from './ui.js';
import { showHistory, updateMeta, historyOverlayEl } from './history.js';
import { initAvatar, avatarContainer } from './avatar.js';
import { initSpeechRecognition, preloadVoices, startListening, playInterruptResponse } from './speech.js';
import { playSound } from './sounds.js';

//ESTADO GLOBAL
// Es la memoria temporal de Kit mientras la página está abierta (sabe si está hablando, qué tono usa, cuántos mensajes van, etc.)
export const state = {
  conversationHistory: [],
  responseMode: 'compact',
  currentSpeechId: 0,
  hasStartedOnce: false,
  currentTone: 'neutral',
  sessionMsgCount: 0,
  
  viewMode: 'projection',
  paletteMode: 'rosa',
  themeMode: 'dark',
  
  isSpeaking: false,
  isProcessing: false,
  isListening: false,
  voiceIntensity: 0,
  speechPulseTimer: null
};

//INICIALIZACION
// Es lo primero que corre cuando abrís la página: carga la memoria, prepara la voz, el micrófono y dibuja todo
function init() {
  loadPersistentState();
  initSpeechRecognition();
  preloadVoices();
  initAvatar();

  applyThemeUI();
  updateMeta();

  if (state.conversationHistory.length > 0) {
    newConvBtn.classList.remove('hidden');
  }

  setResponseMode(state.responseMode);
  setupEvents();
}

//EVENTOS
// Conecta los botones y clics de la pantalla con las funciones del código (ej: qué pasa al hacer clic en 'Iniciar')
function setupEvents() {
  startBtn.addEventListener('mouseenter', () => {
    if (!state.isSpeaking && state.hasStartedOnce) setHoverState();
  });

  startBtn.addEventListener('mouseleave', () => {
    if (!state.isSpeaking && state.hasStartedOnce) setResponseMode(state.responseMode);
  });

  startBtn.addEventListener('click', () => {
    if (state.isSpeaking) {
      playInterruptResponse();
      return;
    }

    playSound('click');

    if (state.isProcessing) {
      return;
    }

    if (!state.hasStartedOnce) {
      state.hasStartedOnce = true;
      setResponseMode(state.responseMode);
      startListening();
      return;
    }

    const nextMode = state.responseMode === 'compact' ? 'detailed' : 'compact';
    setResponseMode(nextMode);
    import('./ui.js').then(ui => ui.setStatus(nextMode === 'compact' ? 'Modo breve activo.' : 'Modo extendido activo.'));
  });

  avatarContainer.addEventListener('click', () => {
    if (state.isSpeaking) {
      playInterruptResponse();
      return;
    }
    playSound('click');
    if (!state.hasStartedOnce) {
      state.hasStartedOnce = true;
      setResponseMode(state.responseMode);
      startListening();
    }
  });

  newConvBtn.addEventListener('click', () => {
    if (state.isSpeaking || state.isProcessing || state.isListening) return;
    playSound('click');
    clearConversation();
    newConvBtn.classList.add('hidden');
  });

  viewModeBtn.addEventListener('click', toggleViewMode);
  paletteBtn.addEventListener('click', togglePalette);
  themeBtn.addEventListener('click', toggleTheme);

  historyBtn.addEventListener('click', () => {
    playSound('click');
    showHistory();
  });

  historyCloseBtn.addEventListener('click', () => {
    playSound('click');
    historyOverlayEl.classList.remove('show');
  });

  historyOverlayEl.addEventListener('click', (event) => {
    if (event.target === historyOverlayEl) {
      historyOverlayEl.classList.remove('show');
    }
  });
}

init();
