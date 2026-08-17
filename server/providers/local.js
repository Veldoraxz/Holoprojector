//API LOCAL
async function chat(messages) {
  // Fase B: Reemplazo para consultar modelo local servido por Ollama / llama.cpp
  // Usar URL local, ej: http://localhost:11434/v1/chat/completions
  
  const apiUrl = process.env.LOCAL_API_URL || 'http://localhost:11434/v1/chat/completions';
  const model = process.env.LOCAL_MODEL || 'llama3';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Local provider error:', data);
    throw new Error(data?.error?.message || 'Error al consultar API local.');
  }

  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error('El modelo local no devolvió contenido.');
  }

  return { text: reply };
}

module.exports = { chat };
