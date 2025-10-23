# API de Notificacions de Fitxes Pendents

## Endpoint: Crear Fitxa Pendent

### URL
```
POST /api/pending-records
```

### Descripció
Aquest endpoint permet a l'aplicació de gestió de cites crear automàticament notificacions de fitxes pendents quan es confirma una cita nova.

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "clientName": "Nom Complet del Client",
  "appointmentId": "ID_DE_LA_CITA",
  "appointmentDate": "2025-10-25T10:30:00Z"
}
```

### Camps requerits
- `clientName` (string): Nom complet del client
- `appointmentId` (string): ID únic de la cita (de l'altra aplicació)
- `appointmentDate` (string): Data i hora de la cita en format ISO 8601

### Exemple de cridada amb cURL
```bash
curl -X POST https://TU_DOMINIO_RAILWAY/api/pending-records \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Maria Garcia López",
    "appointmentId": "CITA_12345",
    "appointmentDate": "2025-10-25T10:30:00Z"
  }'
```

### Exemple de cridada amb JavaScript/Fetch
```javascript
const createPendingRecord = async (clientName, appointmentId, appointmentDate) => {
  const response = await fetch('https://TU_DOMINIO_RAILWAY/api/pending-records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientName,
      appointmentId,
      appointmentDate,
    }),
  });

  return await response.json();
};

// Ús:
await createPendingRecord(
  'Maria Garcia López',
  'CITA_12345',
  '2025-10-25T10:30:00Z'
);
```

### Exemple de cridada amb Python
```python
import requests
import json

def create_pending_record(client_name, appointment_id, appointment_date):
    url = 'https://TU_DOMINIO_RAILWAY/api/pending-records'
    payload = {
        'clientName': client_name,
        'appointmentId': appointment_id,
        'appointmentDate': appointment_date
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# Ús:
create_pending_record(
    'Maria Garcia López',
    'CITA_12345',
    '2025-10-25T10:30:00Z'
)
```

### Resposta exitosa (201 Created)
```json
{
  "success": true,
  "record": {
    "id": "uuid-generated",
    "clientName": "Maria Garcia López",
    "appointmentId": "CITA_12345",
    "appointmentDate": "2025-10-25T10:30:00Z",
    "createdAt": "2025-10-23T12:00:00Z",
    "isCompleted": false
  }
}
```

### Errors possibles

#### 400 Bad Request - Camps mancants
```json
{
  "error": "Missing required fields",
  "required": ["clientName", "appointmentId", "appointmentDate"]
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to create pending record"
}
```

---

## Endpoint: Llistar Fitxes Pendents

### URL
```
GET /api/pending-records
```

### Descripció
Obtenir totes les fitxes pendents que encara no s'han completat.

### Exemple de cridada
```bash
curl https://TU_DOMINIO_RAILWAY/api/pending-records
```

### Resposta exitosa (200 OK)
```json
{
  "success": true,
  "records": [
    {
      "id": "uuid-1",
      "clientName": "Maria Garcia López",
      "appointmentId": "CITA_12345",
      "appointmentDate": "2025-10-25T10:30:00Z",
      "createdAt": "2025-10-23T12:00:00Z",
      "isCompleted": false
    },
    {
      "id": "uuid-2",
      "clientName": "Joan Martínez",
      "appointmentId": "CITA_12346",
      "appointmentDate": "2025-10-25T11:00:00Z",
      "createdAt": "2025-10-23T12:30:00Z",
      "isCompleted": false
    }
  ]
}
```

---

## Integració automàtica

### Des de l'aplicació de gestió de cites

Quan es confirma una cita nova, l'aplicació hauria de cridar automàticament l'endpoint POST:

1. **Quan es confirma la cita** → Cridar POST /api/pending-records
2. **La fitxa apareixerà automàticament** a la pàgina principal de Fisio DB
3. **El fisioterapeuta pot crear la fitxa** des de la notificació
4. **El sistema marca automàticament com a completada** quan es crea la fitxa

### URL de producció
Quan el projecte estigui desplegat a Railway, substitueix `TU_DOMINIO_RAILWAY` amb el domini real (per exemple: `https://fisioactivafitxes.up.railway.app`)

