-- ============================================
-- ELIMINAR TURNO DE PRUEBA DE HOY
-- Usuario: 26bb2842-b32c-4fe2-9f5e-95c612a9ad35
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- PASO 1: Ver los turnos de hoy de este usuario (para verificar cuál eliminar)
SELECT 
  id,
  shift_date,
  total_initial_quantity,
  total_sold_cash,
  total_sold_credit,
  total_sold,
  total_sold_value,
  created_at,
  '⚠️ ESTE TURNO SERÁ ELIMINADO' as advertencia
FROM public.shifts
WHERE user_id = '26bb2842-b32c-4fe2-9f5e-95c612a9ad35'
  AND DATE(shift_date) = CURRENT_DATE
ORDER BY shift_date DESC;

-- PASO 2: ELIMINAR el turno más reciente de hoy
-- (Comenta esta sección si quieres eliminarlo manualmente por ID)
DELETE FROM public.shifts
WHERE user_id = '26bb2842-b32c-4fe2-9f5e-95c612a9ad35'
  AND DATE(shift_date) = CURRENT_DATE
  AND id = (
    SELECT id 
    FROM public.shifts
    WHERE user_id = '26bb2842-b32c-4fe2-9f5e-95c612a9ad35'
      AND DATE(shift_date) = CURRENT_DATE
    ORDER BY shift_date DESC
    LIMIT 1
  );

-- PASO 3: Verificar que se eliminó correctamente
SELECT 
  COUNT(*) as turnos_restantes_hoy
FROM public.shifts
WHERE user_id = '26bb2842-b32c-4fe2-9f5e-95c612a9ad35'
  AND DATE(shift_date) = CURRENT_DATE;

-- ============================================
-- OPCIÓN ALTERNATIVA: Eliminar TODOS los turnos de hoy
-- Descomenta las siguientes líneas si quieres eliminar TODOS los turnos de hoy
-- ============================================
-- DELETE FROM public.shifts
-- WHERE user_id = '26bb2842-b32c-4fe2-9f5e-95c612a9ad35'
--   AND DATE(shift_date) = CURRENT_DATE;

-- ============================================
-- OPCIÓN ALTERNATIVA: Eliminar por ID específico
-- Si sabes el ID exacto del turno, usa esto:
-- ============================================
-- DELETE FROM public.shifts
-- WHERE id = 'AQUI_VA_EL_ID_DEL_TURNO';


