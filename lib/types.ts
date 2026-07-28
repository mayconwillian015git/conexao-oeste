// ─────────────────────────────────────────────────────────────
// TypeScript types mirroring the Supabase schema
// ─────────────────────────────────────────────────────────────

export type NoticiaStatus = 'draft' | 'pending_review' | 'published' | 'rejected'
export type NoticiaOrigem =
  | 'manual'
  | 'ia_nacional'
  | 'ia_regional'
  | 'prefeitura'
  | 'importacao_url'

export type Fontetipo = 'rss' | 'busca'
export type BannerTipo = 'popup' | 'sidebar' | 'header'
export type LogStatus = 'success' | 'error' | 'warning'

export interface Noticia {
  id: string
  titulo: string
  slug: string
  resumo: string | null
  conteudo: string | null
  categoria: string
  imagem_url: string | null
  autor: string | null
  status: NoticiaStatus
  origem: NoticiaOrigem
  destaque: boolean
  publicado_em: string | null
  criado_em: string
  atualizado_em: string
  fonte_original_url: string | null
  fonte_original_nome: string | null
  cidade_prefeitura: string | null
  meta_title: string | null
  meta_description: string | null
  imagem_posicao: string | null
}

export type NoticiaInsert = Omit<Noticia, 'id' | 'criado_em' | 'atualizado_em'>
export type NoticiaUpdate = Partial<NoticiaInsert>

export interface FonteBusca {
  id: string
  nome: string
  url: string
  tipo: Fontetipo
  ativo: boolean
  criado_em: string
}

export interface Banner {
  id: string
  titulo: string
  tipo: BannerTipo
  imagem_url: string | null
  link_url: string | null
  ativo: boolean
  criado_em: string
  expirado_em: string | null
  frequencia: 'session' | 'daily' | 'always'
  paginas: string[]
}

export interface LogProcessamento {
  id: string
  tipo: string
  status: LogStatus
  mensagem: string | null
  detalhes: Record<string, unknown> | null
  criado_em: string
}

// ─── AI response shape ──────────────────────────────────────
export interface AIArticleResponse {
  titulo: string
  slug: string
  resumo: string
  conteudo: string
  categoria: string
  meta_title: string
  meta_description: string
}

// ─── Categorias disponíveis ──────────────────────────────────
export const CATEGORIAS = [
  'Política',
  'Economia',
  'Saúde',
  'Educação',
  'Segurança',
  'Esporte',
  'Cultura',
  'Meio Ambiente',
  'Prefeitura',
  'Regional',
  'Brasil',
  'Mundo',
  'Tecnologia',
  'Agricultura',
  'Infraestrutura',
  'Geral',
] as const

export type Categoria = (typeof CATEGORIAS)[number]

export const MUNICIPIOS = [
  'Medianeira',
  'Itaipulândia',
  'Matelândia',
  'Missal',
  'Santa Helena',
  'São Miguel do Iguaçu',
  'Foz do Iguaçu',
  'Cascavel',
  'Toledo',
  'Marechal Cândido Rondon',
  'Guaíra',
  'Pato Bragado',
  'Mercedes',
  'Entre Rios do Oeste',
  'Vera Cruz do Oeste',
  'Ouro Verde do Oeste',
  'Quatro Pontes',
  'Diamante do Oeste',
  'São José das Palmeiras',
  'Terra Roxa',
] as const

export type Municipio = (typeof MUNICIPIOS)[number]
