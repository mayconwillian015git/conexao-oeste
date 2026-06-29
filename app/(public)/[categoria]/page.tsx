import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase'
import NoticiaCard from '@/components/public/NoticiaCard'
import { CATEGORIAS, type Noticia } from '@/lib/types'

interface Props {
  params: { categoria: string }
}

function toSlug(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ /g, '-')
}

function slugToCategoria(slug: string): string | undefined {
  return CATEGORIAS.find((c) => toSlug(c) === toSlug(slug))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoria = slugToCategoria(params.categoria)
  if (!categoria) return {}

  return {
    title: `${categoria} – Conexão Oeste`,
    description: `Últimas notícias de ${categoria} no Oeste do Paraná.`,
  }
}

export default async function CategoriaPage({ params }: Props) {
  const categoria = slugToCategoria(params.categoria)

  if (!categoria) {
    notFound()
  }

  const supabase = createPublicClient()
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('status', 'published')
    .eq('categoria', categoria as string)
    .order('publicado_em', { ascending: false })
    .limit(30)
  const noticias = (data ?? []) as Noticia[]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <a href="/" className="hover:text-blue-700">Home</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">{categoria}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{categoria}</h1>
        <p className="text-gray-600 mt-1">
          {noticias?.length ?? 0} notícias encontradas
        </p>
      </div>

      {/* News grid */}
      {noticias && noticias.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((n) => (
            <NoticiaCard key={n.id} noticia={n} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Nenhuma notícia encontrada nesta categoria.</p>
          <a href="/" className="mt-4 inline-block text-blue-700 hover:underline">
            Voltar para a home
          </a>
        </div>
      )}
    </div>
  )
}

export async function generateStaticParams() {
  return CATEGORIAS.map((c) => ({
    categoria: toSlug(c),
  }))
}
