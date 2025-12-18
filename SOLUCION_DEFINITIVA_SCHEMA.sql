-- ============================================
-- SOLUCIÓN DEFINITIVA PARA EL ERROR DE SCHEMA CACHE
-- Este script fuerza la actualización del schema cache de PostgREST
-- ============================================

-- PASO 1: Verificar y crear las columnas si no existen
DO $$
BEGIN
    -- Agregar initial_quantity
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'initial_quantity'
    ) THEN
        ALTER TABLE public.products ADD COLUMN initial_quantity INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Agregar sold_quantity
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'sold_quantity'
    ) THEN
        ALTER TABLE public.products ADD COLUMN sold_quantity INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Agregar sold_quantity_cash
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'sold_quantity_cash'
    ) THEN
        ALTER TABLE public.products ADD COLUMN sold_quantity_cash INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Agregar sold_quantity_credit
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'sold_quantity_credit'
    ) THEN
        ALTER TABLE public.products ADD COLUMN sold_quantity_credit INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- PASO 2: Actualizar valores existentes
UPDATE public.products
SET 
    initial_quantity = COALESCE(initial_quantity, quantity, 0),
    sold_quantity = COALESCE(sold_quantity, 0),
    sold_quantity_cash = COALESCE(sold_quantity_cash, 0),
    sold_quantity_credit = COALESCE(sold_quantity_credit, 0)
WHERE initial_quantity IS NULL 
   OR sold_quantity IS NULL 
   OR sold_quantity_cash IS NULL 
   OR sold_quantity_credit IS NULL;

-- PASO 3: Forzar actualización del schema cache de PostgREST
-- Esto notifica a PostgREST que debe recargar el schema
NOTIFY pgrst, 'reload schema';

-- PASO 4: Verificar que las columnas existen
SELECT 
    'Columnas creadas correctamente' as status,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products' 
AND column_name IN ('initial_quantity', 'sold_quantity', 'sold_quantity_cash', 'sold_quantity_credit')
ORDER BY column_name;

-- ============================================
-- IMPORTANTE: Después de ejecutar este script
-- ============================================
-- 1. ESPERA 30-60 SEGUNDOS para que PostgREST actualice su cache
-- 2. Ve a Supabase Dashboard > Settings > API
-- 3. Busca "Reload Schema" o "Refresh Schema" y haz clic
-- 4. O simplemente espera 2-3 minutos
-- 5. Reinicia tu aplicación (detén y vuelve a iniciar npm run dev)
-- 6. Recarga la página en el navegador (Ctrl+F5)

