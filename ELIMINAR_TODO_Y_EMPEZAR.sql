-- ============================================
-- ELIMINAR TODAS LAS COLUMNAS NUEVAS
-- ============================================

-- Eliminar las columnas problemáticas
ALTER TABLE public.products 
DROP COLUMN IF EXISTS initial_quantity,
DROP COLUMN IF EXISTS sold_quantity,
DROP COLUMN IF EXISTS sold_quantity_cash,
DROP COLUMN IF EXISTS sold_quantity_credit;

-- Eliminar la función si existe
DROP FUNCTION IF EXISTS public.record_product_sale(UUID, INTEGER, TEXT);

-- Verificar que se eliminaron
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products' 
AND column_name IN ('initial_quantity', 'sold_quantity', 'sold_quantity_cash', 'sold_quantity_credit');

-- Si no devuelve filas, significa que se eliminaron correctamente

