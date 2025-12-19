-- ============================================
-- CREAR TABLA PARA ALMACENAR TURNOS DE USUARIOS
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- Crear tabla de turnos
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shift_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_initial_quantity INTEGER NOT NULL DEFAULT 0,
  total_sold_cash INTEGER NOT NULL DEFAULT 0,
  total_sold_credit INTEGER NOT NULL DEFAULT 0,
  total_sold INTEGER NOT NULL DEFAULT 0,
  total_available INTEGER NOT NULL DEFAULT 0,
  products_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON public.shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_shift_date ON public.shifts(shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_user_date ON public.shifts(user_id, shift_date DESC);

-- Habilitar RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propios turnos
CREATE POLICY "Users can view own shifts"
  ON public.shifts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Política: Los usuarios pueden insertar sus propios turnos
CREATE POLICY "Users can insert own shifts"
  ON public.shifts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Política: Los administradores pueden ver todos los turnos
CREATE POLICY "Admins can view all shifts"
  ON public.shifts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Política: Los administradores pueden eliminar turnos (opcional, para limpieza)
CREATE POLICY "Admins can delete shifts"
  ON public.shifts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

