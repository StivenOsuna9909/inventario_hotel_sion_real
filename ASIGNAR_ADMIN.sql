-- ============================================
-- ASIGNAR ROL DE ADMINISTRADOR A USUARIO
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- Asignar rol de administrador al usuario
INSERT INTO public.user_roles (user_id, role)
VALUES ('691e3d90-5374-4ac3-9671-6627ee1481c0', 'admin')
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';

-- Verificar que se asignó correctamente
SELECT 
  ur.user_id,
  u.email,
  ur.role,
  ur.id as role_id
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id
WHERE ur.user_id = '691e3d90-5374-4ac3-9671-6627ee1481c0';

