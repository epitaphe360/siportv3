-- Migration: Create articles_audio table for text-to-speech feature
-- Date: 2024-12-21
-- Description: Store audio versions of articles

-- Create articles_audio table
CREATE TABLE IF NOT EXISTS public.articles_audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'fr',
  audio_url text NOT NULL,
  duration_seconds integer,
  voice_id text,
  status text DEFAULT 'ready' CHECK (status IN ('processing', 'ready', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Unique constraint: one audio per article per language
  UNIQUE(article_id, language)
);

-- Enable RLS
ALTER TABLE public.articles_audio ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view article audio"
  ON public.articles_audio
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated can view article audio"
  ON public.articles_audio
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage article audio"
  ON public.articles_audio
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_audio_article_id ON public.articles_audio(article_id);
CREATE INDEX IF NOT EXISTS idx_articles_audio_language ON public.articles_audio(language);

-- Grant permissions
GRANT SELECT ON public.articles_audio TO anon;
GRANT SELECT ON public.articles_audio TO authenticated;
GRANT ALL ON public.articles_audio TO service_role;
