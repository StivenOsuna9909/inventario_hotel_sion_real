-- ============================================
-- VERIFICAR Y CREAR FUNCIONES SI NO EXISTEN
-- ============================================

-- Verificar si las funciones existen
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('record_sale', 'set_initial_quantity');

-- Si no aparecen, ejecuta SOLUCION_NUEVA_SIMPLE.sql completo

-- Verificar que la columna shift_data existe
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'products'
AND column_name = 'shift_data';

