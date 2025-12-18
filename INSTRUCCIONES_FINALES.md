# 🔧 Solución Final para el Error PGRST204

## El Problema
El error `PGRST204: Could not find the 'sold_quantity' column` significa que **PostgREST** (el servicio de API de Supabase) no ha actualizado su schema cache después de agregar las nuevas columnas.

## Solución Paso a Paso

### Paso 1: Ejecutar el Script SQL

1. Abre el archivo `SOLUCION_DEFINITIVA_SCHEMA.sql`
2. Copia **TODO** el contenido
3. Pégalo en el **SQL Editor** de Supabase
4. Ejecuta (Run o Ctrl+Enter)
5. Deberías ver las 4 columnas listadas al final

### Paso 2: Forzar Actualización del Schema Cache

Tienes **3 opciones** (elige una):

#### Opción A: Desde el Dashboard de Supabase (Recomendado)
1. Ve a **Settings** > **API** en Supabase Dashboard
2. Busca la sección **"Schema"** o **"Database Schema"**
3. Busca un botón que diga **"Reload Schema"**, **"Refresh Schema"**, o **"Reload"**
4. Haz clic en ese botón
5. Espera 10-20 segundos

#### Opción B: Esperar (Automático)
- Simplemente **espera 2-3 minutos** después de ejecutar el SQL
- PostgREST actualiza su cache automáticamente cada cierto tiempo

#### Opción C: Reiniciar el Proyecto Supabase
1. Ve a **Settings** > **General** en Supabase Dashboard
2. Busca **"Restart Project"** o **"Pause/Resume"**
3. Pausa el proyecto, espera 10 segundos, y reanúdalo
4. Esto fuerza una actualización completa del schema

### Paso 3: Reiniciar tu Aplicación

1. **Detén** el servidor de desarrollo (Ctrl+C en la terminal)
2. **Espera 10 segundos**
3. **Reinicia**: `npm run dev`
4. **Recarga** la página en el navegador con **Ctrl+F5** (forzar recarga sin cache)

### Paso 4: Probar de Nuevo

Intenta registrar una venta. Debería funcionar ahora.

## Si Aún No Funciona

Si después de todos estos pasos el error persiste:

1. **Verifica que las columnas existen** ejecutando esto en SQL Editor:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = 'products' 
   AND column_name IN ('initial_quantity', 'sold_quantity', 'sold_quantity_cash', 'sold_quantity_credit');
   ```
   Deberías ver **4 filas**.

2. **Espera más tiempo** (hasta 5 minutos) - a veces PostgREST tarda en actualizar

3. **Contacta soporte de Supabase** si el problema persiste después de 10 minutos

## Nota Técnica

PostgREST cachea el schema de la base de datos para mejorar el rendimiento. Cuando agregas nuevas columnas, este cache necesita actualizarse. El comando `NOTIFY pgrst, 'reload schema'` en el script SQL le dice a PostgREST que debe recargar, pero a veces necesita tiempo adicional o una acción manual desde el dashboard.

