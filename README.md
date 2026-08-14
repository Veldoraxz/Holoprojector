# Holoprojector

Proyecto de asistente holográfico web con voz y respuesta inteligente.

## Deploy en Railway

Todo se despliega en un solo servicio Node.js en Railway:https://holoprojector-production.up.railway.app/

## Endpoints

### GET /
`index.html`.

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
