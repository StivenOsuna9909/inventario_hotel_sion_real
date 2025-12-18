# 🚀 Configurar Variables de Entorno en Vercel

## El Problema
La aplicación está desplegada en Vercel y necesita las variables de entorno configuradas allí, no solo en `.env.local`.

## ✅ Solución: Configurar en Vercel Dashboard

### Paso 1: Ir al Dashboard de Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** (Configuración)
4. Haz clic en **Environment Variables** (Variables de Entorno)

### Paso 2: Agregar las Variables

Agrega estas **2 variables**:

#### Variable 1:
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://yfhmwcbsordywvoyasot.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 2:
- **Name:** `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaG13Y2Jzb3JkeXd2b3lhc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTI3MjYsImV4cCI6MjA4MDk2ODcyNn0.jQe-lM4v9Q0ium-pSeJnFcypdvKEfxi2feCHZDl5IRA`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### Paso 3: Redesplegar

Después de agregar las variables:

1. Ve a la pestaña **Deployments**
2. Haz clic en el menú de 3 puntos (⋯) del último deployment
3. Selecciona **Redeploy**
4. O simplemente haz un nuevo commit y push para trigger un nuevo deployment

### Paso 4: Verificar

Después del redeploy, la aplicación debería funcionar correctamente.

---

## 🔄 Alternativa: Configurar con Vercel CLI

Si prefieres usar la CLI:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Iniciar sesión
vercel login

# Agregar variables (desde la raíz del proyecto)
vercel env add VITE_SUPABASE_URL production
# Cuando pida el valor, pega: https://yfhmwcbsordywvoyasot.supabase.co

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
# Cuando pida el valor, pega: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaG13Y2Jzb3JkeXd2b3lhc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTI3MjYsImV4cCI6MjA4MDk2ODcyNn0.jQe-lM4v9Q0ium-pSeJnFcypdvKEfxi2feCHZDl5IRA

# Hacer lo mismo para preview y development si quieres
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_URL development
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY preview
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY development
```

Luego haz redeploy.

---

## ✅ Después de Configurar

Una vez configuradas las variables en Vercel y hecho el redeploy:
- ✅ La aplicación debería conectarse a Supabase
- ✅ Deberías poder iniciar sesión
- ✅ Deberías poder editar productos (si eres admin)
- ✅ Todo debería funcionar correctamente

