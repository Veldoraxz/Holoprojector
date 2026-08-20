import { state } from './app.js';
import { colorRgb, getOrbColor } from './orb_colors.js';

//ORBE
export const canvas = document.getElementById('orb');
export const ctx = canvas.getContext('2d');

let t = 0;
let mouseNX = 0;
let mouseNY = 0;

export function initOrb() {
  window.addEventListener('mousemove', (event) => {
    mouseNX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseNY = (event.clientY / window.innerHeight) * 2 - 1;
  });
  requestAnimationFrame(drawOrb);
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function triggerPulse(intensity) {
  state.voiceIntensity = Math.max(state.voiceIntensity, Math.min(0.9, intensity));
}

function drawOrb() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const isThinking = state.isProcessing && !state.isSpeaking;
  const cx = canvas.width / 2 + mouseNX * 8;
  const cy = canvas.height / 2 + mouseNY * 6;
  const isMobile = window.innerWidth <= 768;
  const baseRadius = isMobile ? 148 : 118;
  const pulseSpeed = isThinking ? 0.045 : 0.09;
  const pulse = baseRadius + Math.sin(t * pulseSpeed) * (4 + (isThinking ? 4 : 0)) + state.voiceIntensity * 28;

  state.parallaxRotation += isThinking ? 0.02 : 0.0015;

  const tone = state.orbColorOverride || (isThinking ? 'thinking' : state.currentTone);
  const orbColors = getOrbColor(tone, state.paletteMode);

  const ringCount = isMobile ? 1 : 3;
  for (let ring = 0; ring < ringCount; ring++) {
    const speed = 1 + ring * 0.45;
    const angle = state.parallaxRotation * speed + ring * 2.2;
    const orbitRadius = pulse + 70 + ring * 20;
    const rx = cx + Math.cos(angle) * orbitRadius;
    const ry = cy + Math.sin(angle) * orbitRadius * 0.45;
    const alpha = (0.3 - ring * 0.09) * (1 - Math.abs(Math.sin(t * 0.02 + ring))) + (isThinking ? 0.05 : 0);

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${colorRgb(orbColors.ring)}, ${clamp(alpha, 0, 0.4)})`;
    ctx.lineWidth = 1.5 - ring * 0.3;
    ctx.arc(rx, ry, 14 - ring * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (!isMobile) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${colorRgb(orbColors.ring)}, 0.14)`;
    ctx.lineWidth = 1;
    ctx.arc(cx, cy, pulse + 88, 0, Math.PI * 2);
    ctx.stroke();

    const glowCx = cx + Math.cos(state.parallaxRotation * 0.7) * 7;
    const glowCy = cy + Math.sin(state.parallaxRotation * 0.7) * 7;
    const glow = ctx.createRadialGradient(glowCx, glowCy, 12, cx, cy, pulse + 70);
    glow.addColorStop(0, orbColors.glow[0]);
    glow.addColorStop(0.22, orbColors.glow[1]);
    glow.addColorStop(0.52, orbColors.glow[2]);
    glow.addColorStop(1, orbColors.glow[2].replace(/0\.\d+/, '0'));

    ctx.beginPath();
    ctx.fillStyle = glow;
    ctx.arc(cx, cy, pulse + 58, 0, Math.PI * 2);
    ctx.fill();
  }

  const coreCx = cx + Math.cos(state.parallaxRotation * 0.4) * 4;
  const coreCy = cy + Math.sin(state.parallaxRotation * 0.4) * 4;
  const core = ctx.createRadialGradient(coreCx, coreCy, 10, cx, cy, pulse);
  core.addColorStop(0, orbColors.core[0]);
  core.addColorStop(0.15, orbColors.core[1]);
  core.addColorStop(0.35, orbColors.core[2]);
  core.addColorStop(0.55, orbColors.core[3]);
  core.addColorStop(0.8, orbColors.core[3].replace(/0\.\d+/, '0.15'));
  core.addColorStop(1, orbColors.core[3].replace(/0\.\d+/, '0'));

  ctx.beginPath();
  ctx.fillStyle = core;
  ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
  ctx.fill();

  if (!isMobile) {
    const reflectX = cx + Math.cos(t * 0.01 + state.parallaxRotation * 0.5) * 12;
    const reflectY = cy - 30 + state.voiceIntensity * 15;
    const reflect = ctx.createRadialGradient(reflectX, reflectY, 2, reflectX, reflectY, pulse * 0.4);
    reflect.addColorStop(0, 'rgba(255,255,255,0.15)');
    reflect.addColorStop(0.5, 'rgba(255,240,245,0.05)');
    reflect.addColorStop(1, 'rgba(255,240,245,0)');

    ctx.beginPath();
    ctx.fillStyle = reflect;
    ctx.arc(cx, cy, pulse * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.strokeStyle = `rgba(${colorRgb(orbColors.ring)}, ${0.6 + state.voiceIntensity * 0.3})`;
  ctx.lineWidth = 2 + state.voiceIntensity * 1.5;
  ctx.arc(cx, cy, baseRadius + 14 + state.voiceIntensity * 12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = `rgba(${colorRgb(orbColors.ring)}, ${0.3 + Math.sin(t * 0.05) * 0.2})`;
  ctx.lineWidth = 1;
  ctx.arc(cx, cy, pulse * 0.65, 0, Math.PI * 2);
  ctx.stroke();

  if (isThinking) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.parallaxRotation * 2);
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = 'rgba(160, 200, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, pulse + 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (state.rippleActive) {
    const rippleProgress = state.rippleTime / 0.6;
    if (rippleProgress < 1) {
      const currentRippleRadius = rippleProgress * state.rippleMaxRadius;
      const rippleAlpha = (1 - rippleProgress) * 0.7;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(${colorRgb(orbColors.ring)}, ${rippleAlpha})`;
      ctx.lineWidth = 3 - rippleProgress * 2;
      ctx.arc(cx, cy, currentRippleRadius, 0, Math.PI * 2);
      ctx.stroke();

      const laggedRadius = Math.max(0, currentRippleRadius - 40);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${colorRgb(orbColors.ring)}, ${rippleAlpha * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.arc(cx, cy, laggedRadius, 0, Math.PI * 2);
      ctx.stroke();

      state.rippleTime += 1 / 60;
    } else {
      state.rippleActive = false;
      state.rippleTime = 0;
    }
  }

  t += 1;
  state.voiceIntensity *= 0.88;
  requestAnimationFrame(drawOrb);
}
