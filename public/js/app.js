import { loadPersistentState, clearConversation } from './storage.js';
import { setResponseMode, startBtn, historyBtn, historyCloseBtn, newConvBtn, setHoverState } from './ui.js';
import { showHistory, updateMeta, historyOverlayEl } from './history.js';
import { initOrb, canvas } from './orb.js';
import { initSpeechRecognition, preloadVoices, startListening, playInterruptResponse } from './speech.js';
import { playSound } from './sounds.js';

//ESTADO GLOBAL
export const state = {
  conversationHistory: [],
  responseMode: 'compact',
  currentSpeechId: 0,
  hasStartedOnce: false,
  currentTone: 'neutral',
  orbColorOverride: null,
  sessionMsgCount: 0,
  
  isSpeaking: false,
  isProcessing: false,
  isListening: false,
  voiceIntensity: 0,
  speechPulseTimer: null,
  parallaxRotation: 0,
  rippleActive: false,
  rippleTime: 0,
  rippleMaxRadius: 200
};

//INICIALIZACION
function init() {
  loadPersistentState();
  initSpeechRecognition();
  preloadVoices();
  initOrb();

  updateMeta();

  if (state.conversationHistory.length > 0) {
    newConvBtn.classList.remove('hidden');
  }

  setResponseMode(state.responseMode);
  setupEvents();
}

//EVENTOS
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

  canvas.addEventListener('click', () => {
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
    if (state.isSpeaking || state.isProcessing) return;
    playSound('click');
    clearConversation();
    newConvBtn.classList.add('hidden');
  });



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
