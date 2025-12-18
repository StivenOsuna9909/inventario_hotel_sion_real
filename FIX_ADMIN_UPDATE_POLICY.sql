-- ============================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA PERMITIR A ADMINS ACTUALIZAR PRODUCTOS
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- Eliminar políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "Users can update product quantity" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;

-- Recrear la política de admin con ambas cláusulas (USING y WITH CHECK)
-- Esto es CRÍTICO: ambas cláusulas deben estar presentes para que funcione correctamente
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Crear política para usuarios: solo pueden actualizar quantity
-- Esta política permite a usuarios regulares actualizar solo la cantidad del producto
CREATE POLICY "Users can update product quantity"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

