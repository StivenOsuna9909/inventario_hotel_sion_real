-- ============================================
-- MIGRACIONES PARA LOVABLE CLOUD
-- Copia y pega todo este contenido en el SQL Editor
-- ============================================

-- MIGRACIÓN 1: Campos de Inventario Inicial
-- Agrega campos para rastrear inventario al inicio del turno

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS initial_quantity INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sold_quantity INTEGER NOT NULL DEFAULT 0;

-- Actualiza productos existentes para compatibilidad
UPDATE public.products
SET initial_quantity = quantity,
    sold_quantity = 0
WHERE initial_quantity = 0 AND sold_quantity = 0;

-- MIGRACIÓN 2: Campos de Tipo de Venta
-- Agrega campos para distinguir ventas al contado vs crédito

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sold_quantity_cash INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sold_quantity_credit INTEGER NOT NULL DEFAULT 0;

-- Migra ventas existentes a contado para compatibilidad
UPDATE public.products
SET sold_quantity_cash = sold_quantity
WHERE sold_quantity_cash = 0 AND sold_quantity > 0;

-- ============================================
-- VERIFICACIÓN (Opcional - ejecuta para verificar)
-- ============================================
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' 
-- AND column_name IN ('initial_quantity', 'sold_quantity', 'sold_quantity_cash', 'sold_quantity_credit');

