import { state } from './app.js';
import { RESTART_DELAY_MS, WORD_DELAY_MS, WORD_FADE_DELAY_MS, SPEECH_PULSE_INTERVAL_MS, TONE_VOICE } from './config.js';
import { subtitlesEl, subtitleTimers, clearSubtitleTimers, setStatus, setBtnLabel, newConvBtn, setResponseMode } from './ui.js';
import { triggerPulse, updateAvatarEmotion } from './avatar.js';
import { playSound } from './sounds.js';
import { convertSymbolsToWords, preguntarGroq, detectTone } from './api.js';
import { persistSession } from './storage.js';
import { updateMeta } from './history.js';

//RECONOCIMIENTO DE VOZ
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
export let recognition = null;

// Prepara el micrófono para escuchar en español y define qué hacer cuando escucha algo o si hay un error
export function initSpeechRecognition() {
  if (!SpeechRecognition) return;

  recognition = new SpeechRecognition();
  recognition.lang = 'es-AR';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    state.isListening = true;
    setStatus('Escuchando...');
  };

  recognition.onerror = (event) => {
    console.error('SpeechRecognition error:', event.error);
    if (!state.isSpeaking && !state.isProcessing) {
      setStatus('No pude escuchar. Reintentando...');
      setTimeout(() => {
        try { recognition.start(); } catch (err) {}
      }, 1200);
    }
  };

  recognition.onresult = async (event) => {
    const texto = event.results[0][0].transcript.trim();
    if (!texto) return;

    state.conversationHistory.push({ role: 'user', content: texto, ts: Date.now() });
    persistSession();
    state.sessionMsgCount += 1;
    updateMeta();
    state.isListening = false;
    state.isProcessing = true;
    
    const respuesta = await preguntarGroq(texto, state.conversationHistory, state.responseMode);
    
    state.isProcessing = false;
    
    state.conversationHistory.push({ role: 'assistant', content: respuesta, ts: Date.now() });
    persistSession();
    updateMeta();

    state.currentTone = detectTone(respuesta);
    updateAvatarEmotion(state.currentTone);
    
    hablar(respuesta);
  };

  recognition.onend = () => {
    state.isListening = false;
    if (!state.isSpeaking && !state.isProcessing) {
      try {
        setTimeout(() => recognition.start(), RESTART_DELAY_MS);
      } catch (err) {
        console.warn('No se pudo reiniciar el reconocimiento:', err);
      }
    }
  };
}

//VOZ DEL SISTEMA
function chooseSpanishVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const preferred = ['es-AR', 'es-ES', 'es'];

  for (const lang of preferred) {
    const match = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase()));
    if (match) return match;
  }

  return voices.find(v => /es/i.test(v.lang)) || voices[0] || null;
}

//SINTESIS DE VOZ
// Pide permiso al navegador para cargar las voces disponibles antes de que Kit intente hablar por primera vez
export function preloadVoices() {
  if (!('speechSynthesis' in window)) return;
  const forceLoad = () => { window.speechSynthesis.getVoices(); };
  forceLoad();

  window.speechSynthesis.onvoiceschanged = () => {
    forceLoad();
    const voices = window.speechSynthesis.getVoices();
    if (voices.length && !state.hasStartedOnce) {
      setStatus('Listo para hablar.');
    }
  };

  let voiceRetries = 0;
  const voiceTimer = setInterval(() => {
    if (window.speechSynthesis.getVoices().length || voiceRetries > 10) {
      clearInterval(voiceTimer);
      return;
    }
    forceLoad();
    voiceRetries += 1;
  }, 300);
}

function showWords(text) {
  clearSubtitleTimers();
  subtitlesEl.innerHTML = '';
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return;

  words.forEach((word, index) => {
    const delay = index * WORD_DELAY_MS + 160;

    const wordTimer = setTimeout(() => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      subtitlesEl.appendChild(span);

      const fadeTimer = setTimeout(() => {
        span.classList.add('fading');
        const removeTimer = setTimeout(() => span.remove(), 700);
        subtitleTimers.push(removeTimer);
      }, Math.max(WORD_FADE_DELAY_MS, WORD_DELAY_MS * 1.6));

      subtitleTimers.push(fadeTimer);
    }, delay);

    subtitleTimers.push(wordTimer);
  });
}

function getVoiceParams(text) {
  const tone = detectTone(text) || 'neutral';
  const base = TONE_VOICE[tone] || TONE_VOICE.neutral;
  // Personalidad fija: seria
  const preset = { pitch: 0.95, rate: 0.95 };
  return {
    pitch: Math.min(2, Math.max(0.5, base.pitch * preset.pitch)),
    rate: Math.min(2, Math.max(0.5, base.rate * preset.rate))
  };
}

