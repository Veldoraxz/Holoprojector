import { state } from './app.js';

//HISTORIAL
export const msgCountEl = document.getElementById('msgCount');
export const qualityPctEl = document.getElementById('qualityPct');
export const qualityFillEl = document.getElementById('qualityFill');
export const historyOverlayEl = document.getElementById('historyOverlay');
export const historyBodyEl = document.getElementById('historyBody');

// Actualiza en pantalla la cantidad de mensajes y dibuja la barra de "calidad" de la charla
export function updateMeta() {
  msgCountEl.textContent = 'Mensajes: ' + state.sessionMsgCount;

  const quality = computeQuality(state.conversationHistory);
  if (state.conversationHistory.length >= 2) {
    qualityPctEl.textContent = 'Calidad: ' + quality + '%';
    qualityFillEl.style.width = quality + '%';
  } else {
    qualityPctEl.textContent = 'Calidad: —';
    qualityFillEl.style.width = '0%';
  }
}

// Calcula un porcentaje de "calidad" de la conversación basándose en qué tanto preguntas y qué tan largas son las respuestas
export function computeQuality(history) {
  const userMsgs = history.filter(msg => msg.role === 'user');
  const asstMsgs = history.filter(msg => msg.role === 'assistant');
  if (!userMsgs.length) return 0;

  let score = 20;

  const questionCount = userMsgs.filter(msg => /[?¿]/.test(msg.content)).length;
  score += Math.min(25, (questionCount / userMsgs.length) * 25);

  const avgLen = asstMsgs.length
    ? asstMsgs.reduce((sum, msg) => sum + (msg.content || '').length, 0) / asstMsgs.length
    : 0;
  if (avgLen >= 20 && avgLen <= 400) score += 20;
  else if (avgLen > 400) score += 10;

  if (history.length >= 4) score += 15;
  if (history.length >= 8) score += 10;
  if (history.length >= 12) score += 10;

  return Math.min(100, Math.round(score));
}

// Dibuja la lista completa de mensajes (chat) en la ventana del historial
export function renderHistory() {
  historyBodyEl.innerHTML = '';
  if (!state.conversationHistory.length) {
    historyBodyEl.textContent = 'Todavía no hay conversación.';
    return;
  }

  state.conversationHistory.forEach((msg) => {
    const entry = document.createElement('div');
    entry.className = 'h-entry ' + (msg.role === 'user' ? 'user' : 'assistant');

    const meta = document.createElement('div');
    meta.className = 'h-meta';

    const who = document.createElement('span');
    who.textContent = msg.role === 'user' ? 'Vos' : 'Kit';

    const when = document.createElement('span');
    const ts = typeof msg.ts === 'number' ? msg.ts : Date.now();
    when.textContent = new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    meta.appendChild(who);
    meta.appendChild(when);

    const content = document.createElement('p');
    content.style.margin = '0';
    content.textContent = msg.content || '';

    entry.appendChild(meta);
    entry.appendChild(content);
    historyBodyEl.appendChild(entry);
  });

  historyBodyEl.scrollTop = historyBodyEl.scrollHeight;
}

// Abre la ventana flotante para poder leer el historial completo de la charla
export function showHistory() {
  renderHistory();
  historyOverlayEl.classList.add('show');
}
