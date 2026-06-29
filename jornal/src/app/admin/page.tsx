import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

async function getStats() {
  const [{ count: rascunhos }, { count: publicadas }, { count: arquivadas }, { count: banners }] =
    await Promise.all([
      supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('status', 'rascunho'),
      supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('status', 'publicada'),
      supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('status', 'arquivada'),
      supabase.from('banners').select('*', { count: 'exact', head: true }).eq('ativo', true),
    ]);
  return { rascunhos: rascunhos ?? 0, publicadas: publicadas ?? 0, arquivadas: arquivadas ?? 0, banners: banners ?? 0 };
}

async function getUltimasNoticias() {
  const { data } = await supabase
    .from('noticias')
    .select('id, titulo, status, categoria, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  return data ?? [];
}

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-yellow-100 text-yellow-800',
  publicada: 'bg-green-100 text-green-800',
  arquivada: 'bg-gray-100 text-gray-700',
};

export default async function AdminDashboard() {
  const [stats, ultimas] = await Promise.all([getStats(), getUltimasNoticias()]);

  const cards = [
    { label: 'Rascunhos', value: stats.rascunhos, color: 'border-yellow-400', href: '/admin/noticias?status=rascunho' },
    { label: 'Publicadas', value: stats.publicadas, color: 'border-green-500', href: '/admin/noticias?status=publicada' },
    { label: 'Arquivadas', value: stats.arquivadas, color: 'border-gray-400', href: '/admin/noticias?status=arquivada' },
    { label: 'Banners Ativos', value: stats.banners, color: 'border-primary', href: '/admin/banners' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/noticias" className="btn-primary text-sm">
            Gerenciar Notícias
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`bg-white rounded-xl border-l-4 ${card.color} p-5 shadow-sm hover:shadow-md transition-shadow`}
          >
            <p className="text-sm text-muted font-medium">{card.label}</p>
            <p className="text-4xl font-extrabold text-ink mt-1">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Últimas notícias */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-ink">Últimas Notícias Recebidas</h2>
          <Link href="/admin/noticias" className="text-sm text-primary hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {ultimas.length === 0 ? (
            <p className="px-6 py-8 text-muted text-center">Nenhuma notícia ainda.</p>
          ) : (
            ultimas.map((n) => (
              <div key={n.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{n.titulo}</p>
                  <p className="text-xs text-muted mt-0.5 capitalize">{n.categoria} · {new Date(n.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`badge-categoria ${STATUS_COLORS[n.status]}`}>{n.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cron info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-primary mb-2">Cron RSS</h3>
        <p className="text-sm text-ink mb-3">
          O endpoint <code className="bg-blue-100 px-1 rounded">/api/cron/rss</code> busca notícias dos feeds RSS e as reescreve com IA.
          Configure-o no Vercel com o header <code className="bg-blue-100 px-1 rounded">x-cron-secret</code>.
        </p>
        <p className="text-xs text-muted">Sugestão de frequência: a cada 30 minutos.</p>
      </div>
    </div>
  );
}
