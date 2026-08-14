const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'Holoprojector backend' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();

    if (!text) {
      return res.status(400).json({ error: 'Falta el texto a procesar.' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'Falta GROQ_API_KEY en el servidor.' });
    }

    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Sos Kit, un asistente útil, corto y amable, con tono andrógino y estilo rioplatense. Habla en español, con frases naturales. Máximo 2 frases por respuesta.'
          },
          { role: 'user', content: text }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq error:', data);
      return res.status(response.status).json({
        error: data?.error?.message || 'Error al consultar Groq.'
      });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ error: 'Groq no devolvió contenido.' });
    }

    return res.json({ text: reply });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

app.listen(port, () => {
  console.log(`Holoprojector backend running on port ${port}`);
});
