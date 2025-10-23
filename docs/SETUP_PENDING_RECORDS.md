# 🔧 Setup de Pending Records - Guía Completa

## Problema

La app de calendario (Fisioactiva) no está creando correctamente los registros en `pending_records` de Supabase.

## ✅ Solución Paso a Paso

### 1. Crear la tabla en Supabase

1. **Ve a tu proyecto de Supabase:**
   - https://supabase.com/dashboard
   - Selecciona tu proyecto: `txkytuhmjmoxnvxlhzsj`

2. **Abre el SQL Editor:**
   - En el menú lateral, haz clic en **"SQL Editor"**
   - Haz clic en **"New query"**

3. **Copia y pega este SQL:**

```sql
-- Crear tabla pending_records
CREATE TABLE IF NOT EXISTS pending_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  appointment_id TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_pending_records_is_completed ON pending_records(is_completed);
CREATE INDEX IF NOT EXISTS idx_pending_records_appointment_date ON pending_records(appointment_date);

-- Habilitar Row Level Security
ALTER TABLE pending_records ENABLE ROW LEVEL SECURITY;

-- Política para permitir TODO a todos los usuarios (para desarrollo)
CREATE POLICY "Enable all access for all users" ON pending_records
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. **Ejecuta el query:**
   - Haz clic en **"Run"** (o presiona Ctrl/Cmd + Enter)
   - Deberías ver: `Success. No rows returned`

5. **Verifica que la tabla existe:**
   - Ve a **"Table Editor"** en el menú lateral
   - Deberías ver la tabla `pending_records` en la lista

### 2. Verificar que el API endpoint funciona

1. **Prueba el endpoint manualmente con cURL:**

```bash
curl -X POST https://TU-DOMINIO-RAILWAY.railway.app/api/pending-records \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Prueba Test",
    "appointmentId": "test-123",
    "appointmentDate": "2025-10-25T10:30:00Z"
  }'
```

O si estás probando en local (puerto 3000):

```bash
curl -X POST http://localhost:3000/api/pending-records \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Prueba Test",
    "appointmentId": "test-123",
    "appointmentDate": "2025-10-25T10:30:00Z"
  }'
```

2. **Respuesta esperada:**

```json
{
  "success": true,
  "record": {
    "id": "uuid-generado",
    "clientName": "Prueba Test",
    "appointmentId": "test-123",
    "appointmentDate": "2025-10-25T10:30:00Z",
    "createdAt": "...",
    "isCompleted": false
  }
}
```

3. **Verifica en Supabase:**
   - Ve a **Table Editor** → **pending_records**
   - Deberías ver el registro de prueba

### 3. Verificar la configuración en Fisioactiva

1. **Asegúrate de tener el archivo `.env.local` en Fisioactiva:**

```bash
# En: fisioactiva-main/.env.local

NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=fisioactiva-secret-key-2025-production-very-secure

# Esta es la URL de tu app de fichas
# En desarrollo local:
NEXT_PUBLIC_FICHES_APP_URL=http://localhost:3000

# En producción:
# NEXT_PUBLIC_FICHES_APP_URL=https://tu-dominio.railway.app
```

2. **Verifica que el servicio de notificaciones existe:**
   - Archivo: `src/services/notificationService.ts`
   - Debería existir ✅

3. **Verifica la integración en appointmentService:**
   - Archivo: `src/services/appointmentService.supabase.ts`
   - Debería tener el import: `import { notifyPendingRecord } from "./notificationService";`
   - La función `addAppointment` debería llamar a `notifyPendingRecord`

### 4. Prueba completa en desarrollo local

**Terminal 1 - Fisiodbfiches:**
```bash
cd c:\Users\xavie\Downloads\fisiodbfiches
npm run dev
```

**Terminal 2 - Fisioactiva:**
```bash
cd c:\Users\xavie\Downloads\fisioactiva-main\fisioactiva-main

