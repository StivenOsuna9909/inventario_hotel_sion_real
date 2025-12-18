-- ============================================
-- AGREGAR COLUMNA COST (COSTO) A PRODUCTS
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- Agregar columna cost si no existe
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2) DEFAULT NULL;

-- Comentario en la columna
COMMENT ON COLUMN public.products.cost IS 'Costo del producto para calcular el margen de ganancia';

-- Actualizar productos existentes (opcional: establecer costo a 0 si no tiene)
-- UPDATE public.products SET cost = 0 WHERE cost IS NULL;

-- Notificar a PostgREST para actualizar el schema cache
NOTIFY pgrst, 'reload schema';

