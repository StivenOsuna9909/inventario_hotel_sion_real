# Instrucciones para Ejecutar las Migraciones en Lovable Cloud

## Problema
Si estás recibiendo un error al registrar ventas, es porque las nuevas columnas (`sold_quantity_cash` y `sold_quantity_credit`) aún no existen en tu base de datos.

## Solución: Ejecutar las Migraciones

Para proyectos en **Lovable Cloud**, tienes estas opciones:

### Opción 1: Desde Lovable (Más Fácil) ⭐

1. Ve a tu proyecto en [Lovable](https://lovable.dev)
2. Busca la sección de **Database** o **SQL Editor** en el panel lateral
3. Si no está visible:
   - Ve a **Settings** > **Database**
   - O busca "SQL" en el menú de búsqueda
   - O ve directamente a la sección de "Database" en el sidebar
4. **Copia TODO el contenido del archivo `EJECUTAR_MIGRACIONES.sql`** y pégalo en el editor SQL
5. Haz clic en **Run** o **Execute**
6. ¡Listo! Las migraciones se ejecutarán automáticamente

**Archivo a copiar:** `EJECUTAR_MIGRACIONES.sql` (está en la raíz del proyecto)

### Opción 2: Migraciones Individuales

Si prefieres ejecutarlas una por una, aquí están:

#### Migración 1: Campos de Inventario Inicial
```sql
-- Add initial_quantity and sold_quantity fields to products table
-- These fields track inventory at shift start and sales during the shift

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS initial_quantity INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sold_quantity INTEGER NOT NULL DEFAULT 0;

-- Update existing products to set initial_quantity to current quantity
-- and sold_quantity to 0 for backward compatibility
UPDATE public.products
SET initial_quantity = quantity,
    sold_quantity = 0
WHERE initial_quantity = 0 AND sold_quantity = 0;
```

#### Migración 2: Campos de Tipo de Venta
```sql
-- Add fields to track sales by payment type (cash vs credit)
-- sold_quantity_cash: sales paid in cash (contado)
-- sold_quantity_credit: sales on credit (crédito)
-- sold_quantity remains as total for backward compatibility

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sold_quantity_cash INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sold_quantity_credit INTEGER NOT NULL DEFAULT 0;

-- Migrate existing sold_quantity to sold_quantity_cash for backward compatibility
UPDATE public.products
SET sold_quantity_cash = sold_quantity
WHERE sold_quantity_cash = 0 AND sold_quantity > 0;
```

### Opción 3: Desde el Dashboard de Supabase Directo

Si Lovable no tiene SQL Editor visible, puedes acceder directamente a Supabase:

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Busca tu proyecto (el ID del proyecto es: `sbwxivbbepzsmwmxxdac`)
3. Navega a **SQL Editor** en el menú lateral
4. Copia y pega el contenido de `EJECUTAR_MIGRACIONES.sql` y ejecútalo

### Opción 4: Usando Supabase CLI (Avanzado)

Si tienes Supabase CLI instalado localmente:

```bash
# Asegúrate de estar en el directorio del proyecto
cd "c:\Users\javie\OneDrive\Documentos\Sistema inventario Hotel Sion Real\inventory-vision-main\inventory-vision-main"

# Conecta con tu proyecto remoto
supabase link --project-ref sbwxivbbepzsmwmxxdac

# Aplica las migraciones
supabase db push
```

## Verificación

Después de ejecutar las migraciones, verifica que las columnas existan:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('initial_quantity', 'sold_quantity', 'sold_quantity_cash', 'sold_quantity_credit');
```

Deberías ver las 4 columnas listadas.

## Notas

- Las migraciones usan `IF NOT EXISTS`, por lo que son seguras de ejecutar múltiples veces
- Los datos existentes se migran automáticamente
- No se perderán datos al ejecutar estas migraciones

