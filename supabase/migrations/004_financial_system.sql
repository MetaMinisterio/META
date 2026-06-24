-- ============================================================
-- Sistema Financeiro Completo
-- Novas tabelas: financial_categories e transactions
-- ============================================================

-- FINANCIAL_CATEGORIES — categorias de receitas e despesas
CREATE TABLE public.financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT DEFAULT '#6B7280',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TRANSACTIONS — lançamentos financeiros (exceto dízimos/ofertas que ficam em tithes)
CREATE TABLE public.transactions (
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

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Índices
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_date ON public.transactions(reference_date);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);
CREATE INDEX idx_financial_categories_type ON public.financial_categories(type);

-- ============================================================
-- RLS — financial_categories
-- ============================================================
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_authenticated"
  ON public.financial_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "categories_insert_admin"
  ON public.financial_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "categories_update_admin"
  ON public.financial_categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

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

CREATE POLICY "transactions_select_admin"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "transactions_insert_admin"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "transactions_update_admin"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "transactions_delete_admin"
  ON public.transactions FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ============================================================
-- Seed: categorias padrão
-- ============================================================

INSERT INTO public.financial_categories (name, type, color) VALUES
  ('Aluguel de Salão',  'income',  '#10B981'),
  ('Doação Especial',   'income',  '#3B82F6'),
  ('Campanha',          'income',  '#8B5CF6'),
  ('Patrocínio',        'income',  '#06B6D4'),
  ('Outros',            'income',  '#6B7280'),
  ('Água / Luz / Internet', 'expense', '#EF4444'),
  ('Aluguel',           'expense', '#F97316'),
  ('Manutenção',        'expense', '#EAB308'),
  ('Material',          'expense', '#84CC16'),
  ('Salário',           'expense', '#EC4899'),
  ('Eventos',           'expense', '#A78BFA'),
  ('Outros',            'expense', '#9CA3AF');
