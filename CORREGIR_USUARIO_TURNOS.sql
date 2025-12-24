-- ============================================
-- CORREGIR USUARIO ESPECÍFICO PARA TURNOS
-- Usuario: 26bb2842-b32c-4fe2-9f5e-95c612a9ad35
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- PASO 1: Asegurar que el usuario existe en auth.users
-- (Este paso solo muestra información, no hace cambios)

SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE id = '26bb2842-b32c-4fe2-9f5e-95c612a9ad35';

-- PASO 2: Crear o actualizar el perfil del usuario
-- Si no existe el perfil, se crea. Si existe, se actualiza el email si es necesario.

INSERT INTO public.profiles (id, email, created_at)
SELECT 
  id,
  email,
  COALESCE(created_at, now())
FROM auth.users
WHERE id = '26bb2842-b32c-4fe2-9f5e-95c612a9ad35'
ON CONFLICT (id) 
DO UPDATE SET 
  email = COALESCE(EXCLUDED.email, profiles.email);

-- PASO 3: Asegurar que el usuario tenga un rol asignado
-- Si no tiene rol, se asigna 'user' por defecto

INSERT INTO public.user_roles (user_id, role)
VALUES ('26bb2842-b32c-4fe2-9f5e-95c612a9ad35', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- PASO 4: Verificar que el perfil se creó correctamente
SELECT 
  p.id,
  p.email,
  p.created_at,
  ur.role,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO EXISTE PERFIL'
    WHEN ur.user_id IS NULL THEN '⚠️ PERFIL SIN ROL'
    ELSE '✅ TODO CORRECTO'
  END as estado
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id AND ur.role = 'user'
WHERE p.id = '26bb2842-b32c-4fe2-9f5e-95c612a9ad35';

-- PASO 5: Verificar turnos existentes del usuario
SELECT 
  COUNT(*) as total_turnos,
  MIN(shift_date) as primer_turno,
  MAX(shift_date) as ultimo_turno
FROM public.shifts
WHERE user_id = '26bb2842-b32c-4fe2-9f5e-95c612a9ad35';

-- PASO 6: Ver todos los turnos del usuario (últimos 10)
SELECT 
  id,
  shift_date,
  total_initial_quantity,
  total_sold_cash,
  total_sold_credit,
  total_sold,
  total_sold_value_cash,
  total_sold_value_credit,
  total_sold_value,
  created_at
FROM public.shifts
WHERE user_id = '26bb2842-b32c-4fe2-9f5e-95c612a9ad35'
ORDER BY shift_date DESC
LIMIT 10;

-- PASO 7: Verificar políticas RLS para shifts
SELECT 
  policyname,
  cmd as operacion,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Lectura'
    WHEN cmd = 'INSERT' THEN 'Inserción'
    WHEN cmd = 'UPDATE' THEN 'Actualización'
    WHEN cmd = 'DELETE' THEN 'Eliminación'
    ELSE cmd
  END as descripcion,
  qual as condicion_usando,
  with_check as condicion_con_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'shifts'
ORDER BY cmd, policyname;

-- PASO 8: Probar que la función has_role funciona para este usuario
SELECT 
  '26bb2842-b32c-4fe2-9f5e-95c612a9ad35' as user_id,
  public.has_role('26bb2842-b32c-4fe2-9f5e-95c612a9ad35', 'admin') as es_admin,
  public.has_role('26bb2842-b32c-4fe2-9f5e-95c612a9ad35', 'user') as es_user;

