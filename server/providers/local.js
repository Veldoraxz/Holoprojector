//API LOCAL
// Hace lo mismo que Groq pero conectándose a una IA descargada en tu propia computadora, ideal para no depender de internet
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

  let text = reply;
  let emotion = 'neutral';
  try {
    // Intenta extraer el JSON en caso de que el modelo haya agregado bloques de código Markdown
    const jsonStr = reply.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    if (parsed.respuesta) text = parsed.respuesta;
    if (parsed.emocion) emotion = parsed.emocion;
  } catch (err) {
    console.warn('No se pudo parsear el JSON del modelo local:', reply);
  }

  return { text, emotion };
}

module.exports = { chat };
