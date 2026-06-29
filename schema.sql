-- ============================================================
-- Conexão Oeste – Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- Table: noticias
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS noticias (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo           TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  resumo           TEXT,
  conteudo         TEXT,
  categoria        TEXT NOT NULL DEFAULT 'geral',
  imagem_url       TEXT,
  autor            TEXT DEFAULT 'Redação Conexão Oeste',
  status           TEXT NOT NULL DEFAULT 'pending_review'
                     CHECK (status IN ('draft', 'pending_review', 'published', 'rejected')),
  origem           TEXT NOT NULL DEFAULT 'manual'
                     CHECK (origem IN ('manual', 'ia_nacional', 'ia_regional', 'prefeitura', 'importacao_url')),
  destaque         BOOLEAN DEFAULT FALSE,
  publicado_em     TIMESTAMPTZ,
  criado_em        TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ DEFAULT NOW(),
  fonte_original_url  TEXT,
  fonte_original_nome TEXT,
  cidade_prefeitura   TEXT,
  meta_title          TEXT,
  meta_description    TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_noticias_status       ON noticias(status);
CREATE INDEX IF NOT EXISTS idx_noticias_categoria    ON noticias(categoria);
CREATE INDEX IF NOT EXISTS idx_noticias_slug         ON noticias(slug);
CREATE INDEX IF NOT EXISTS idx_noticias_publicado_em ON noticias(publicado_em DESC);
CREATE INDEX IF NOT EXISTS idx_noticias_destaque     ON noticias(destaque) WHERE destaque = TRUE;

-- Auto-update atualizado_em
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_noticias_atualizado_em
  BEFORE UPDATE ON noticias
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

-- ──────────────────────────────────────────────────────────────
-- Table: fontes_busca
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fontes_busca (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome       TEXT NOT NULL,
  url        TEXT NOT NULL,
  tipo       TEXT NOT NULL DEFAULT 'rss'
               CHECK (tipo IN ('rss', 'busca')),
  ativo      BOOLEAN DEFAULT TRUE,
  criado_em  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with some default RSS feeds
INSERT INTO fontes_busca (nome, url, tipo) VALUES
  ('G1 Paraná',       'https://g1.globo.com/rss/g1/pr/', 'rss'),
  ('Agência Brasil',  'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', 'rss'),
  ('UOL Notícias',    'https://rss.uol.com.br/feed/noticias.xml', 'rss')
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- Table: banners
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo      TEXT NOT NULL,
  tipo        TEXT NOT NULL DEFAULT 'sidebar'
                CHECK (tipo IN ('popup', 'sidebar', 'header')),
  imagem_url  TEXT,
  link_url    TEXT,
  ativo       BOOLEAN DEFAULT TRUE,
  criado_em   TIMESTAMPTZ DEFAULT NOW(),
  expirado_em TIMESTAMPTZ
);

-- ──────────────────────────────────────────────────────────────
-- Table: log_processamento
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS log_processamento (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo      TEXT NOT NULL,
  status    TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  mensagem  TEXT,
  detalhes  JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_criado_em ON log_processamento(criado_em DESC);

-- ──────────────────────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────────────────────

-- noticias: public can read published; only service role can write
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published news"
  ON noticias FOR SELECT
  USING (status = 'published');

-- Allow service role full access (bypasses RLS)
-- Service role key should only be used server-side

-- banners: public can read active banners
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active banners"
  ON banners FOR SELECT
  USING (ativo = TRUE AND (expirado_em IS NULL OR expirado_em > NOW()));

-- fontes_busca: public read
ALTER TABLE fontes_busca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active sources"
  ON fontes_busca FOR SELECT
  USING (ativo = TRUE);

-- log_processamento: no public access
ALTER TABLE log_processamento ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- Storage Bucket
-- ──────────────────────────────────────────────────────────────
-- Run in Supabase Storage settings or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('noticias', 'noticias', true);
