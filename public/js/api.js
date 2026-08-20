import { API_BASE } from './config.js';
import { updateMeta } from './history.js';
import { setStatus, startBtn } from './ui.js';

//API EXTERNA
// Se comunica con el backend de nuestro servidor, mandándole el chat completo para que la IA arme su respuesta
export async function preguntarGroq(texto, conversationHistory, responseMode) {
  setStatus('Pensando...');
  startBtn.classList.add('loading');

  try {
    const response = await fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history: conversationHistory,
        text: texto,
        mode: responseMode
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(data);
      return data?.error || 'No pude responder ahora mismo.';
    }

    const raw = data?.text || 'No pude responder ahora mismo.';
    return raw;
  } catch (error) {
    console.error('Error backend:', error);
    return 'No pude procesar la respuesta.';
  } finally {
    startBtn.classList.remove('loading');
  }
}

// Revisa las palabras que dice Kit para adivinar su "estado de ánimo" (si pregunta, afirma, duda, etc.) y así cambiar su expresión
export function detectTone(text) {
  const lowerText = text.toLowerCase();

  if (/^[^.!?]*\?/.test(lowerText) || /^¿/.test(lowerText)) return 'question';
  if (/^(sí|si|claro|dale|hecho|listo|perfecto|ok|okey|bueno)\b/i.test(lowerText)) return 'affirmation';
  if (/jejej|jajaj|haha|😏|pero bueno|mirá que|vos decí/.test(lowerText)) return 'sarcasm';
  if (/no sé|no estoy seguro|creo que|capaz que|quizás|dudoso/.test(lowerText)) return 'confused';
  if (/no|mal|horrible|odio|peor|nunca|jamás|imposible/.test(lowerText)) return 'negative';

  return 'neutral';
}

// Traduce símbolos raros (como *, @, #) a palabras escritas para que el sintetizador de voz sepa cómo pronunciarlos
export function convertSymbolsToWords(text) {
  return text
    .replace(/\*/g, 'asterisco')
    .replace(/_/g, 'guion bajo')
    .replace(/`/g, 'backtick')
    .replace(/~/g, 'tilde')
    .replace(/\|/g, 'barra')
    .replace(/#/g, 'numeral')
    .replace(/\$/g, 'peso')
    .replace(/%/g, 'porcentaje')
    .replace(/&/g, 'ampersand')
    .replace(/\^/g, 'circunflejo')
    .replace(/\[/g, 'corchete abierto')
    .replace(/\]/g, 'corchete cerrado')
    .replace(/\{/g, 'llave abierta')
    .replace(/\}/g, 'llave cerrada')
    .replace(/</g, 'menor que')
    .replace(/>/g, 'mayor que')
    .replace(/\//g, 'barra');
}

// Limpia un poco el texto final antes de hablar, borrando espacios extra y pequeños errores
export function formatAssistantReply(text) {
  if (!text) return '¿Qué querés que haga?';
  return text
    .replace(/\s+/g, ' ')
    .replace(/\b(soy|sos)\b/gi, 'soy')
    .trim();
}
