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

