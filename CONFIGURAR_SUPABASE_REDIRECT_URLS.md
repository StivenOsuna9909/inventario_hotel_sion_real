# Configurar Redirect URLs en Supabase

## ⚠️ Problema

Los emails de confirmación están redirigiendo a `localhost:3000` en lugar de `https://inventario-hotel-sion-real.vercel.app/`

## ✅ Solución

Necesitas configurar las Redirect URLs permitidas en Supabase:

### Pasos:

1. **Ve al Dashboard de Supabase**
   - Accede a: https://app.supabase.com
   - Selecciona tu proyecto

2. **Ve a Authentication → URL Configuration**
   - En el menú lateral, busca **Authentication**
   - Ve a la sección **URL Configuration**

3. **Agrega las Redirect URLs permitidas**
   
   En el campo **Redirect URLs**, agrega:
   ```
   https://inventario-hotel-sion-real.vercel.app/**
   https://inventario-hotel-sion-real.vercel.app
   ```
   
   También puedes mantener localhost para desarrollo (opcional):
   ```
   http://localhost:3000/**
   http://localhost:3000
   ```

4. **Guarda los cambios**
   - Haz clic en **Save** o **Update**

5. **Verifica Site URL**
   - Asegúrate de que el campo **Site URL** tenga:
   ```
   https://inventario-hotel-sion-real.vercel.app
   ```

## 📝 Notas Importantes

- Los cambios pueden tardar unos minutos en aplicarse
- Después de configurar, los nuevos emails de confirmación usarán el dominio correcto
- El código ya está configurado para usar `https://inventario-hotel-sion-real.vercel.app/` en el `emailRedirectTo`

## 🔍 Ubicación Exacta en Supabase

```
Dashboard → Tu Proyecto → Authentication (menú lateral) → URL Configuration
```

O directamente:
```
https://app.supabase.com/project/[TU_PROJECT_ID]/auth/url-configuration
```

