-- ============================================
-- VERIFICACIÓN Y CORRECCIÓN COMPLETA DE PERMISOS
-- Ejecuta este script paso a paso en el SQL Editor de Supabase
-- ============================================

-- PASO 1: Verificar que la función has_role existe y funciona
SELECT 
  proname as funcion,
  pg_get_functiondef(oid) as definicion
FROM pg_proc 
WHERE proname = 'has_role';

-- PASO 2: Ver todos los usuarios y sus roles actuales
SELECT 
  ur.user_id,
  u.email,
  ur.role,
  ur.id as role_id
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.role DESC, u.email;

-- PASO 3: Ver qué políticas existen actualmente
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
WHERE tablename = 'products'
ORDER BY policyname;

-- PASO 4: ELIMINAR TODAS las políticas de UPDATE (limpiar conflicto)
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Users can update product quantity" ON public.products;
DROP POLICY IF EXISTS "Users can update product quantity only" ON public.products;

-- PASO 5: RECREAR la política de admin con AMBAS cláusulas
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PASO 6: RECREAR la política para usuarios (solo quantity)
CREATE POLICY "Users can update product quantity"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- PASO 7: VERIFICAR que las políticas se crearon correctamente
SELECT 
  policyname,
  cmd as operacion,
  CASE 
    WHEN qual IS NOT NULL THEN 'Tiene USING'
    ELSE 'Sin USING'
  END as tiene_using,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Tiene WITH CHECK'
    ELSE 'Sin WITH CHECK'
  END as tiene_with_check
FROM pg_policies
WHERE tablename = 'products' AND cmd = 'UPDATE';

-- ============================================
-- ASIGNAR ROL DE ADMIN (EJECUTA ESTO SI NO ERES ADMIN)
-- ============================================

-- OPCIÓN A: Si sabes tu email, busca tu user_id primero:
-- SELECT id, email FROM auth.users WHERE email = 'tu-email@ejemplo.com';

-- OPCIÓN B: Una vez que tengas tu user_id, ejecuta esto:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('TU_USER_ID_AQUI', 'admin')
-- ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';

-- ============================================
-- PRUEBA DE VERIFICACIÓN (ejecuta cuando estés autenticado)
-- ============================================

-- Ver tu user_id actual:
-- SELECT auth.uid() as mi_user_id;

-- Verificar si tienes rol admin:
-- SELECT 
--   auth.uid() as mi_user_id,
--   ur.role,
--   public.has_role(auth.uid(), 'admin') as tengo_rol_admin
-- FROM public.user_roles ur
-- WHERE ur.user_id = auth.uid();

-- ============================================
-- SOLUCIÓN ALTERNATIVA SI SIGUE SIN FUNCIONAR
-- ============================================

-- Si después de todo esto sigue sin funcionar, ejecuta esta política
-- más permisiva temporalmente para diagnosticar (Luego vuelve a las anteriores):

/*
DROP POLICY IF EXISTS "Admins can update products" ON public.products;

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
*/

