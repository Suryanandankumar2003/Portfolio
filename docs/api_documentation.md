# 📡 API Documentation — SK Portfolio Backend

Base URL: `http://localhost:8000` (dev) | `https://your-api.onrender.com` (prod)

---

## GET /health
Health check.

**Response:**
```json
{
  "status": "ok",
  "service": "SK Portfolio API",
  "version": "2.0.0",
  "owner": "Suryanandan Kumar",
  "timestamp": "2025-01-01T12:00:00"
}
```

---

## POST /chat
Ask the RAG chatbot a question about Suryanandan Kumar.

**Request:**
```json
{ "question": "Tell me about his projects", "session_id": "" }
```

**Response:**
```json
{
  "answer": "Suryanandan has built...",
  "session_id": "abc123",
  "status": "ok"
}
```

**Rate limit:** 30 requests/minute per IP

**Example questions:**
- "Who is Suryanandan?"
- "What are his DevOps skills?"
- "Tell me about his AI projects"
- "What cloud technologies does he know?"
- "How can I contact him?"

---

## POST /contact
Submit a contact form message. Saves to contacts.csv automatically.

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "DevOps Opportunity",
  "message": "Hi, I'd like to discuss a role..."
}
```

**Response:**
```json
{
  "message": "Thanks Jane Smith! Suryanandan will reply soon.",
  "status": "success"
}
```

**Rate limit:** 5 requests per 5 minutes per IP

---

## Error Responses

| Code | Meaning |
|------|---------|
| 422 | Validation error (missing/invalid fields) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Swagger UI:** `http://localhost:8000/docs`
