-- ============================================
-- AGREGAR COLUMNAS DE DINERO A LA TABLA SHIFTS
-- Ejecuta este script en el SQL Editor de Supabase
-- si ya creaste la tabla shifts anteriormente
-- ============================================

-- Agregar columnas de dinero si no existen
ALTER TABLE public.shifts
ADD COLUMN IF NOT EXISTS total_sold_value_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sold_value_credit DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sold_value DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Actualizar valores existentes a 0 si son NULL (aunque tienen DEFAULT, por seguridad)
UPDATE public.shifts
SET 
  total_sold_value_cash = COALESCE(total_sold_value_cash, 0),
  total_sold_value_credit = COALESCE(total_sold_value_credit, 0),
  total_sold_value = COALESCE(total_sold_value, 0)
WHERE 
  total_sold_value_cash IS NULL 
  OR total_sold_value_credit IS NULL 
  OR total_sold_value IS NULL;

