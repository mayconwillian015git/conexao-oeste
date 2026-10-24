import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase'
import { CATEGORIAS } from '@/lib/types'

export const revalidate = 3600 // revalida a cada 1 hora

const BASE_URL = 'https://conexaooeste.com'

function toSlug(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ /g, '-')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient()

  const { data: noticias } = await supabase
    .from('noticias')
    .select('slug, atualizado_em')
    .eq('status', 'published')
    .order('publicado_em', { ascending: false })
    .limit(5000)

  const noticiaUrls: MetadataRoute.Sitemap = (noticias ?? []).map((n) => ({
    url: `${BASE_URL}/noticia/${n.slug}`,
    lastModified: new Date(n.atualizado_em),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoriaUrls: MetadataRoute.Sitemap = CATEGORIAS.map((c) => ({
    url: `${BASE_URL}/${toSlug(c)}`,
    changeFrequency: 'hourly',
    priority: 0.6,
  }))

  return [
    {
      url: BASE_URL,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    ...categoriaUrls,
    ...noticiaUrls,
  ]
}
