-- ============================================
-- SOLUCIÓN AGRESIVA - ELIMINAR Y RECREAR TODO
-- ============================================

-- PASO 1: Eliminar las columnas completamente
ALTER TABLE public.products 
DROP COLUMN IF EXISTS initial_quantity,
DROP COLUMN IF EXISTS sold_quantity,
DROP COLUMN IF EXISTS sold_quantity_cash,
DROP COLUMN IF EXISTS sold_quantity_credit;

-- PASO 2: Esperar un momento (forzar commit)
DO $$ BEGIN END $$;

-- PASO 3: Crear las columnas nuevamente
ALTER TABLE public.products 
ADD COLUMN initial_quantity INTEGER NOT NULL DEFAULT 0,
ADD COLUMN sold_quantity INTEGER NOT NULL DEFAULT 0,
ADD COLUMN sold_quantity_cash INTEGER NOT NULL DEFAULT 0,
ADD COLUMN sold_quantity_credit INTEGER NOT NULL DEFAULT 0;

-- PASO 4: Actualizar valores
UPDATE public.products
SET 
    initial_quantity = quantity,
    sold_quantity = 0,
    sold_quantity_cash = 0,
    sold_quantity_credit = 0;

-- PASO 5: Crear función SQL para registrar ventas (evita el problema del cache)
CREATE OR REPLACE FUNCTION public.record_product_sale(
    p_product_id UUID,
    p_quantity INTEGER,
    p_sale_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_cash INTEGER;
    v_current_credit INTEGER;
    v_initial_qty INTEGER;
    v_new_cash INTEGER;
    v_new_credit INTEGER;
    v_new_sold INTEGER;
    v_available INTEGER;
BEGIN
    -- Obtener valores actuales
    SELECT 
        COALESCE(initial_quantity, 0),
        COALESCE(sold_quantity_cash, 0),
        COALESCE(sold_quantity_credit, 0)
    INTO v_initial_qty, v_current_cash, v_current_credit
    FROM public.products
    WHERE id = p_product_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Product not found');
    END IF;
    
    -- Calcular nuevos valores
    IF p_sale_type = 'cash' THEN
        v_new_cash := v_current_cash + p_quantity;
        v_new_credit := v_current_credit;
    ELSE
        v_new_cash := v_current_cash;
        v_new_credit := v_current_credit + p_quantity;
    END IF;
    
    v_new_sold := v_new_cash + v_new_credit;
    v_available := GREATEST(0, v_initial_qty - v_new_sold);
    
    -- Actualizar el producto
    UPDATE public.products
    SET 
        sold_quantity = v_new_sold,
        sold_quantity_cash = v_new_cash,
        sold_quantity_credit = v_new_credit,
        quantity = v_available
    WHERE id = p_product_id;
    
    RETURN json_build_object(
        'success', true,
        'available_quantity', v_available,
        'sold_cash', v_new_cash,
        'sold_credit', v_new_credit
    );
END;
$$;

-- PASO 6: Dar permisos a la función
GRANT EXECUTE ON FUNCTION public.record_product_sale(UUID, INTEGER, TEXT) TO authenticated;

-- PASO 7: Forzar recarga del schema
NOTIFY pgrst, 'reload schema';

-- PASO 8: Verificar
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products' 
AND column_name IN ('initial_quantity', 'sold_quantity', 'sold_quantity_cash', 'sold_quantity_credit')
ORDER BY column_name;

