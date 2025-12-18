-- ============================================
-- SOLUCIÓN NUEVA Y SIMPLE
-- Usa JSONB para almacenar datos de turno (evita problemas de cache)
-- ============================================

-- Agregar columna JSONB para datos de turno
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS shift_data JSONB DEFAULT '{"initialQuantity": 0, "soldCash": 0, "soldCredit": 0}'::jsonb;

-- Actualizar productos existentes
UPDATE public.products
SET shift_data = jsonb_build_object(
    'initialQuantity', quantity,
    'soldCash', 0,
    'soldCredit', 0
)
WHERE shift_data IS NULL OR shift_data = '{}'::jsonb;

-- Crear función simple para registrar ventas
CREATE OR REPLACE FUNCTION public.record_sale(
    product_id UUID,
    sale_quantity INTEGER,
    sale_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_data JSONB;
    initial_qty INTEGER;
    sold_cash INTEGER;
    sold_credit INTEGER;
    new_available INTEGER;
BEGIN
    -- Obtener datos actuales
    SELECT shift_data INTO current_data
    FROM public.products
    WHERE id = product_id;
    
    IF current_data IS NULL THEN
        RETURN json_build_object('error', 'Product not found');
    END IF;
    
    -- Extraer valores
    initial_qty := COALESCE((current_data->>'initialQuantity')::INTEGER, 0);
    sold_cash := COALESCE((current_data->>'soldCash')::INTEGER, 0);
    sold_credit := COALESCE((current_data->>'soldCredit')::INTEGER, 0);
    
    -- Actualizar según tipo de venta
    IF sale_type = 'cash' THEN
        sold_cash := sold_cash + sale_quantity;
    ELSE
        sold_credit := sold_credit + sale_quantity;
    END IF;
    
    -- Calcular disponible
    new_available := GREATEST(0, initial_qty - sold_cash - sold_credit);
    
    -- Actualizar producto
    UPDATE public.products
    SET 
        shift_data = jsonb_build_object(
            'initialQuantity', initial_qty,
            'soldCash', sold_cash,
            'soldCredit', sold_credit
        ),
        quantity = new_available
    WHERE id = product_id;
    
    RETURN json_build_object('success', true, 'available', new_available);
END;
$$;

-- Dar permisos
GRANT EXECUTE ON FUNCTION public.record_sale(UUID, INTEGER, TEXT) TO authenticated;

-- Función para establecer cantidad inicial
CREATE OR REPLACE FUNCTION public.set_initial_quantity(
    product_id UUID,
    initial_qty INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.products
    SET 
        shift_data = jsonb_build_object(
            'initialQuantity', initial_qty,
            'soldCash', 0,
            'soldCredit', 0
        ),
        quantity = initial_qty
    WHERE id = product_id;
    
    RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_initial_quantity(UUID, INTEGER) TO authenticated;

