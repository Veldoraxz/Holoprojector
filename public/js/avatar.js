import { state } from './app.js';

//AVATAR (PNGtuber)
export const avatarContainer = document.getElementById('avatarContainer');
export const avatarImg = document.getElementById('avatarImg');

let t = 0;

// Arranca el motor de animación del avatar para que empiece a moverse y reaccionar al sonido
export function initAvatar() {
  requestAnimationFrame(animateAvatar);
}

// Recibe la intensidad de la voz y la guarda para que la animación sepa qué tanto debe latir o brillar la imagen
export function triggerPulse(intensity) {
  state.voiceIntensity = Math.max(state.voiceIntensity, Math.min(0.9, intensity));
}

// Cambia la imagen del avatar dinámicamente según el estado en el que se encuentre Kit
function animateAvatar() {
  if (!avatarContainer) return;

  const isThinking = state.isProcessing && !state.isSpeaking;
  const isAnswering = state.isSpeaking;

  let currentImg = 'neutral.jpg';
  if (isThinking) currentImg = 'thinking.jpg';
  else if (isAnswering) currentImg = 'answering.jpg';

  if (avatarImg && !avatarImg.src.endsWith(currentImg)) {
    avatarImg.src = `assets/${currentImg}`;
  }

  // Parallax / flotación suave constante
  const floatY = Math.sin(t * 0.03) * 6;

  // Escalar y brillar según la intensidad de la voz (triggerPulse)
  const scale = 1 + (state.voiceIntensity * 0.12);
  const brightness = 1 + (state.voiceIntensity * 0.4);

  // Aplicar transformación al contenedor entero
  avatarContainer.style.transform = `translateY(${floatY}px) scale(${scale})`;

  // Efectos visuales de filtro
  if (isThinking) {
    // Cuando está procesando la respuesta (efecto tenue o pensativo)
    avatarImg.style.filter = `brightness(0.7) blur(${Math.abs(Math.sin(t * 0.05)) * 2}px)`;
  } else {
    // Estado normal o hablando (iluminación dinámica por voz)
    const shadowAlpha = 0.2 + (state.voiceIntensity * 0.6);
    const shadowSpread = 10 + (state.voiceIntensity * 30);
    avatarImg.style.filter = `brightness(${brightness}) drop-shadow(0 0 ${shadowSpread}px rgba(255, 141, 161, ${shadowAlpha}))`;
  }

  t += 1;
  state.voiceIntensity *= 0.85; // decae suavemente

  requestAnimationFrame(animateAvatar);
}
