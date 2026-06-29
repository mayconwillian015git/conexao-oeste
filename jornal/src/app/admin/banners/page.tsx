'use client';

import { useEffect, useState, useCallback } from 'react';
import { Banner } from '@/lib/types';
import Image from 'next/image';

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ imagem_url: '', link: '', ativo: false });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const carregarBanners = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/banners');
    const data = await res.json();
    setBanners(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregarBanners();
  }, [carregarBanners]);

  async function salvarBanner(e: React.FormEvent) {
    e.preventDefault();
    if (!form.imagem_url.trim()) {
      setErro('URL da imagem é obrigatória.');
      return;
    }
    setSalvando(true);
    setErro('');
    setSucesso('');
    const res = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSucesso('Banner criado com sucesso!');
      setForm({ imagem_url: '', link: '', ativo: false });
      await carregarBanners();
    } else {
      const d = await res.json();
      setErro(d.error ?? 'Erro ao criar banner.');
    }
    setSalvando(false);
  }

  async function toggleAtivo(banner: Banner) {
    await fetch(`/api/banners/${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !banner.ativo }),
    });
    await carregarBanners();
  }

  async function deletarBanner(id: string) {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;
    await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    await carregarBanners();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Banners / Pop-up</h1>

      {/* Formulário */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-ink mb-4">Novo Banner</h2>
        <form onSubmit={salvarBanner} className="flex flex-col gap-4 max-w-lg">
          <div>
            <label className="text-sm font-medium text-ink block mb-1">URL da Imagem *</label>
            <input
              type="url"
              value={form.imagem_url}
              onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
              placeholder="https://exemplo.com/banner.jpg"
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1">Link (opcional)</label>
            <input
              type="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://exemplo.com/pagina"
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-medium text-ink">Ativar imediatamente</span>
          </label>

          {erro && <p className="text-sm text-accent">{erro}</p>}
          {sucesso && <p className="text-sm text-green-600">{sucesso}</p>}

          <button type="submit" disabled={salvando} className="btn-primary self-start disabled:opacity-50">
            {salvando ? 'Salvando...' : 'Criar Banner'}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-ink">Banners Cadastrados</h2>
        </div>

        {loading ? (
          <p className="text-muted text-center py-8">Carregando...</p>
        ) : banners.length === 0 ? (
          <p className="text-muted text-center py-8">Nenhum banner cadastrado.</p>
        ) : (
          <div className="divide-y divide-border">
            {banners.map((banner) => (
              <div key={banner.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative w-32 h-20 rounded overflow-hidden bg-surface flex-shrink-0">
                  <Image
                    src={banner.imagem_url}
                    alt="Banner"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{banner.imagem_url}</p>
                  {banner.link && (
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {banner.link}
                    </a>
                  )}
                  <p className="text-xs text-muted mt-1">
                    Criado em {new Date(banner.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => toggleAtivo(banner)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      banner.ativo ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    title={banner.ativo ? 'Desativar' : 'Ativar'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        banner.ativo ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-muted">{banner.ativo ? 'Ativo' : 'Inativo'}</span>
                  <button
                    onClick={() => deletarBanner(banner.id)}
                    className="text-xs text-accent hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
