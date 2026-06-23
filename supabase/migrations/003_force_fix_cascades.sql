-- ============================================================
-- Fix: Remoção dinâmica de FK constraints que bloqueiam exclusão
--
-- A migração 002 usou DROP CONSTRAINT IF EXISTS com nomes fixos.
-- Se o Supabase gerou nomes diferentes, o DROP não executa e a
-- constraint RESTRICT original permanece, bloqueando o DELETE.
--
-- Esta migração busca e remove QUALQUER FK constraint nessas
-- colunas, independente do nome, e recria com ON DELETE correto.
-- ============================================================

-- Passo 1: remover todas as FKs existentes nessas colunas (qualquer nome)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND (
        (tc.table_name = 'events'         AND kcu.column_name = 'created_by')
        OR (tc.table_name = 'announcements' AND kcu.column_name = 'created_by')
        OR (tc.table_name = 'banners'      AND kcu.column_name = 'created_by')
        OR (tc.table_name = 'files'        AND kcu.column_name = 'uploaded_by')
        OR (tc.table_name = 'tithes'       AND kcu.column_name = 'user_id')
      )
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', r.table_name, r.constraint_name);
    RAISE NOTICE 'Removida: %.%', r.table_name, r.constraint_name;
  END LOOP;
END;
$$;

-- Passo 2: recriar com ON DELETE SET NULL
ALTER TABLE public.events
  ADD CONSTRAINT events_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.announcements
  ADD CONSTRAINT announcements_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.banners
  ADD CONSTRAINT banners_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.files
  ADD CONSTRAINT files_uploaded_by_fkey
    FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.tithes
  ADD CONSTRAINT tithes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
