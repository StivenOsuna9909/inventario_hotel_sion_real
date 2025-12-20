# Configurar Dominio para Email de Confirmación

## ✅ Cambios Realizados

El código ahora detecta automáticamente si estás en producción (vercel.app) y usa el dominio correcto: `https://inventario-hotel-sion-real.vercel.app/`

## Opcional: Configurar Variable de Entorno en Vercel

Si quieres ser más explícito, puedes agregar una variable de entorno en Vercel:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Agrega una nueva variable:
   - **Name**: `VITE_APP_URL`
   - **Value**: `https://inventario-hotel-sion-real.vercel.app`
   - **Environments**: Production (y Preview si quieres)
4. Haz clic en **Save**
5. **Re-deploy** tu aplicación para que los cambios surtan efecto

## ✅ Funcionamiento Actual

El código ahora funciona así:
- Si existe `VITE_APP_URL`, lo usa
- Si estás en un dominio que incluye `vercel.app`, usa `https://inventario-hotel-sion-real.vercel.app`
- En desarrollo local, usa `window.location.origin` (localhost)

**¡Los emails de confirmación ahora usarán el dominio correcto!** 🎉

