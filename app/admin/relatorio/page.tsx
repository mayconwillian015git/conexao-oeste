import { createAdminClient } from '@/lib/supabase'
import Link from 'next/link'

interface NoticiaVistas {
  id: string
  titulo: string
  slug: string
  categoria: string
  visualizacoes: number
  publicado_em: string | null
}

interface CategoriaStats {
  categoria: string
  total_views: number
  total_materias: number
}

async function getRelatorio() {
  const supabase = createAdminClient()

  const [{ data: topMaterias }, { data: todasPublicadas }] = await Promise.all([
    supabase
      .from('noticias')
      .select('id, titulo, slug, categoria, visualizacoes, publicado_em')
      .eq('status', 'published')
      .order('visualizacoes', { ascending: false })
      .limit(20),
    supabase
      .from('noticias')
      .select('categoria, visualizacoes')
      .eq('status', 'published'),
  ])

  // Agrupa por categoria
  const categoriaMap = new Map<string, CategoriaStats>()
  for (const n of todasPublicadas ?? []) {
    const cat = n.categoria ?? 'Sem categoria'
    const existing = categoriaMap.get(cat) ?? { categoria: cat, total_views: 0, total_materias: 0 }
    existing.total_views += n.visualizacoes ?? 0
    existing.total_materias += 1
    categoriaMap.set(cat, existing)
  }

  const porCategoria = Array.from(categoriaMap.values()).sort((a, b) => b.total_views - a.total_views)
  const totalVisualizacoes = porCategoria.reduce((acc, c) => acc + c.total_views, 0)

  return {
    topMaterias: (topMaterias ?? []) as NoticiaVistas[],
    porCategoria,
    totalVisualizacoes,
  }
}

export default async function RelatorioPage() {
  const { topMaterias, porCategoria, totalVisualizacoes } = await getRelatorio()

  const maxViews = porCategoria[0]?.total_views ?? 1

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatório de Visualizações</h1>
        <p className="text-gray-500 text-sm mt-1">Desempenho das matérias publicadas</p>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total de visualizações</p>
          <p className="text-3xl font-bold text-gray-900">{totalVisualizacoes.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Matéria mais vista</p>
          <p className="text-lg font-bold text-gray-900 line-clamp-2">{topMaterias[0]?.titulo ?? '—'}</p>
          <p className="text-sm text-blue-600 mt-1">{topMaterias[0]?.visualizacoes?.toLocaleString('pt-BR') ?? 0} views</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Seção mais acessada</p>
          <p className="text-2xl font-bold text-gray-900">{porCategoria[0]?.categoria ?? '—'}</p>
          <p className="text-sm text-blue-600 mt-1">{porCategoria[0]?.total_views?.toLocaleString('pt-BR') ?? 0} views</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top matérias */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Top 20 Matérias</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Matéria</th>
                  <th className="px-4 py-3 text-left">Seção</th>
                  <th className="px-4 py-3 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topMaterias.map((n, i) => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/noticia/${n.slug}`}
                        target="_blank"
                        className="text-gray-900 hover:text-blue-700 font-medium line-clamp-2 leading-snug"
                      >
                        {n.titulo}
                      </Link>
                      {n.publicado_em && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(n.publicado_em).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                        {n.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">
                      {(n.visualizacoes ?? 0).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
                {topMaterias.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      Nenhuma visualização registrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Views por seção */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Views por Seção</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            {porCategoria.map((cat) => (
              <div key={cat.categoria}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{cat.categoria}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {cat.total_views.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      ({cat.total_materias} matérias)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${maxViews > 0 ? (cat.total_views / maxViews) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {porCategoria.length === 0 && (
              <p className="text-center text-gray-400 py-6">Nenhum dado disponível.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
