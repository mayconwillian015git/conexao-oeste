import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { unstable_noStore as noStore } from 'next/cache'
import { ptBR } from 'date-fns/locale'
import { createPublicClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase'
import NoticiaCard from '@/components/public/NoticiaCard'
import Carrossel from '@/components/public/Carrossel'
import BotoesCompartilhar from '@/components/public/BotoesCompartilhar'
import ContadorVisualizacao from '@/components/public/ContadorVisualizacao'
import WidgetCopa from '@/components/public/WidgetCopa'
import SidebarBanner from '@/components/public/SidebarBanner'
import type { Noticia } from '@/lib/types'

interface Props {
  params: { slug: string }
}

async function getNoticia(slug: string): Promise<Noticia | null> {
  noStore()
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data
}

async function getImagens(noticiaId: string) {
  noStore()
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('noticias_imagens')
    .select('id, url, ordem')
    .eq('noticia_id', noticiaId)
    .order('ordem')
  return data ?? []
}

async function getRelated(categoria: string, currentId: string): Promise<Noticia[]> {
  noStore()
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('status', 'published')
    .eq('categoria', categoria)
    .neq('id', currentId)
    .order('publicado_em', { ascending: false })
    .limit(9)

  // Deduplicate by ID in case the database has duplicate rows
  const seen = new Set<string>()
  return (data ?? [])
    .filter((n) => {
      if (seen.has(n.id)) return false
      seen.add(n.id)
      return true
    })
    .slice(0, 3)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const noticia = await getNoticia(params.slug)
  if (!noticia) return {}

  return {
    title: noticia.meta_title ?? noticia.titulo,
    description: noticia.meta_description ?? noticia.resumo ?? undefined,
    openGraph: {
      title: noticia.meta_title ?? noticia.titulo,
      description: noticia.meta_description ?? noticia.resumo ?? undefined,
      images: noticia.imagem_url ? [{ url: noticia.imagem_url }] : [],
      type: 'article',
      publishedTime: noticia.publicado_em ?? undefined,
    },
  }
}

export default async function NoticiaPage({ params }: Props) {
  const noticia = await getNoticia(params.slug)

  if (!noticia) {
    notFound()
  }

  const [related, imagens] = await Promise.all([
    getRelated(noticia.categoria, noticia.id),
    getImagens(noticia.id),
  ])
  const publishedAt = noticia.publicado_em ?? noticia.criado_em

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Article ──────────────────────────────────────────── */}
        <article className="lg:col-span-2">
          <ContadorVisualizacao id={noticia.id} />
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-700">Home</Link>
            <span>/</span>
            <Link
              href={`/${noticia.categoria.toLowerCase().replace(/ /g, '-')}`}
              className="hover:text-blue-700"
            >
              {noticia.categoria}
            </Link>
          </nav>

          {/* Category badge */}
          <span className="inline-block bg-blue-800 text-white text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide mb-3">
            {noticia.categoria}
          </span>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {noticia.titulo}
          </h1>

          {/* Summary */}
          {noticia.resumo && (
            <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-blue-800 pl-4 mb-6">
              {noticia.resumo}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
            {noticia.autor && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {noticia.autor}
              </span>
            )}
            <time dateTime={publishedAt!}>
              {format(new Date(publishedAt!), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </time>
            {noticia.cidade_prefeitura && (
              <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-medium">
                {noticia.cidade_prefeitura}
              </span>
            )}
          </div>

          {/* Carrossel ou imagem de capa */}
          {imagens.length > 0 ? (
            <Carrossel imagens={imagens} titulo={noticia.titulo} />
          ) : noticia.imagem_url ? (
            <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden">
              <Image
                src={noticia.imagem_url}
                alt={noticia.titulo}
                fill
                className="object-cover"
                style={{ objectPosition: noticia.imagem_posicao ?? '50% 50%' }}
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>
          ) : null}

          {/* Content */}
          <div
            className="prose-noticia"
            dangerouslySetInnerHTML={{ __html: noticia.conteudo ?? '' }}
          />

          {/* Compartilhar */}
          <BotoesCompartilhar
            titulo={noticia.titulo}
            url={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://conexaooeste.com'}/noticia/${noticia.slug}`}
          />

          {/* Source credit */}
          {noticia.fonte_original_url && noticia.fonte_original_nome && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Com informações de{' '}
                <a
                  href={noticia.fonte_original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  {noticia.fonte_original_nome}
                </a>
              </p>
            </div>
          )}
        </article>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="space-y-6">
          {related.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-800 rounded inline-block" />
                Relacionadas
              </h2>
              <div className="space-y-4">
                {related.map((n) => (
                  <NoticiaCard key={n.id} noticia={n} variant="horizontal" />
                ))}
              </div>
            </div>
          )}
          <SidebarBanner />
          <WidgetCopa />
        </aside>
      </div>
    </div>
  )
}
