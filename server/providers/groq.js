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

  return { text: reply };
}

module.exports = { chat };
