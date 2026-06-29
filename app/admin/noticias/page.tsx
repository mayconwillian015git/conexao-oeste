import { createAdminClient } from '@/lib/supabase'
import Link from 'next/link'
import BotaoDeletar from '@/components/admin/BotaoDeletar'

export const revalidate = 0

async function getNoticias(status: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('noticias')
    .select('id, titulo, categoria, status, origem, publicado_em, criado_em, imagem_url')
    .eq('status', status)
    .order('publicado_em', { ascending: false, nullsFirst: false })
    .order('criado_em', { ascending: false })
    .limit(100)
  return data ?? []
}

const STATUS_OPTIONS = [
  { value: 'published', label: 'Publicadas' },
  { value: 'draft', label: 'Rascunhos' },
  { value: 'rejected', label: 'Rejeitadas' },
]

const ORIGEM_LABELS: Record<string, string> = {
  manual: 'Manual',
  ia_nacional: 'IA Nacional',
  ia_regional: 'IA Regional',
  prefeitura: 'Prefeitura',
  importacao_url: 'Importação URL',
}

export default async function NoticiasAdminPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const status = searchParams.status ?? 'published'
  const noticias = await getNoticias(status)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
          <p className="text-gray-500 text-sm mt-1">{noticias.length} registros encontrados</p>
        </div>
        <Link
          href="/admin/editor"
          className="bg-blue-800 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Nova matéria
        </Link>
      </div>

      {/* Filtro de status */}
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/noticias?status=${opt.value}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === opt.value
                ? 'bg-blue-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {noticias.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Nenhuma notícia encontrada.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Categoria</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Origem</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Data</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {noticias.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {n.imagem_url && (
                        <img
                          src={n.imagem_url}
                          alt=""
                          className="w-10 h-10 object-cover rounded flex-shrink-0 bg-gray-100"
                        />
                      )}
                      <span className="font-medium text-gray-900 line-clamp-2 leading-snug">
                        {n.titulo}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {n.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                    {ORIGEM_LABELS[n.origem] ?? n.origem}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 whitespace-nowrap">
                    {new Date(n.publicado_em ?? n.criado_em).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/noticia/${n.id}`}
                        target="_blank"
                        className="text-xs text-gray-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/admin/editor/${n.id}`}
                        className="text-xs font-medium text-blue-700 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Editar
                      </Link>
                      <BotaoDeletar id={n.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
