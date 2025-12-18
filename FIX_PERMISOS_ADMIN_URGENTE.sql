-- ============================================
-- CORRECCIÓN URGENTE DE PERMISOS PARA ADMIN
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- PASO 1: Eliminar TODAS las políticas de UPDATE existentes
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Users can update product quantity" ON public.products;

-- PASO 2: Recrear la política de admin CON AMBAS CLAUSULAS (USING y WITH CHECK)
-- ESTO ES CRÍTICO - Sin WITH CHECK, las actualizaciones fallan
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PASO 3: Recrear la política para usuarios (solo quantity)
CREATE POLICY "Users can update product quantity"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- PASO 4: Verificar que tu usuario tiene rol de admin
-- Reemplaza 'TU_USER_ID_AQUI' con tu UUID de usuario
-- Para obtener tu UUID: Ve a Authentication > Users en Supabase y copia el ID

-- Primero, veamos todos los usuarios y sus roles:
SELECT 
  ur.user_id,
  u.email,
  ur.role
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.role, u.email;

-- Si no ves tu usuario como admin, ejecuta esto (reemplaza TU_USER_ID_AQUI):
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('TU_USER_ID_AQUI', 'admin')
-- ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';

-- PASO 5: Verificar que la función has_role funciona correctamente
-- Ejecuta esto para verificar si tu usuario tiene rol admin:
-- SELECT public.has_role(auth.uid(), 'admin'::app_role);
-- Debería retornar 'true' si eres admin

-- ============================================
-- DIAGNÓSTICO
-- ============================================
-- Si después de ejecutar esto sigue sin funcionar, ejecuta estos queries
-- para diagnosticar:

-- 1. Verificar tu user_id actual (ejecuta esto cuando estés autenticado):
-- SELECT auth.uid() as mi_user_id;

-- 2. Verificar si tienes rol admin con ese user_id:
-- SELECT 
--   user_id,
--   role,
--   (user_id = auth.uid()) as es_mi_usuario
-- FROM public.user_roles
-- WHERE user_id = auth.uid();

-- 3. Probar la función has_role directamente:
-- SELECT public.has_role(auth.uid(), 'admin'::app_role) as tengo_rol_admin;

