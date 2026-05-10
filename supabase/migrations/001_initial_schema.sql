-- ============================================================
-- META ChMS — Schema Completo do Banco de Dados
-- Execute este arquivo inteiro no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- 1. FUNÇÕES AUXILIARES
-- ============================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar profile ao criar user no auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. TABELAS
-- ============================================================

-- PROFILES — Extensão do auth.users com dados cadastrais
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  ministries TEXT[] DEFAULT '{}',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'leader', 'pastor', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- EVENTS — Cultos, encontros e eventos
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  image_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- PRAYER_REQUESTS — Pedidos de oração
CREATE TABLE public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER prayer_requests_updated_at
  BEFORE UPDATE ON public.prayer_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ANNOUNCEMENTS — Avisos e comunicados
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- BANNERS — Banners dinâmicos do feed
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FILES — Materiais para download
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  category TEXT DEFAULT 'general' CHECK (category IN ('sermon', 'devotional', 'cell', 'general')),
  is_published BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TITHES — Registro de contribuições
CREATE TABLE public.tithes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tithe', 'offering', 'campaign')),
  description TEXT,
  payment_method TEXT DEFAULT 'pix',
  receipt_url TEXT,  -- URL do comprovante no Storage
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. ÍNDICES DE PERFORMANCE
-- ============================================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_published ON public.events(is_published);
CREATE INDEX idx_prayer_requests_user ON public.prayer_requests(user_id);
CREATE INDEX idx_prayer_requests_public ON public.prayer_requests(is_public, is_archived);
CREATE INDEX idx_announcements_published ON public.announcements(is_published, published_at);
CREATE INDEX idx_banners_active ON public.banners(is_active, display_order);
CREATE INDEX idx_files_published ON public.files(is_published, category);
CREATE INDEX idx_tithes_user ON public.tithes(user_id);
CREATE INDEX idx_tithes_status ON public.tithes(status);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- ---- PROFILES ----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Impede membro de mudar o próprio role
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'pastor')
    )
  );

-- ---- EVENTS ----
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_published"
  ON public.events FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "events_select_admin"
  ON public.events FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "events_insert_admin"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "events_update_admin"
  ON public.events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "events_delete_admin"
  ON public.events FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ---- PRAYER_REQUESTS ----
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prayers_select_own"
  ON public.prayer_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "prayers_select_public"
  ON public.prayer_requests FOR SELECT
  TO authenticated
  USING (is_public = true AND is_archived = false);

CREATE POLICY "prayers_select_admin"
  ON public.prayer_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'leader'))
  );

CREATE POLICY "prayers_insert_own"
  ON public.prayer_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "prayers_update_own"
  ON public.prayer_requests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "prayers_update_admin"
  ON public.prayer_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "prayers_delete_admin"
  ON public.prayer_requests FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ---- ANNOUNCEMENTS ----
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_select_published"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "announcements_select_admin"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "announcements_insert_admin"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "announcements_update_admin"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "announcements_delete_admin"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ---- BANNERS ----
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "banners_select_active"
  ON public.banners FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Também permite select público (Landing Page sem auth)
CREATE POLICY "banners_select_anon"
  ON public.banners FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "banners_select_admin"
  ON public.banners FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "banners_insert_admin"
  ON public.banners FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "banners_update_admin"
  ON public.banners FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "banners_delete_admin"
  ON public.banners FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ---- FILES ----
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files_select_published"
  ON public.files FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "files_select_admin"
  ON public.files FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "files_insert_admin"
  ON public.files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "files_update_admin"
  ON public.files FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "files_delete_admin"
  ON public.files FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ---- TITHES ----
ALTER TABLE public.tithes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tithes_select_own"
  ON public.tithes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tithes_insert_own"
  ON public.tithes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tithes_select_admin"
  ON public.tithes FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "tithes_update_admin"
  ON public.tithes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ============================================================
-- 5. STORAGE BUCKETS + POLÍTICAS
-- ============================================================

-- Criar buckets (execute estes INSERTs no SQL Editor)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('events', 'events', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- ---- AVATARS (público para leitura, upload pelo dono) ----
CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---- BANNERS (público para leitura, admin para upload) ----
CREATE POLICY "banners_storage_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'banners');

CREATE POLICY "banners_storage_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'banners'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "banners_storage_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'banners'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "banners_storage_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'banners'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ---- EVENTS IMAGES (público para leitura, admin para upload) ----
CREATE POLICY "events_storage_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'events');

CREATE POLICY "events_storage_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'events'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "events_storage_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'events'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "events_storage_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'events'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ---- FILES (autenticado para leitura, admin para upload) ----
CREATE POLICY "files_storage_select_auth"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'files');

CREATE POLICY "files_storage_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'files'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "files_storage_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'files'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "files_storage_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'files'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

-- ---- RECEIPTS (dono pode ler/upload, admin pode ler) ----
CREATE POLICY "receipts_storage_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "receipts_storage_select_admin"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'receipts'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'pastor'))
  );

CREATE POLICY "receipts_storage_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 6. PROMOVER SEU USUÁRIO PARA ADMIN
-- ============================================================
-- Após criar sua primeira conta no app, execute esta query
-- substituindo 'SEU_EMAIL_AQUI' pelo email que você usou:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (
--   SELECT id FROM auth.users
--   WHERE email = 'SEU_EMAIL_AQUI'
-- );
--
-- Exemplo:
-- UPDATE public.profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'lucas@igrejameta.com');
-- ============================================================
