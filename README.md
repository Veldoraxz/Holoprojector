# Holoprojector

Proyecto de asistente holográfico web con voz y respuesta inteligente.

## Deploy (Railway only)

**GitHub Pages quedó deprecado.** El frontend (`index.html`) se sirve desde el mismo servicio Node.js de Railway, que ya tiene `express.static` activo. Por eso el frontend llama a `/api/chat` con ruta relativa: funciona en Railway y en local (`npm run dev`).

- URL: <https://holoprojector-production.up.railway.app/>
- Variables de entorno: `GROQ_API_KEY` (obligatoria), `GROQ_MODEL` (default `openai/gpt-oss-120b`), `PORT` (opcional).

## Endpoints

### GET /

Sirve `index.html` (el asistente completo).

### GET /health

```json
{ "ok": true, "service": "Holoprojector backend" }
```

### POST /api/chat

Body:

```json
{
  "text": "Hola Kit",
  "mode": "compact",
  "style": "serious"
}
```

- `mode`: `compact` (default, 1-2 frases) o `detailed` (se extiende).
- `style`: `serious` (default), `cheeky` (picarón) o `calm` (calmo). Opcional, retrocompatible: si no se manda, se usa `serious`.
- `history`: array opcional de `{ role: 'user'|'assistant', content }` para contexto.

Respuesta:

```json
{
  "text": "Hola, ¿en qué te puedo ayudar?"
}
```

## Funcionalidades

- Asistente por voz completo: escuchar → Groq → hablar → volver a escuchar (Web Speech API, navegador Chrome recomendado).
- Orbe holográfico con parallax real por capas, color dinámico según tono emocional e indicador visual mientras piensa.
- Interrupción con efecto ripple si tocás el orbe o el botón mientras habla.
- Historial persistente en `localStorage` con limpieza automática de más de 7 días y vista para repasar.
- Presets de voz (Serio / Picarón / Calmado) que cambian pitch, rate y el prompt del backend; guardados en `sessionStorage`.
- Modo proyección (negro puro, para el acrílico) y modo preview (gradiente con paleta rosa/azul y tema claro/oscuro, solo para probar sin acrílico).
- Contador de mensajes de la sesión y barra de calidad de conversación.
