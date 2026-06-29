import { supabase } from '@/lib/supabase';
import { Noticia } from '@/lib/types';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CardNoticia from '@/components/CardNoticia';

export const revalidate = 300;

async function getNoticia(slug: string): Promise<Noticia | null> {
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'publicada')
    .maybeSingle();
  return data as Noticia | null;
}

async function getRelacionadas(categoria: string, id: string): Promise<Noticia[]> {
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('status', 'publicada')
    .eq('categoria', categoria)
    .neq('id', id)
    .order('published_at', { ascending: false })
    .limit(3);
  return (data ?? []) as Noticia[];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const noticia = await getNoticia(params.slug);
  if (!noticia) return { title: 'Notícia não encontrada' };

  return {
    title: noticia.seo_title ?? noticia.titulo,
    description: noticia.seo_description ?? noticia.resumo,
    openGraph: {
      title: noticia.seo_title ?? noticia.titulo,
      description: noticia.seo_description ?? noticia.resumo,
      images: noticia.imagem_url ? [{ url: noticia.imagem_url }] : [],
      type: 'article',
      publishedTime: noticia.published_at ?? noticia.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: noticia.seo_title ?? noticia.titulo,
      description: noticia.seo_description ?? noticia.resumo,
      images: noticia.imagem_url ? [noticia.imagem_url] : [],
    },
  };
}

export default async function NoticiaPage({
  params,
}: {
  params: { slug: string };
}) {
  const noticia = await getNoticia(params.slug);
  if (!noticia) notFound();

  const relacionadas = await getRelacionadas(noticia.categoria, noticia.id);
  const dataFormatada = new Date(noticia.published_at ?? noticia.created_at).toLocaleDateString(
    'pt-BR',
    { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-4 flex items-center gap-2">
        <Link href="/" className="hover:text-primary">Início</Link>
        <span>/</span>
        <Link href={`/${noticia.categoria}`} className="hover:text-primary capitalize">
          {noticia.categoria}
        </Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{noticia.titulo}</span>
      </nav>

      <article>
        {/* Categoria badge */}
        <Link
          href={`/${noticia.categoria}`}
          className="inline-block badge-categoria bg-primary text-white mb-3 hover:bg-blue-700 transition-colors"
        >
          {noticia.categoria}
        </Link>

        {/* Título */}
        <h1 className="text-3xl lg:text-4xl font-extrabold text-ink leading-tight mb-4">
          {noticia.titulo}
        </h1>

        {/* Resumo */}
        <p className="text-xl text-muted leading-relaxed mb-6 border-l-4 border-primary pl-4">
          {noticia.resumo}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted mb-6 pb-6 border-b border-border">
          <time dateTime={noticia.published_at ?? noticia.created_at}>{dataFormatada}</time>
          {noticia.fonte_url && (
            <>
              <span>·</span>
              <a
                href={noticia.fonte_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                Ver fonte original
              </a>
            </>
          )}
        </div>

        {/* Imagem principal */}
        {noticia.imagem_url && (
          <figure className="mb-8">
            <div className="relative w-full h-72 lg:h-96 rounded-xl overflow-hidden">
              <Image
                src={noticia.imagem_url}
                alt={noticia.titulo}
                fill
                className="object-cover"
                priority
              />
            </div>
          </figure>
        )}

        {/* Conteúdo */}
        <div
          className="news-content text-ink text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
        />
      </article>

      {/* Relacionadas */}
      {relacionadas.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="section-title">Relacionadas em {noticia.categoria}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relacionadas.map((n) => (
              <CardNoticia key={n.id} noticia={n} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
