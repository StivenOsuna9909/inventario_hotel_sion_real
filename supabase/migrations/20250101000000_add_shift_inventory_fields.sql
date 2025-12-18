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

