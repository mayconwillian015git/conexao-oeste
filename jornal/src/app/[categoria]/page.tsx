import { supabase } from '@/lib/supabase';
import { Noticia, CATEGORIAS } from '@/lib/types';
import CardNoticia from '@/components/CardNoticia';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateStaticParams() {
  return CATEGORIAS.map((cat) => ({ categoria: cat }));
}

export async function generateMetadata({
  params,
}: {
  params: { categoria: string };
}): Promise<Metadata> {
  const categoria = params.categoria;
  const nome = categoria.charAt(0).toUpperCase() + categoria.slice(1);
  return {
    title: nome,
    description: `Últimas notícias de ${nome} no Jornal Online.`,
  };
}

async function getNoticiasPorCategoria(categoria: string): Promise<Noticia[]> {
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('status', 'publicada')
    .eq('categoria', categoria)
    .order('published_at', { ascending: false })
    .limit(30);
  return (data ?? []) as Noticia[];
}

export default async function CategoriaPage({
  params,
}: {
  params: { categoria: string };
}) {
  if (!CATEGORIAS.includes(params.categoria as (typeof CATEGORIAS)[number])) {
    notFound();
  }

  const noticias = await getNoticiasPorCategoria(params.categoria);
  const nome = params.categoria.charAt(0).toUpperCase() + params.categoria.slice(1);

  return (
    <div>
      <div className="mb-6 pb-4 border-b-2 border-primary">
        <h1 className="text-3xl font-extrabold text-ink">{nome}</h1>
        <p className="text-muted mt-1">
          {noticias.length} notícia(s) publicada(s)
        </p>
      </div>

      {noticias.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p className="text-lg">Nenhuma notícia publicada nesta categoria ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((noticia) => (
            <CardNoticia key={noticia.id} noticia={noticia} />
          ))}
        </div>
      )}
    </div>
  );
}
