# Solución al Error: "could not find the 'sold_quantity' column"

## Problema
El error indica que las columnas no están en el schema cache de Supabase o no existen en la base de datos.

## Solución Paso a Paso

### Paso 1: Verificar que las columnas existan en la base de datos

Ejecuta esto en el SQL Editor de Supabase:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products' 
AND column_name IN ('initial_quantity', 'sold_quantity', 'sold_quantity_cash', 'sold_quantity_credit');
```

**Si NO ves las 4 columnas**, ejecuta el archivo `ARREGLAR_COLUMNAS_FALTANTES.sql`

### Paso 2: Arreglar las columnas faltantes

1. Abre el archivo `ARREGLAR_COLUMNAS_FALTANTES.sql`
2. Copia TODO el contenido
3. Pégalo en el SQL Editor de Supabase
4. Ejecuta (Run o Ctrl+Enter)
5. Deberías ver las 4 columnas listadas al final

### Paso 3: Refrescar el Schema Cache de Supabase

El schema cache puede estar desactualizado. Para refrescarlo:

1. Ve a **Settings** > **API** en Supabase Dashboard
2. Busca la sección **Schema Cache** o **Database Schema**
3. Haz clic en **Refresh Schema** o **Reload Schema**
4. O simplemente espera unos minutos (el cache se actualiza automáticamente)

### Paso 4: Reiniciar la aplicación

1. Detén el servidor de desarrollo (Ctrl+C)
2. Reinicia: `npm run dev`
3. Recarga la página en el navegador (Ctrl+F5 para forzar recarga)

### Paso 5: Verificar que funcione

Intenta registrar una venta nuevamente. Debería funcionar ahora.

## Si el problema persiste

Si después de estos pasos aún tienes el error:

1. Verifica que ejecutaste `SETUP_COMPLETO_DATABASE.sql` o `ARREGLAR_COLUMNAS_FALTANTES.sql`
2. Verifica que las columnas existen ejecutando el query del Paso 1
3. Espera 2-3 minutos para que el schema cache se actualice
4. Reinicia completamente la aplicación

## Nota sobre los Tipos TypeScript

Los tipos en `src/integrations/supabase/types.ts` ya fueron actualizados para incluir las nuevas columnas. Si el error persiste, es un problema del schema cache de Supabase, no del código.

