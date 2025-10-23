# 🔄 Recrear la Taula pending_records

## 📋 Passos per recrear la taula des de zero

### 1. Accedir a Supabase

1. Ves a https://supabase.com/dashboard
2. Inicia sessió
3. Selecciona el teu projecte
4. Busca **SQL Editor** al menú lateral esquerre

### 2. Obrir l'Editor SQL

1. Fes clic a **SQL Editor**
2. Fes clic a **"New query"** (consulta nova)
3. S'obrirà un editor de text buit

### 3. Copiar i Enganxar l'Script

Copia **TOT** el contingut del fitxer `recreate-pending-records.sql` i enganxa'l a l'editor.

O copia aquest script complet:

```sql
-- ELIMINAR TOT EL EXISTENT
DROP POLICY IF EXISTS "Enable all access for all users" ON pending_records;
DROP POLICY IF EXISTS "Enable read access for all users" ON pending_records;
DROP POLICY IF EXISTS "Enable insert access for all users" ON pending_records;
DROP POLICY IF EXISTS "Enable update access for all users" ON pending_records;
DROP POLICY IF EXISTS "Enable delete access for all users" ON pending_records;

DROP INDEX IF EXISTS idx_pending_records_is_completed;
DROP INDEX IF EXISTS idx_pending_records_appointment_date;
DROP INDEX IF EXISTS idx_pending_records_created_at;

DROP TABLE IF EXISTS pending_records CASCADE;

-- CREAR LA TAULA NOVA
CREATE TABLE pending_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  appointment_id TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE
);

-- CREAR ÍNDEXS
CREATE INDEX idx_pending_records_is_completed ON pending_records(is_completed);
CREATE INDEX idx_pending_records_appointment_date ON pending_records(appointment_date);
CREATE INDEX idx_pending_records_created_at ON pending_records(created_at);

-- HABILITAR RLS
ALTER TABLE pending_records ENABLE ROW LEVEL SECURITY;

-- CREAR POLÍTIQUES (PERMETRE TOT)
CREATE POLICY "Enable read access for all users" 
ON pending_records FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON pending_records FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON pending_records FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" 
ON pending_records FOR DELETE 
USING (true);

-- INSERIR UN REGISTRE DE PROVA
INSERT INTO pending_records (client_name, appointment_id, appointment_date)
VALUES ('Test Client', 'test-123', NOW() + INTERVAL '1 day');

-- VERIFICAR
SELECT * FROM pending_records;
```

### 4. Executar l'Script

1. Fes clic al botó **"Run"** (a la part inferior dreta)
2. O prem **Ctrl + Enter** (Cmd + Enter a Mac)

### 5. Verificar els Resultats

Hauries de veure varies sortides:

#### ✅ Sortides esperades:

1. **Després de DROP TABLE:**
   ```
   Success. No rows returned
   ```

2. **Després de CREATE TABLE:**
   ```
   Success. No rows returned
   ```

3. **Després de CREATE INDEX:**
   ```
   Success. No rows returned
   ```

4. **Després de INSERT:**
   ```
   Success. 1 row inserted
   ```

5. **Després de SELECT final:**
   ```
   Hauríes de veure 1 fila amb:
   - id: un UUID
   - client_name: Test Client
   - appointment_id: test-123
   - appointment_date: data de demà
   - created_at: data i hora actual
   - is_completed: false
   ```

### 6. Verificar a Table Editor

1. Ves a **Table Editor** al menú lateral
2. Busca la taula **pending_records**
3. Hauries de veure el registre de prova

### 7. (Opcional) Eliminar el Registre de Prova

Si vols eliminar el registre de prova:

```sql
DELETE FROM pending_records WHERE client_name = 'Test Client';
```

## 🧪 Provar l'API

Ara que la taula està creada, prova l'API:

### Des de la terminal (en local):

```bash
cd c:\Users\xavie\Downloads\fisiodbfiches
node test-api.js
```

Hauries de veure:
```
✅ Success! Status: 201
📦 Response: { success: true, record: {...} }
```

### Des de Fisioactiva:

1. Espera que Railway faci redeploy (ja hauria d'estar fet)
2. Crea una cita a Fisioactiva (producció)
3. Mira els logs de Railway → busca 🔔
4. Hauries de veure: `✅ [NOTIFICATION] Notification sent successfully!`
5. Verifica a Fisiodbfiches que apareix la notificació
6. Verifica a Supabase que s'ha creat el registre

## ❓ Troubleshooting

### Error: "permission denied for table pending_records"

**Causa:** Les polítiques RLS no estan ben configurades.

**Solució:** Executa només aquesta part de l'script:

```sql
ALTER TABLE pending_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert access for all users" ON pending_records;
DROP POLICY IF EXISTS "Enable read access for all users" ON pending_records;

CREATE POLICY "Enable read access for all users" 
ON pending_records FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON pending_records FOR INSERT 
WITH CHECK (true);
```

### Error: "relation pending_records does not exist"

**Causa:** La taula no s'ha creat correctament.

**Solució:** Executa només la part de CREATE TABLE:

```sql
CREATE TABLE pending_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  appointment_id TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE
);
```

### La taula existeix però no es poden inserir dades

**Solució:** Comprova les polítiques:

```sql
-- Veure les polítiques actuals
SELECT * FROM pg_policies WHERE tablename = 'pending_records';

-- Si no n'hi ha, crear-les
CREATE POLICY "Enable all" ON pending_records FOR ALL USING (true) WITH CHECK (true);
```

## ✅ Checklist Final

Després d'executar l'script, verifica:

- [ ] La taula `pending_records` apareix a Table Editor
- [ ] Té 6 columnes: id, client_name, appointment_id, appointment_date, created_at, is_completed
- [ ] El registre de prova s'ha inserit correctament
- [ ] `node test-api.js` funciona (status 201)
- [ ] Al crear una cita a Fisioactiva, apareix als logs: `✅ [NOTIFICATION] Notification sent successfully!`
- [ ] La notificació apareix a Fisiodbfiches
- [ ] El registre apareix a Supabase → pending_records

Si tots els checkboxes estan marcats, **la integració funciona correctament! ✅**

## 📝 Notes

- Aquest script és **segur d'executar múltiples vegades**
- Si ja hi ha dades, es perdran (per això primer fem DROP TABLE)
- Les polítiques RLS permeten accés total (per desenvolupament)
- En producció, pots restringir més les polítiques si cal

