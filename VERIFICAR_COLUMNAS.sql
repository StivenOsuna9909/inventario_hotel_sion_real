-- ============================================
-- VERIFICAR QUE LAS COLUMNAS EXISTAN
-- Ejecuta esto primero para ver qué columnas tiene la tabla products
-- ============================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Si no ves las columnas initial_quantity, sold_quantity, sold_quantity_cash, sold_quantity_credit
-- entonces necesitas ejecutar SETUP_COMPLETO_DATABASE.sql

