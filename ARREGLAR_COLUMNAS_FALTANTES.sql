-- ============================================
-- ARREGLAR COLUMNAS FALTANTES
-- Si recibes error sobre columnas que no existen, ejecuta esto
-- ============================================

-- Verificar si la tabla existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'products') THEN
        RAISE EXCEPTION 'La tabla products no existe. Ejecuta SETUP_COMPLETO_DATABASE.sql primero';
    END IF;
END $$;

-- Agregar columnas si no existen (forzado)
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

-- Actualizar valores existentes
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

-- Verificar que se crearon correctamente
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

