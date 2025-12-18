# 🔧 Solución: Error "No API key found in request"

## El Problema

Estás viendo el error:
```json
{
  "message": "No API key found in request",
  "hint": "No `apikey` request header or url param was found."
}
```

Esto significa que las variables de entorno **no se están cargando** correctamente.

## ✅ Solución (Paso a Paso)

### Paso 1: Detener el Servidor

1. Ve a la terminal donde está corriendo `npm run dev`
2. Presiona **Ctrl+C** para detenerlo completamente
3. Asegúrate de que se haya detenido (verás el cursor disponible de nuevo)

### Paso 2: Verificar el archivo .env.local

El archivo `.env.local` debe estar en la **raíz del proyecto** (mismo nivel que `package.json`).

Debe contener exactamente esto (sin espacios extra, sin comillas):

```env
VITE_SUPABASE_URL=https://yfhmwcbsordywvoyasot.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaG13Y2Jzb3JkeXd2b3lhc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTI3MjYsImV4cCI6MjA4MDk2ODcyNn0.jQe-lM4v9Q0ium-pSeJnFcypdvKEfxi2feCHZDl5IRA
```

**IMPORTANTE:**
- ✅ NO debe tener espacios alrededor del `=`
- ✅ NO debe tener comillas (`"` o `'`)
- ✅ NO debe tener espacios al inicio o final de las líneas
- ✅ Debe tener exactamente estas dos líneas

### Paso 3: Reiniciar el Servidor

```bash
npm run dev
```

**ESTO ES CRÍTICO:** Vite solo carga las variables de entorno cuando **inicia**, no mientras está corriendo.

### Paso 4: Verificar en el Navegador

1. Abre la aplicación en el navegador
2. Abre la **Consola del Desarrollador** (F12)
3. Si las variables no están cargadas, verás un error rojo explicando qué falta
4. Si todo está bien, no deberías ver errores de variables faltantes

## 🔍 Verificación Adicional

Si después de reiniciar sigue sin funcionar, verifica en la consola del navegador:

1. Abre la consola (F12)
2. Ve a la pestaña **Console**
3. Escribe esto y presiona Enter:
   ```javascript
   console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Existe' : '❌ No existe');
   ```

Si ves `undefined` o `No existe`, las variables no se están cargando.

## ⚠️ Problemas Comunes

### El archivo .env.local no se ve en el explorador

Esto es **normal**. Los archivos `.env.local` están en `.gitignore` y muchos editores los ocultan. Pero el archivo existe y Vite lo lee.

### El servidor ya estaba corriendo cuando creé .env.local

**Debes reiniciarlo.** Vite solo lee las variables cuando inicia, no mientras corre.

### Cambié .env.local pero no se actualizó

**Debes reiniciar el servidor** cada vez que cambies variables de entorno.

## 📝 Notas Importantes

- ✅ El archivo se llama `.env.local` (con punto al inicio)
- ✅ Está en la raíz del proyecto (no en `src/`)
- ✅ Las variables deben empezar con `VITE_` para ser expuestas al cliente
- ✅ El servidor DEBE reiniciarse después de crear/modificar `.env.local`

## ✅ Después de Corregir

Una vez que reinicies el servidor correctamente, deberías poder:
- ✅ Iniciar sesión
- ✅ Ver productos
- ✅ Editar precios (si tienes rol admin)
- ✅ Todas las operaciones deberían funcionar

