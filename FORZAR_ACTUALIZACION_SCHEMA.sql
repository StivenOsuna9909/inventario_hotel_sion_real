-- ============================================
-- FORZAR ACTUALIZACIÓN DEL SCHEMA CACHE
-- Este script verifica y crea las columnas, luego fuerza la actualización
-- ============================================

-- PASO 1: Verificar que la tabla existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'products') THEN
        RAISE EXCEPTION 'La tabla products no existe. Ejecuta SETUP_COMPLETO_DATABASE.sql primero';
    END IF;
END $$;

-- PASO 2: Eliminar columnas si existen (para recrearlas limpiamente)
-- Esto fuerza a PostgREST a refrescar el cache
DO $$
BEGIN
    -- Eliminar columnas si existen
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'initial_quantity'
    ) THEN
        ALTER TABLE public.products DROP COLUMN initial_quantity;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'sold_quantity'
    ) THEN
        ALTER TABLE public.products DROP COLUMN sold_quantity;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'sold_quantity_cash'
    ) THEN
        ALTER TABLE public.products DROP COLUMN sold_quantity_cash;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'sold_quantity_credit'
    ) THEN
        ALTER TABLE public.products DROP COLUMN sold_quantity_credit;
    END IF;
END $$;

-- PASO 3: Crear las columnas nuevamente
ALTER TABLE public.products 
ADD COLUMN initial_quantity INTEGER NOT NULL DEFAULT 0,
ADD COLUMN sold_quantity INTEGER NOT NULL DEFAULT 0,
ADD COLUMN sold_quantity_cash INTEGER NOT NULL DEFAULT 0,
ADD COLUMN sold_quantity_credit INTEGER NOT NULL DEFAULT 0;

-- PASO 4: Actualizar valores existentes
UPDATE public.products
SET 
    initial_quantity = quantity,
    sold_quantity = 0,
    sold_quantity_cash = 0,
    sold_quantity_credit = 0;

-- PASO 5: Notificar a PostgREST que el schema cambió
-- Esto se hace notificando en el canal de PostgREST
NOTIFY pgrst, 'reload schema';

-- PASO 6: Verificar que se crearon correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products' 
AND column_name IN ('initial_quantity', 'sold_quantity', 'sold_quantity_cash', 'sold_quantity_credit')
ORDER BY column_name;

