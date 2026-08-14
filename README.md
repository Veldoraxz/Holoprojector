# Holoprojector

Proyecto de asistente holográfico web con voz y respuesta inteligente.

## Deploy en Railway

Todo se despliega en un solo servicio Node.js en Railway:

1. Conectar este repo a Railway (puede ser privado).
2. Crear servicio Node.js.
3. Definir variables de entorno:
   - `GROQ_API_KEY=tu_clave_de_groq`
   - `GROQ_MODEL=openai/gpt-oss-120b`
   - `PORT=3000`
4. Deploy automático.
5. Acceder a la URL pública de Railway → sirve `index.html` como raíz.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:3000` en el navegador.

## Endpoints

### GET /
Sirve el `index.html` estático.

### POST /api/chat

Body:
```json
{
  "text": "Hola Kit"
}
```

Respuesta:
```json
{
  "text": "Hola, ¿en qué te puedo ayudar?"
}
```
