# 🔧 SOLUCIÓN DEFINITIVA: Correo con localhost

## ⚠️ El Problema

Los emails de confirmación están usando `http://localhost:3000` en lugar de `https://inventario-hotel-sion-real.vercel.app/`

## ✅ SOLUCIÓN PASO A PASO (OBLIGATORIO)

### Paso 1: Configurar Site URL en Supabase

1. Ve a: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a: **Authentication** (menú lateral izquierdo)
4. Haz clic en: **URL Configuration**
5. **MUY IMPORTANTE**: En el campo **Site URL**, cambia:
   - ❌ DE: `http://localhost:3000` 
   - ✅ A: `https://inventario-hotel-sion-real.vercel.app`
6. Haz clic en **Save**

### Paso 2: Configurar Redirect URLs

En la misma página (URL Configuration), en el campo **Redirect URLs**, asegúrate de tener:

```
https://inventario-hotel-sion-real.vercel.app/**
https://inventario-hotel-sion-real.vercel.app
```

Puedes mantener localhost para desarrollo (opcional):
```
http://localhost:3000/**
http://localhost:3000
```

### Paso 3: Verificar la Configuración

Después de guardar, los cambios deberían aplicarse inmediatamente. Para verificar:

1. Crea un nuevo usuario (o usa uno de prueba)
2. Revisa el email de confirmación
3. El enlace debería ser: `https://inventario-hotel-sion-real.vercel.app/#access_token=...`

## 📍 Ubicación Exacta

```
Dashboard de Supabase → Tu Proyecto → Authentication → URL Configuration
```

O directamente:
```
https://app.supabase.com/project/[TU_PROJECT_ID]/auth/url-configuration
```

## ⚡ Nota Importante

**El código ya está configurado correctamente** para usar `https://inventario-hotel-sion-real.vercel.app/` en el `emailRedirectTo`, pero Supabase **sobrescribe esto** si el `Site URL` está configurado como localhost.

**Por eso es OBLIGATORIO cambiar el Site URL en Supabase.**

## 🔄 Si No Funciona

Si después de cambiar el Site URL aún ves localhost:

1. Espera 2-3 minutos (puede haber caché)
2. Crea un NUEVO usuario de prueba (los usuarios anteriores ya tienen el link generado)
3. Verifica que guardaste correctamente en Supabase

