# 🚨 Solución Inmediata para Error de Permisos

## El Problema

Estás viendo el error "No tienes permisos para realizar esta acción" cuando intentas editar precios como administrador.

## Solución Rápida (3 Pasos)

### Paso 1: Ejecutar Script de Corrección

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Abre el archivo `VERIFICAR_Y_CORREGIR_PERMISOS.sql`
5. **Copia y ejecuta TODO el script**
6. Verifica que no haya errores

### Paso 2: Verificar que Eres Admin

En el SQL Editor, ejecuta esto para ver todos los usuarios y sus roles:

```sql
SELECT 
  ur.user_id,
  u.email,
  ur.role
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.role DESC, u.email;
```

**Si no ves tu email con rol 'admin':**

1. En Supabase Dashboard, ve a **Authentication > Users**
2. Encuentra tu usuario y **copia el UUID** (es un ID largo como `123e4567-e89b-12d3-a456-426614174000`)
3. Ejecuta esto en SQL Editor (reemplaza `TU_USER_ID_AQUI` con tu UUID):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('TU_USER_ID_AQUI', 'admin')
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
```

### Paso 3: Reiniciar la Aplicación

1. **Cierra completamente el navegador** (o cierra todas las pestañas de la app)
2. **Abre de nuevo la aplicación**
3. **Inicia sesión de nuevo**
4. Intenta editar un precio

## Verificación

Para verificar que todo está bien, en el SQL Editor ejecuta:

```sql
SELECT 
  policyname,
  cmd as operacion,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ Tiene WITH CHECK'
    ELSE '❌ Sin WITH CHECK'
  END as estado
FROM pg_policies
WHERE tablename = 'products' AND cmd = 'UPDATE';
```

Deberías ver que "Admins can update products" tiene **✅ Tiene WITH CHECK**

## Si Sigue Sin Funcionar

1. **Abre la consola del navegador** (F12)
2. **Ve a la pestaña Console**
3. Intenta editar un precio
4. **Copia el error completo** que aparece en la consola
5. Verifica que el error tenga más detalles ahora

El código ahora muestra más información sobre el error real.

## Archivos Importantes

- `VERIFICAR_Y_CORREGIR_PERMISOS.sql` - Script completo de corrección
- `FIX_PERMISOS_ADMIN_URGENTE.sql` - Script rápido de corrección

