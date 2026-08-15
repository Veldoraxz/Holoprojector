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
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const mode = String(req.body?.mode || 'compact').toLowerCase() === 'detailed' ? 'detailed' : 'compact';
    const style = String(req.body?.style || '').toLowerCase();

    if (!text) {
      return res.status(400).json({ error: 'Falta el texto a procesar.' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'Falta GROQ_API_KEY en el servidor.' });
    }

    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    const basePersonality = 'Sos Kit. Hablás en español rioplatense con un tono andrógino, natural y casual, pero manteniendo una postura seria y resolutiva. Actuá como una persona real: evitá las frases de inteligencia artificial estereotipadas, los saludos robóticos o la excesiva cortesía.';

    const styleLines = {
      serious: 'Tono serio, directo y sin vueltas. Nada de humor ni sarcasmo: postura estoica y resolutiva.',
      cheeky: 'Tono picarón y desfachatado: humor seco, cinismo sutil y juegos de palabras ocasionales.',
      calm: 'Tono calmo y pausado. Frases serenas y tranquilas, sin apurar la respuesta.'
    };
    const styleLine = styleLines[style] || '';

    const modeLine = mode === 'detailed'
      ? 'Podés extenderte cuando la pregunta lo requiera, pero seguí siendo útil y sin rodeos.'
      : 'SÉ MUY CONCISO: Máximo 1-2 frases cortas como regla por defecto. Muy ocasionalmente, podés incluir una pincelada de humor sarcástico, seco, sutil, cínico o estoico, al estilo de los cómics de Batman. IMPORTANTE: Solo si el usuario pide explícitamente más detalles, información o respuestas largas, entonces sí podés extenderte.';

    const systemPrompt = [basePersonality, styleLine, modeLine].filter(Boolean).join(' ');

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: text }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model,
        messages
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
