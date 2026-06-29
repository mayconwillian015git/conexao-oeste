import { createAdminClient } from '@/lib/supabase'
import NoticiaCard from '@/components/public/NoticiaCard'
import type { Noticia } from '@/lib/types'

interface Props {
  searchParams: { q?: string }
}

export const dynamic = 'force-dynamic'

export default async function BuscaPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? ''
  let noticias: Noticia[] = []

  if (q) {
    const adminClient = createAdminClient()
    const { data } = await adminClient.rpc('buscar_noticias', { termo: q })
    noticias = data ?? []
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {q ? `Resultados para "${q}"` : 'Buscar notícias'}
        </h1>
        {q && (
          <p className="text-sm text-gray-500 mt-1">
            {noticias.length} {noticias.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </p>
        )}
      </div>

      <form action="/busca" method="get" className="flex gap-2 mb-8">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Digite sua busca..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="submit"
          className="bg-blue-800 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Buscar
        </button>
      </form>

      {q && noticias.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Nenhuma notícia encontrada para "{q}"</p>
          <p className="text-sm mt-1">Tente outros termos de busca</p>
        </div>
      )}

      {noticias.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((n) => (
            <NoticiaCard key={n.id} noticia={n} />
          ))}
        </div>
      )}
    </div>
  )
}
