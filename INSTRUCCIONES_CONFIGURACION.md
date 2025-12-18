# 📋 Instrucciones de Configuración Completa

## ✅ Paso 1: Configurar Variables de Entorno

1. **Crea el archivo `.env.local`** en la raíz del proyecto (junto a `package.json`)

2. **Copia este contenido exacto** en el archivo `.env.local`:

```env
VITE_SUPABASE_URL=https://yfhmwcbsordywvoyasot.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaG13Y2Jzb3JkeXd2b3lhc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTI3MjYsImV4cCI6MjA4MDk2ODcyNn0.jQe-lM4v9Q0ium-pSeJnFcypdvKEfxi2feCHZDl5IRA
```

3. **Guarda el archivo**

## ✅ Paso 2: Configurar la Base de Datos

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto (yfhmwcbsordywvoyasot)
3. Ve a **SQL Editor** en el menú lateral
4. Abre el archivo `SETUP_COMPLETA_BASE_DATOS.sql` que está en la raíz del proyecto
5. **Copia TODO el contenido** del archivo
6. Pégalo en el SQL Editor de Supabase
7. Haz clic en **Run** o presiona **Ctrl+Enter**
8. Deberías ver un mensaje de éxito ✅

## ✅ Paso 3: Crear Usuario Administrador

Después de ejecutar el script SQL:

1. En Supabase Dashboard, ve a **Authentication > Users**
2. Crea un nuevo usuario o encuentra tu usuario existente
3. **Copia el UUID** del usuario (es un identificador largo)
4. Ve al **SQL Editor** nuevamente
5. Ejecuta este SQL (reemplaza `TU_USER_ID_AQUI` con el UUID que copiaste):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('TU_USER_ID_AQUI', 'admin')
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
```

**Ejemplo:**
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'admin')
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
```

## ✅ Paso 4: Reiniciar el Servidor

Si tienes el servidor corriendo:

1. **Detén el servidor** (Ctrl+C en la terminal)
2. **Inicia el servidor de nuevo**:
   ```bash
   npm run dev
   ```

## ✅ Paso 5: Verificar que Funcionó

1. Abre la aplicación en el navegador
2. Inicia sesión con tu usuario administrador
3. Deberías ver el badge "Admin" en la interfaz
4. Deberías poder agregar, editar y eliminar productos
5. Deberías poder modificar precios sin problemas

## 🔧 Solución de Problemas

### Si ves errores de permisos al editar productos:

Ejecuta este script en el SQL Editor de Supabase (está en `FIX_ADMIN_UPDATE_POLICY.sql`):

```sql
DROP POLICY IF EXISTS "Users can update product quantity" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update product quantity"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

## 📝 Credenciales del Proyecto

- **URL del Proyecto**: https://yfhmwcbsordywvoyasot.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaG13Y2Jzb3JkeXd2b3lhc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTI3MjYsImV4cCI6MjA4MDk2ODcyNn0.jQe-lM4v9Q0ium-pSeJnFcypdvKEfxi2feCHZDl5IRA
- **Service Role Key**: (solo para uso en backend, no exponer en frontend)

---

✅ **Una vez completados todos los pasos, la aplicación debería estar completamente funcional.**

