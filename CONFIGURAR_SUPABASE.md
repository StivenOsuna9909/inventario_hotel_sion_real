# Configuración de Supabase

## Paso 1: Obtener la URL de tu Proyecto Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** (Configuración) en el menú lateral
4. Haz clic en **API**
5. Busca la sección **Project URL** - copia esa URL
   - Se verá algo como: `https://xxxxx.supabase.co`

## Paso 2: Configurar las Variables de Entorno

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza `YOUR_SUPABASE_URL` con la URL que copiaste
3. Guarda el archivo

El archivo debería verse así:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ilttnBwD3Sza3MZPldP2zg_imRior-Y
```

## Paso 3: Reiniciar el Servidor de Desarrollo

Si tienes el servidor corriendo, deténlo (Ctrl+C) y vuelve a iniciarlo:

```bash
npm run dev
```

## Paso 4: Ejecutar las Migraciones SQL

Ahora que tienes acceso al SQL Editor de Supabase:

1. Ve a **SQL Editor** en el menú lateral de Supabase
2. Copia y pega el contenido del archivo `EJECUTAR_MIGRACIONES.sql`
3. Haz clic en **Run** o presiona Ctrl+Enter
4. Deberías ver un mensaje de éxito

## Verificación

Para verificar que las migraciones se ejecutaron correctamente, ejecuta esto en el SQL Editor:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('initial_quantity', 'sold_quantity', 'sold_quantity_cash', 'sold_quantity_credit');
```

Deberías ver 4 filas con esos nombres de columnas.

