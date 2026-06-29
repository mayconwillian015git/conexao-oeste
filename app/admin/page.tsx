import { createAdminClient } from '@/lib/supabase'
import Link from 'next/link'

async function getStats() {
  const supabase = createAdminClient()

  const [
    { count: pendingCount },
    { count: publishedCount },
    { count: draftCount },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('log_processamento').select('*').order('criado_em', { ascending: false }).limit(5),
  ])

  return {
    pending: pendingCount ?? 0,
    published: publishedCount ?? 0,
    draft: draftCount ?? 0,
    recentLogs: recentLogs ?? [],
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Aguardando Revisão', value: stats.pending, href: '/admin/revisao', color: 'bg-amber-50 border-amber-200 text-amber-900', badge: 'bg-amber-500' },
    { label: 'Publicadas', value: stats.published, href: '/admin/noticias?status=published', color: 'bg-green-50 border-green-200 text-green-900', badge: 'bg-green-500' },
    { label: 'Rascunhos', value: stats.draft, href: '/admin/noticias?status=draft', color: 'bg-gray-50 border-gray-200 text-gray-900', badge: 'bg-gray-400' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">Visão geral do Conexão Oeste</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, href, color }) => (
          <Link
            key={label}
            href={href}
            className={`rounded-xl border p-5 flex flex-col gap-1 hover:shadow-md transition-shadow ${color}`}
          >
            <span className="text-3xl font-bold">{value}</span>
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/admin/revisao', icon: '📋', label: 'Revisar fila' },
            { href: '/admin/editor', icon: '✏️', label: 'Nova matéria' },
            { href: '/admin/prefeitura', icon: '🏛️', label: 'Upload prefeitura' },
            { href: '/admin/importar-url', icon: '🔗', label: 'Importar URL' },
          ].map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-medium text-gray-700 text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent logs */}
      {stats.recentLogs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Log de Processamento</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Mensagem</th>
                  <th className="px-4 py-3 text-left">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{log.tipo}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : log.status === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{log.mensagem}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.criado_em).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