# Verifica que tienes .env.local con:
# NEXT_PUBLIC_FICHES_APP_URL=http://localhost:3000

npm run dev
```

**Prueba:**
1. Abre http://localhost:9002 (Fisioactiva)
2. Inicia sesión (si es necesario)
3. Crea una nueva cita
4. **Mira la consola del navegador** - deberías ver logs como:
   - `Notification sent successfully: {...}`
5. Abre http://localhost:3000 (Fisiodbfiches)
6. Deberías ver la notificación en la página principal

### 5. Debugging - Ver los logs

#### En Fisioactiva (cuando creas una cita):

**Logs de éxito:**
```
Notification sent successfully: { success: true, record: {...} }
```

**Si no está configurado:**
```
FICHES_APP_URL not configured. Skipping notification.
```

**Si hay error:**
```
Error calling fiches app API: [detalles del error]
Failed to send notification, but appointment was created: [error]
```

#### En Fisiodbfiches (cuando recibe la notificación):

**Logs esperados en la terminal:**
```
POST /api/pending-records 201
```

**Si hay error:**
```
Error in POST /api/pending-records: [detalles]
POST /api/pending-records 500
```

### 6. Verificar en la base de datos

1. Ve a Supabase → Table Editor → `pending_records`
2. Ejecuta este query para ver todos los registros:

```sql
SELECT * FROM pending_records ORDER BY created_at DESC;
```

3. Si no ves registros después de crear una cita:
   - Revisa los logs de la consola
   - Verifica que `NEXT_PUBLIC_FICHES_APP_URL` esté configurada
   - Verifica que Fisiodbfiches esté corriendo en el puerto correcto

### 7. Script de prueba rápida

Crea este archivo en Fisioactiva para probar la notificación:

**fisioactiva-main/test-notification.js**

```javascript
const testNotification = async () => {
  const response = await fetch('http://localhost:3000/api/pending-records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: 'Test Cliente',
      appointmentId: 'test-' + Date.now(),
      appointmentDate: new Date().toISOString(),
    }),
  });
  
  const data = await response.json();
  console.log('Response:', data);
};

testNotification();
```

Ejecuta:
```bash
node test-notification.js
```

## ❓ Problemas Comunes

### "fetch failed" o "ECONNREFUSED"
- ✅ Verifica que Fisiodbfiches esté corriendo en el puerto 3000
- ✅ Verifica `NEXT_PUBLIC_FICHES_APP_URL` en .env.local

### "Missing required fields"
- ✅ El request debe tener: `clientName`, `appointmentId`, `appointmentDate`
- ✅ Verifica que el código llame correctamente a `notifyPendingRecord`

### "Failed to create pending record" (500)
- ✅ Verifica que la tabla `pending_records` exista en Supabase
- ✅ Verifica las credenciales de Supabase en Fisiodbfiches
- ✅ Revisa los logs de la API en la terminal de Fisiodbfiches

### La notificación no aparece en Fisiodbfiches
- ✅ Verifica que el registro se creó en Supabase (Table Editor)
- ✅ Verifica que `is_completed` sea `false`
- ✅ Recarga la página de Fisiodbfiches (F5)

## 📝 Checklist Final

- [ ] Tabla `pending_records` creada en Supabase
- [ ] Políticas RLS configuradas
- [ ] API endpoint `/api/pending-records` funciona (probado con cURL)
- [ ] Variable `NEXT_PUBLIC_FICHES_APP_URL` configurada en Fisioactiva
- [ ] Ambas apps corriendo (puertos 9002 y 3000)
- [ ] Al crear una cita, aparece en los logs: "Notification sent successfully"
- [ ] El registro aparece en Supabase → `pending_records`
- [ ] La notificación aparece en la página principal de Fisiodbfiches

---

**Si sigues todos estos pasos y aún no funciona, envíame:**
1. Los logs de la consola de Fisioactiva al crear una cita
2. Los logs de la terminal de Fisiodbfiches
3. Una captura de la tabla `pending_records` en Supabase

