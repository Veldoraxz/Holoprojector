const express = require('express');
const cors = require('cors');
const path = require('path');
const { getSystemPrompt } = require('./personality');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

// Servir estáticos desde la carpeta public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// healthcheck
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'Holoprojector backend' });
});

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

    return res.json({ text: result.text });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
});

app.listen(port, () => {
  console.log(`Holoprojector backend running on port ${port}`);
});
