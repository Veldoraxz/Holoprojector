const express = require('express');
const cors = require('cors');
const path = require('path');
const { getSystemPrompt } = require('./personality');

// Configura la aplicación y el puerto de internet por el que va a recibir conexiones
const app = express();
const port = Number(process.env.PORT) || 3000;

// Permite que navegadores de otros sitios hablen con nuestro servidor sin errores de seguridad (CORS)
app.use(cors({ origin: true }));
// Permite que el servidor pueda entender datos enviados en formato JSON (como mensajes de texto)
app.use(express.json({ limit: '1mb' }));

// Prepara el servidor para enviar las páginas web, imágenes y archivos de la carpeta 'public' al visitante
app.use(express.static(path.join(__dirname, '..', 'public')));

// Es una ruta de prueba súper básica para comprobar rápidamente si el servidor sigue encendido y sin caerse
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'Holoprojector backend' });
});

// Recibe los mensajes que escribe el usuario, le suma las reglas de cómo actuar (el system prompt) y le pide a la IA una respuesta
app.post('/api/chat', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const mode = String(req.body?.mode || 'compact').toLowerCase() === 'detailed' ? 'detailed' : 'compact';
    // Nota: 'style' ya no se usa, personalidad fija.

    if (!text) {
      return res.status(400).json({ error: 'Falta el texto a procesar.' });
    }

    const systemPrompt = getSystemPrompt(mode);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: text }
    ];

    // Elegir provider según env var, fallback a Groq
    const useLocal = process.env.LLM_PROVIDER === 'local';
    const provider = useLocal ? require('./providers/local') : require('./providers/groq');

    const result = await provider.chat(messages);

    return res.json({ text: result.text, emotion: result.emotion });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
});

// Da la orden final para arrancar el servidor en el puerto indicado y se queda escuchando visitas permanentemente
app.listen(port, () => {
  console.log(`Holoprojector backend running on port ${port}`);
});
