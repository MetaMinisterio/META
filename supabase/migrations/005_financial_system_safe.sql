-- ============================================================
-- Migração segura do sistema financeiro
-- Pode ser executada mesmo que 004 tenha rodado parcialmente.
-- Não destrói nenhum dado existente.
-- ============================================================

-- FINANCIAL_CATEGORIES
CREATE TABLE IF NOT EXISTS public.financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT DEFAULT '#6B7280',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT DEFAULT 'pix' CHECK (payment_method IN ('pix', 'cash', 'card', 'transfer', 'check', 'other')),
  reference_date DATE NOT NULL DEFAULT CURRENT_DATE,
  responsible_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger updated_at (recria de forma segura)
DROP TRIGGER IF EXISTS transactions_updated_at ON public.transactions;
CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Índices (IF NOT EXISTS para não duplicar)
CREATE INDEX IF NOT EXISTS idx_transactions_type     ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date     ON public.transactions(reference_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_categories_type ON public.financial_categories(type);

-- ============================================================
-- RLS — financial_categories
-- ============================================================
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_authenticated" ON public.financial_categories;
CREATE POLICY "categories_select_authenticated"
  ON public.financial_categories FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "categories_insert_admin" ON public.financial_categories;
CREATE POLICY "categories_insert_admin"
  ON public.financial_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

DROP POLICY IF EXISTS "categories_update_admin" ON public.financial_categories;
CREATE POLICY "categories_update_admin"
  ON public.financial_categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

DROP POLICY IF EXISTS "categories_delete_admin" ON public.financial_categories;
CREATE POLICY "categories_delete_admin"
  ON public.financial_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ============================================================
-- RLS — transactions
-- ============================================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_admin" ON public.transactions;
CREATE POLICY "transactions_select_admin"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

DROP POLICY IF EXISTS "transactions_insert_admin" ON public.transactions;
CREATE POLICY "transactions_insert_admin"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

DROP POLICY IF EXISTS "transactions_update_admin" ON public.transactions;
CREATE POLICY "transactions_update_admin"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

DROP POLICY IF EXISTS "transactions_delete_admin" ON public.transactions;
CREATE POLICY "transactions_delete_admin"
  ON public.transactions FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ============================================================
-- Seed: categorias padrão (só insere se a tabela estiver vazia)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.financial_categories LIMIT 1) THEN
    INSERT INTO public.financial_categories (name, type, color) VALUES
      ('Aluguel de Salão',      'income',  '#10B981'),
      ('Doação Especial',       'income',  '#3B82F6'),
      ('Campanha',              'income',  '#8B5CF6'),
      ('Patrocínio',            'income',  '#06B6D4'),
      ('Outros',                'income',  '#6B7280'),
      ('Água / Luz / Internet', 'expense', '#EF4444'),
      ('Aluguel',               'expense', '#F97316'),
      ('Manutenção',            'expense', '#EAB308'),
      ('Material',              'expense', '#84CC16'),
      ('Salário',               'expense', '#EC4899'),
      ('Eventos',               'expense', '#A78BFA'),
      ('Outros',                'expense', '#9CA3AF');
  END IF;
END $$;
