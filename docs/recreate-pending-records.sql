-- ========================================
-- SCRIPT PARA RECREAR LA TABLA pending_records
-- Ejecutar en Supabase SQL Editor
-- ========================================

-- 1. ELIMINAR TODO LO EXISTENTE
-- ========================================

-- Primero eliminar las políticas RLS si existen
DROP POLICY IF EXISTS "Enable all access for all users" ON pending_records;
DROP POLICY IF EXISTS "Enable read access for all users" ON pending_records;
DROP POLICY IF EXISTS "Enable insert access for all users" ON pending_records;
DROP POLICY IF EXISTS "Enable update access for all users" ON pending_records;
DROP POLICY IF EXISTS "Enable delete access for all users" ON pending_records;

-- Eliminar los índices si existen
DROP INDEX IF EXISTS idx_pending_records_is_completed;
DROP INDEX IF EXISTS idx_pending_records_appointment_date;
DROP INDEX IF EXISTS idx_pending_records_created_at;

-- Eliminar la tabla completamente
DROP TABLE IF EXISTS pending_records CASCADE;

-- 2. CREAR LA TABLA NUEVA
-- ========================================

CREATE TABLE pending_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  appointment_id TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE
);

-- 3. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- ========================================

CREATE INDEX idx_pending_records_is_completed ON pending_records(is_completed);
CREATE INDEX idx_pending_records_appointment_date ON pending_records(appointment_date);
CREATE INDEX idx_pending_records_created_at ON pending_records(created_at);

-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE pending_records ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS DE ACCESO (PERMITIR TODO)
-- ========================================

-- Permitir SELECT (lectura) a todos
CREATE POLICY "Enable read access for all users" 
ON pending_records FOR SELECT 
USING (true);

-- Permitir INSERT (crear) a todos
CREATE POLICY "Enable insert access for all users" 
ON pending_records FOR INSERT 
WITH CHECK (true);

-- Permitir UPDATE (actualizar) a todos
CREATE POLICY "Enable update access for all users" 
ON pending_records FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Permitir DELETE (eliminar) a todos
CREATE POLICY "Enable delete access for all users" 
ON pending_records FOR DELETE 
USING (true);

-- 6. VERIFICAR QUE TODO ESTÁ CORRECTO
-- ========================================

-- Verificar que la tabla existe
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_name = 'pending_records';

-- Verificar las columnas
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pending_records'
ORDER BY ordinal_position;

-- Verificar los índices
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'pending_records';

-- Verificar las políticas RLS
SELECT 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'pending_records';

-- 7. INSERTAR UN REGISTRO DE PRUEBA
-- ========================================

INSERT INTO pending_records (client_name, appointment_id, appointment_date)
VALUES ('Test Client', 'test-123', NOW() + INTERVAL '1 day');

-- Verificar que se insertó
SELECT * FROM pending_records;

-- Si todo funciona correctamente, puedes eliminar el registro de prueba:
-- DELETE FROM pending_records WHERE client_name = 'Test Client';

-- ========================================
-- FIN DEL SCRIPT
-- ========================================

-- ✅ Si ves resultados en todas las queries de verificación, la tabla está creada correctamente
-- ✅ Ahora puedes probar el API desde Fisioactiva

