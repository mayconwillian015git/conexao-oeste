import Image from 'next/image';
import Link from 'next/link';
import { Noticia } from '@/lib/types';

const CATEGORIA_COLORS: Record<string, string> = {
  brasil: 'bg-green-100 text-green-800',
  mundo: 'bg-blue-100 text-blue-800',
  economia: 'bg-yellow-100 text-yellow-800',
  esportes: 'bg-orange-100 text-orange-800',
  tecnologia: 'bg-purple-100 text-purple-800',
  entretenimento: 'bg-pink-100 text-pink-800',
  ciencia: 'bg-teal-100 text-teal-800',
  saude: 'bg-red-100 text-red-800',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface CardNoticiaProps {
  noticia: Noticia;
  variant?: 'default' | 'horizontal' | 'compact';
}

export default function CardNoticia({ noticia, variant = 'default' }: CardNoticiaProps) {
  const colorClass = CATEGORIA_COLORS[noticia.categoria] ?? 'bg-gray-100 text-gray-800';
  const date = noticia.published_at ?? noticia.created_at;

  if (variant === 'compact') {
    return (
      <Link href={`/noticia/${noticia.slug}`} className="flex gap-3 group">
        {noticia.imagem_url && (
          <div className="relative w-20 h-16 flex-shrink-0 rounded overflow-hidden">
            <Image
              src={noticia.imagem_url}
              alt={noticia.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className={`badge-categoria ${colorClass} mb-1`}>{noticia.categoria}</span>
          <h3 className="text-sm font-semibold text-ink leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {noticia.titulo}
          </h3>
          <p className="text-xs text-muted mt-1">{formatDate(date)}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/noticia/${noticia.slug}`} className="card flex gap-4 p-4 group">
        {noticia.imagem_url && (
          <div className="relative w-32 h-24 flex-shrink-0 rounded overflow-hidden">
            <Image
              src={noticia.imagem_url}
              alt={noticia.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className={`badge-categoria ${colorClass} mb-2`}>{noticia.categoria}</span>
          <h3 className="font-semibold text-ink leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {noticia.titulo}
          </h3>
          <p className="text-sm text-muted mt-1 line-clamp-2">{noticia.resumo}</p>
          <p className="text-xs text-muted mt-2">{formatDate(date)}</p>
        </div>
      </Link>
    );
  }

  // default card
  return (
    <Link href={`/noticia/${noticia.slug}`} className="card group flex flex-col">
      <div className="relative h-48 w-full overflow-hidden bg-primary-light">
        {noticia.imagem_url ? (
          <Image
            src={noticia.imagem_url}
            alt={noticia.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-white opacity-20">
              {noticia.titulo.charAt(0)}
            </span>
          </div>
        )}
        <span className={`badge-categoria ${colorClass} absolute top-2 left-2`}>
          {noticia.categoria}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-ink leading-snug line-clamp-3 group-hover:text-primary transition-colors mb-2">
          {noticia.titulo}
        </h3>
        <p className="text-sm text-muted line-clamp-3 flex-1">{noticia.resumo}</p>
        <p className="text-xs text-muted mt-3 pt-3 border-t border-border">{formatDate(date)}</p>
      </div>
    </Link>
  );
}
