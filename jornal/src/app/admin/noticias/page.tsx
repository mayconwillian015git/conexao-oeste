'use client';

import { useEffect, useState, useCallback } from 'react';
import { Noticia, NoticiaStatus, CATEGORIAS } from '@/lib/types';
import AdminTable from '@/components/AdminTable';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-yellow-100 text-yellow-800',
  publicada: 'bg-green-100 text-green-800',
  arquivada: 'bg-gray-100 text-gray-700',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<NoticiaStatus | 'todas'>('todas');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [loading, setLoading] = useState(true);
  const [acao, setAcao] = useState<string | null>(null);

  const carregarNoticias = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/noticias');
    const data = await res.json();
    setNoticias(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregarNoticias();
  }, [carregarNoticias]);

  async function atualizarStatus(id: string, status: NoticiaStatus) {
    setAcao(id);
    await fetch(`/api/noticias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await carregarNoticias();
    setAcao(null);
  }

  const filtradas = noticias.filter((n) => {
    if (filtroStatus !== 'todas' && n.status !== filtroStatus) return false;
    if (filtroCategoria !== 'todas' && n.categoria !== filtroCategoria) return false;
    return true;
  });

  const columns = [
    {
      key: 'titulo',
      label: 'Título',
      render: (n: Noticia) => (
        <div className="max-w-xs">
          <p className="font-medium text-ink line-clamp-2 text-sm">{n.titulo}</p>
          <Link
            href={`/noticia/${n.slug}`}
            target="_blank"
            className="text-xs text-primary hover:underline"
          >
            /noticia/{n.slug}
          </Link>
        </div>
      ),
    },
    {
      key: 'categoria',
      label: 'Categoria',
      render: (n: Noticia) => (
        <span className="capitalize text-sm">{n.categoria}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (n: Noticia) => (
        <span className={`badge-categoria ${STATUS_COLORS[n.status]}`}>{n.status}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (n: Noticia) => (
        <span className="text-sm text-muted whitespace-nowrap">{formatDate(n.created_at)}</span>
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (n: Noticia) => (
        <div className="flex gap-2 flex-wrap">
          {n.status !== 'publicada' && (
            <button
              onClick={() => atualizarStatus(n.id, 'publicada')}
              disabled={acao === n.id}
              className="text-xs bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Publicar
            </button>
          )}
          {n.status !== 'rascunho' && (
            <button
              onClick={() => atualizarStatus(n.id, 'rascunho')}
              disabled={acao === n.id}
              className="text-xs bg-yellow-500 text-white px-2.5 py-1 rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              Rascunho
            </button>
          )}
          {n.status !== 'arquivada' && (
            <button
              onClick={() => atualizarStatus(n.id, 'arquivada')}
              disabled={acao === n.id}
              className="text-xs bg-gray-500 text-white px-2.5 py-1 rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Arquivar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Notícias</h1>
        <p className="text-sm text-muted">{filtradas.length} notícia(s)</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as NoticiaStatus | 'todas')}
          className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="todas">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="publicada">Publicada</option>
          <option value="arquivada">Arquivada</option>
        </select>

        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="todas">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted">Carregando...</div>
      ) : (
        <AdminTable data={filtradas} columns={columns} pageSize={15} />
      )}
    </div>
  );
}
