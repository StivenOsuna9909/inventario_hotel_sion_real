-- ============================================
-- VERIFICAR Y CORREGIR PROBLEMAS CON TURNOS
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- PASO 1: Verificar si el usuario existe en profiles
-- Reemplaza '26bb2842-b32c-4fe2-9f5e-95c612a9ad35' con el ID del usuario si es diferente
DO $$
DECLARE
  user_id_to_check UUID := '26bb2842-b32c-4fe2-9f5e-95c612a9ad35';
  profile_exists BOOLEAN;
  user_email TEXT;
BEGIN
  -- Verificar si existe el perfil
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id_to_check) INTO profile_exists;
  
  -- Obtener email del usuario desde auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_id_to_check;
  
  -- Si no existe el perfil, crearlo
  IF NOT profile_exists THEN
    INSERT INTO public.profiles (id, email, created_at)
    VALUES (user_id_to_check, COALESCE(user_email, 'sin-email@ejemplo.com'), now())
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Perfil creado para el usuario: %', user_id_to_check;
  ELSE
    RAISE NOTICE 'El perfil ya existe para el usuario: %', user_id_to_check;
  END IF;
  
  -- Verificar si existe un rol asignado
  IF NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = user_id_to_check) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id_to_check, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Rol de usuario asignado';
  END IF;
END $$;

-- PASO 2: Verificar turnos del usuario
SELECT 
  id,
  user_id,
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
ORDER BY shift_date DESC;

-- PASO 3: Verificar las políticas RLS de la tabla shifts
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'shifts'
ORDER BY policyname;

-- PASO 4: Verificar que la función has_role funcione correctamente
SELECT 
  public.has_role('26bb2842-b32c-4fe2-9f5e-95c612a9ad35', 'admin') as es_admin,
  public.has_role('26bb2842-b32c-4fe2-9f5e-95c612a9ad35', 'user') as es_user;

-- PASO 5: Verificar perfil y rol del usuario
SELECT 
  p.id,
  p.email,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.id = '26bb2842-b32c-4fe2-9f5e-95c612a9ad35';

