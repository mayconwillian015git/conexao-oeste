import { supabase } from '@/lib/supabase';
import { Noticia, Banner } from '@/lib/types';
import CardNoticia from '@/components/CardNoticia';
import PopupBanner from '@/components/PopupBanner';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 60;

async function getNoticias(busca?: string): Promise<Noticia[]> {
  let query = supabase
    .from('noticias')
    .select('*')
    .eq('status', 'publicada')
    .order('published_at', { ascending: false })
    .limit(20);

  if (busca) {
    query = query.or(`titulo.ilike.%${busca}%,resumo.ilike.%${busca}%`);
  }

  const { data } = await query;
  return (data ?? []) as Noticia[];
}

async function getBannerAtivo(): Promise<Banner | null> {
  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('ativo', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as Banner | null;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { busca?: string };
}) {
  const [noticias, banner] = await Promise.all([
    getNoticias(searchParams.busca),
    getBannerAtivo(),
  ]);

  const [destaque, ...restantes] = noticias;
  const secundarias = restantes.slice(0, 3);
  const sidebar = restantes.slice(3, 9);
  const mais = restantes.slice(9);

  return (
    <>
      <PopupBanner banner={banner} />

      {searchParams.busca && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-ink">
            Resultados para: <span className="text-primary">&ldquo;{searchParams.busca}&rdquo;</span>
          </h2>
          <p className="text-muted text-sm mt-1">{noticias.length} notícia(s) encontrada(s)</p>
        </div>
      )}

      {noticias.length === 0 && (
        <div className="text-center py-20 text-muted">
          <p className="text-lg">Nenhuma notícia encontrada.</p>
          <Link href="/" className="text-primary hover:underline mt-2 inline-block">
            Voltar ao início
          </Link>
        </div>
      )}

      {!searchParams.busca && destaque && (
        <section className="mb-8">
          {/* Destaque principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Link href={`/noticia/${destaque.slug}`} className="group block card overflow-hidden">
                <div className="relative h-72 lg:h-96 w-full bg-primary-light overflow-hidden">
                  {destaque.imagem_url ? (
                    <Image
                      src={destaque.imagem_url}
                      alt={destaque.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="badge-categoria bg-accent text-white mb-2">
                      {destaque.categoria}
                    </span>
                    <h1 className="text-white text-2xl lg:text-3xl font-bold leading-tight line-clamp-3 group-hover:text-primary-light transition-colors">
                      {destaque.titulo}
                    </h1>
                    <p className="text-gray-300 text-sm mt-2 line-clamp-2">{destaque.resumo}</p>
                    <p className="text-gray-400 text-xs mt-3">
                      {new Date(destaque.published_at ?? destaque.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Sidebar de notícias recentes */}
            <aside className="flex flex-col gap-4">
              <h2 className="section-title">Mais Recentes</h2>
              {sidebar.map((n) => (
                <CardNoticia key={n.id} noticia={n} variant="compact" />
              ))}
            </aside>
          </div>

          {/* Grid secundário */}
          {secundarias.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {secundarias.map((n) => (
                <CardNoticia key={n.id} noticia={n} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Grid quando há busca ativa */}
      {searchParams.busca && noticias.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {noticias.map((n) => (
            <CardNoticia key={n.id} noticia={n} />
          ))}
        </div>
      )}

      {/* Mais notícias */}
      {!searchParams.busca && mais.length > 0 && (
        <section className="mt-8">
          <h2 className="section-title">Mais Notícias</h2>
          <div className="flex flex-col gap-4">
            {mais.map((n) => (
              <CardNoticia key={n.id} noticia={n} variant="horizontal" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