// Transforma el texto de respuesta de Kit a audio y lo hace sonar por los parlantes, animando los subtítulos palabra por palabra
export function hablar(texto) {
  if (!texto || !('speechSynthesis' in window)) {
    state.isSpeaking = false;
    setStatus('La voz del sistema no está disponible en este navegador.');
    return;
  }

  state.currentSpeechId += 1;
  const speechId = state.currentSpeechId;

  clearSubtitleTimers();
  subtitlesEl.innerHTML = '';
  state.isSpeaking = true;
  window.speechSynthesis.cancel();

  const textoParaLeer = convertSymbolsToWords(texto);
  const utterance = new SpeechSynthesisUtterance(textoParaLeer);
  const voiceParams = getVoiceParams(texto);
  utterance.lang = 'es-AR';
  utterance.rate = voiceParams.rate;
  utterance.pitch = voiceParams.pitch;
  utterance.volume = 1;

  const voice = chooseSpanishVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = () => {
    if (speechId !== state.currentSpeechId) return;
    state.isSpeaking = true;
    playSound('bip');
    setStatus('Hablando...');
    showWords(texto);
    startSpeechPulseLoop();
    setBtnLabel('Cortar');
  };

  utterance.onboundary = () => {
    if (speechId !== state.currentSpeechId) return;
    triggerPulse(0.9);
  };

  utterance.onend = () => {
    if (speechId !== state.currentSpeechId) return;
    state.isSpeaking = false;
    stopSpeechPulseLoop();
    updateAvatarEmotion('neutral');
    setStatus('Escuchando...');
    setResponseMode(state.responseMode);
    if (state.conversationHistory.length > 0) {
      newConvBtn.classList.remove('hidden');
    }
    setTimeout(() => {
      if (recognition && !state.isProcessing) {
        try { recognition.start(); } catch (err) {}
      }
    }, 500);
  };

  utterance.onerror = () => {
    state.isSpeaking = false;
    setStatus('Error de voz del sistema.');
  };

  window.speechSynthesis.speak(utterance);
}

// Prende el micrófono para empezar a escuchar al usuario
export function startListening() {
  if (state.isSpeaking || state.isProcessing || state.isListening) return;

  playSound('activate');
  newConvBtn.classList.add('hidden');
  if (recognition) {
    try {
      recognition.start();
    } catch (err) {
      console.warn('El reconocimiento ya está activo:', err);
    }
    return;
  }

  setStatus('Este navegador no soporta reconocimiento de voz.');
}

function startSpeechPulseLoop() {
  if (state.speechPulseTimer) clearInterval(state.speechPulseTimer);

  state.speechPulseTimer = setInterval(() => {
    if (!state.isSpeaking) return;
    const intensity = 0.2 + Math.random() * 0.35;
    triggerPulse(intensity);
  }, SPEECH_PULSE_INTERVAL_MS);
}

function stopSpeechPulseLoop() {
  if (state.speechPulseTimer) {
    clearInterval(state.speechPulseTimer);
    state.speechPulseTimer = null;
  }
  state.voiceIntensity = 0;
}

// Hace que si tocás a Kit mientras habla, se calle al instante y tire una respuesta aleatoria (como si lo interrumpieras)
export function playInterruptResponse() {
  const interruptResponses = [
    { text: '¿eh?', tone: 'confused' },
    { text: 'Dale, me callé.', tone: 'compliant' },
    { text: 'Bueno, bueno...', tone: 'compliant' },
    { text: 'Me cortaste en lo mejor.', tone: 'sarcastic' },
    { text: 'Ñeeee...', tone: 'confused' },
    { text: 'Ok, ok, me silenciás.', tone: 'compliant' },
    { text: 'Ay, espera que iba para mejor esto.', tone: 'sarcastic' }
  ];

  clearSubtitleTimers();
  subtitlesEl.innerHTML = '';
  state.currentSpeechId += 1;

  const response = interruptResponses[Math.floor(Math.random() * interruptResponses.length)];

  const triggerFlash = () => {
    state.voiceIntensity = 0.8;
    playSound('deactivate');

    setTimeout(() => {
      state.voiceIntensity = 0;
    }, 180);
  };

  triggerFlash();

  if (!('speechSynthesis' in window)) return;

  state.isSpeaking = true;
  window.speechSynthesis.cancel();

  const textoParaLeer = convertSymbolsToWords(response.text);
  const utterance = new SpeechSynthesisUtterance(textoParaLeer);
  utterance.lang = 'es-AR';
  utterance.rate = 1.1;
  utterance.pitch = response.tone === 'confused' ? 1.35 : 1.15;
  utterance.volume = 1;

  const voice = chooseSpanishVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = () => {
    setStatus('Kit: ' + response.text);
    showWords(response.text);
    startSpeechPulseLoop();
    playSound('bip');
  };

  utterance.onend = () => {
    state.isSpeaking = false;
    stopSpeechPulseLoop();
    setStatus('Escuchando...');
    setResponseMode(state.responseMode);
    setTimeout(() => {
      if (recognition && !state.isProcessing) {
        try { recognition.start(); } catch (err) {}
      }
    }, 500);
  };

  window.speechSynthesis.speak(utterance);
}
