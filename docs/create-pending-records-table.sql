-- Crear tabla pending_records en Supabase
-- Ejecuta este SQL en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS pending_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  appointment_id TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_pending_records_is_completed ON pending_records(is_completed);
CREATE INDEX IF NOT EXISTS idx_pending_records_appointment_date ON pending_records(appointment_date);
CREATE INDEX IF NOT EXISTS idx_pending_records_created_at ON pending_records(created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE pending_records ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados y anónimos
CREATE POLICY "Enable read access for all users" ON pending_records
  FOR SELECT
  USING (true);

-- Política para permitir inserción a todos los usuarios
CREATE POLICY "Enable insert access for all users" ON pending_records
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir actualización a todos los usuarios
CREATE POLICY "Enable update access for all users" ON pending_records
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política para permitir borrado a todos los usuarios
CREATE POLICY "Enable delete access for all users" ON pending_records
  FOR DELETE
  USING (true);

-- Verificar que la tabla se creó correctamente
SELECT * FROM pending_records LIMIT 1;

