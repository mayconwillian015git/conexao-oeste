export type NoticiaStatus = 'rascunho' | 'publicada' | 'arquivada';

export interface Noticia {
  id: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  slug: string;
  categoria: string;
  status: NoticiaStatus;
  imagem_url: string | null;
  fonte_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  published_at: string | null;
}

export interface Banner {
  id: string;
  imagem_url: string;
  link: string | null;
  ativo: boolean;
  created_at: string;
}

export const CATEGORIAS = [
  'brasil',
  'mundo',
  'economia',
  'esportes',
  'tecnologia',
  'entretenimento',
  'ciencia',
  'saude',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];
