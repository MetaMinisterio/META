-- Add member_since column to profiles
-- member_since: when the person actually became a member (editable by admin)
-- created_at: when the record was created in the system (automatic, read-only)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS member_since DATE DEFAULT NULL;
