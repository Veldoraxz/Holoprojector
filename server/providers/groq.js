//API EXTERNA
// Se encarga de enviar la conversación a los servidores de Groq en internet y traer la respuesta de la IA
async function chat(messages) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error('Falta GROQ_API_KEY en el servidor.');
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
      messages
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Groq error:', data);
    throw new Error(data?.error?.message || 'Error al consultar Groq.');
  }

  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error('Groq no devolvió contenido.');
  }

  let text = reply;
  let emotion = 'neutral';
  try {
    // Intenta extraer el JSON en caso de que el modelo haya agregado bloques de código Markdown
    const jsonStr = reply.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    if (parsed.respuesta) text = parsed.respuesta;
    if (parsed.emocion) emotion = parsed.emocion;
  } catch (err) {
    console.warn('No se pudo parsear el JSON de Groq:', reply);
  }

  return { text, emotion };
}

module.exports = { chat };
