-- ============================================================
-- Fix: FK constraints bloqueando exclusão de membros
--
-- As tabelas abaixo referenciam profiles(id) sem ON DELETE,
-- o que faz o banco usar RESTRICT por padrão e impede a deleção.
--
-- Estratégia por tipo de dado:
--   - Conteúdo criado (events, announcements, banners, files):
--     ON DELETE SET NULL — preserva o conteúdo sem o autor
--   - Contribuições financeiras (tithes):
--     ON DELETE SET NULL — preserva o registro financeiro sem vínculo
-- ============================================================

-- EVENTS: created_by → SET NULL
ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_created_by_fkey,
  ADD CONSTRAINT events_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ANNOUNCEMENTS: created_by → SET NULL
ALTER TABLE public.announcements
  DROP CONSTRAINT IF EXISTS announcements_created_by_fkey,
  ADD CONSTRAINT announcements_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- BANNERS: created_by → SET NULL
ALTER TABLE public.banners
  DROP CONSTRAINT IF EXISTS banners_created_by_fkey,
  ADD CONSTRAINT banners_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- FILES: uploaded_by → SET NULL
ALTER TABLE public.files
  DROP CONSTRAINT IF EXISTS files_uploaded_by_fkey,
  ADD CONSTRAINT files_uploaded_by_fkey
    FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- TITHES: user_id já é nullable, → SET NULL para preservar registros financeiros
ALTER TABLE public.tithes
  DROP CONSTRAINT IF EXISTS tithes_user_id_fkey,
  ADD CONSTRAINT tithes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
