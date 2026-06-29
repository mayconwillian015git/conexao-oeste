import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Noticia } from '@/lib/types'

interface NoticiaCardProps {
  noticia: Noticia
  variant?: 'default' | 'highlight' | 'compact' | 'horizontal'
}

function CategoryBadge({ categoria }: { categoria: string }) {
  return (
    <span className="inline-block bg-blue-800 text-white text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
      {categoria}
    </span>
  )
}

function TimeAgo({ date }: { date: string }) {
  return (
    <time
      dateTime={date}
      className="text-xs text-gray-500"
    >
      {formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })}
    </time>
  )
}

export default function NoticiaCard({ noticia, variant = 'default' }: NoticiaCardProps) {
  const publishedAt = noticia.publicado_em ?? noticia.criado_em

  // ── Highlight (large) ────────────────────────────────────────
  if (variant === 'highlight') {
    return (
      <Link href={`/noticia/${noticia.slug}`} className="group block relative overflow-hidden rounded-xl shadow-lg h-80">
        <div className="relative h-80 bg-gray-200">
          {noticia.imagem_url ? (
            <Image
              src={noticia.imagem_url}
              alt={noticia.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ objectPosition: noticia.imagem_posicao ?? '50% 50%' }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-800 to-blue-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <CategoryBadge categoria={noticia.categoria} />
          <h2 className="mt-2 text-xl font-bold text-white leading-snug group-hover:text-blue-200 transition-colors line-clamp-3">
            {noticia.titulo}
          </h2>
          <p className="mt-1 text-gray-300 text-sm line-clamp-2">{noticia.resumo}</p>
          <TimeAgo date={publishedAt!} />
        </div>
      </Link>
    )
  }

  // ── Horizontal (sidebar / list) ──────────────────────────────
  if (variant === 'horizontal') {
    return (
      <Link href={`/noticia/${noticia.slug}`} className="group flex gap-3 items-start">
        <div className="relative w-20 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-200">
          {noticia.imagem_url ? (
            <Image
              src={noticia.imagem_url}
              alt={noticia.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              style={{ objectPosition: noticia.imagem_posicao ?? '50% 50%' }}
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full bg-blue-100" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-800 transition-colors line-clamp-2 leading-snug">
            {noticia.titulo}
          </h3>
          <TimeAgo date={publishedAt!} />
        </div>
      </Link>
    )
  }

  // ── Compact (list item) ──────────────────────────────────────
  if (variant === 'compact') {
    return (
      <Link href={`/noticia/${noticia.slug}`} className="group block border-b border-gray-100 py-3 last:border-0">
        <CategoryBadge categoria={noticia.categoria} />
        <h3 className="mt-1 text-sm font-semibold text-gray-900 group-hover:text-blue-800 transition-colors line-clamp-2">
          {noticia.titulo}
        </h3>
        <TimeAgo date={publishedAt!} />
      </Link>
    )
  }

  // ── Default card ──────────────────────────────────────────────
  return (
    <Link href={`/noticia/${noticia.slug}`} className="group block rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow bg-white">
      <div className="relative h-48 bg-gray-200">
        {noticia.imagem_url ? (
          <Image
            src={noticia.imagem_url}
            alt={noticia.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ objectPosition: noticia.imagem_posicao ?? '50% 50%' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <span className="text-blue-300 text-4xl font-bold">CO</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <CategoryBadge categoria={noticia.categoria} />
        <h3 className="mt-2 text-base font-bold text-gray-900 group-hover:text-blue-800 transition-colors line-clamp-2 leading-snug">
          {noticia.titulo}
        </h3>
        {noticia.resumo && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{noticia.resumo}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <TimeAgo date={publishedAt!} />
          {noticia.autor && (
            <span className="text-xs text-gray-500">{noticia.autor}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
