-- Tabela de notícias
create table if not exists public.noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  resumo text not null default '',
  conteudo text not null default '',
  slug text not null unique,
  categoria text not null default 'brasil',
  status text not null default 'rascunho' check (status in ('rascunho', 'publicada', 'arquivada')),
  imagem_url text,
  fonte_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

-- Índices
create index if not exists noticias_status_idx on public.noticias (status);
create index if not exists noticias_categoria_idx on public.noticias (categoria);
create index if not exists noticias_slug_idx on public.noticias (slug);
create index if not exists noticias_published_at_idx on public.noticias (published_at desc);
create index if not exists noticias_fonte_url_idx on public.noticias (fonte_url);

-- Tabela de banners
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  imagem_url text not null,
  link text,
  ativo boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS: acesso público de leitura para notícias publicadas
alter table public.noticias enable row level security;
alter table public.banners enable row level security;

create policy "Notícias publicadas são públicas" on public.noticias
  for select using (status = 'publicada');

create policy "Admin pode tudo em notícias" on public.noticias
  for all using (true);

create policy "Banners ativos são públicos" on public.banners
  for select using (ativo = true);

create policy "Admin pode tudo em banners" on public.banners
  for all using (true);
