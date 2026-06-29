import { createPublicClient } from '@/lib/supabase'
import NoticiaCard from '@/components/public/NoticiaCard'
import PopupBanner from '@/components/public/PopupBanner'
import SidebarBanner from '@/components/public/SidebarBanner'
import WidgetCopa from '@/components/public/WidgetCopa'
import PrevisaoTempo from '@/components/public/PrevisaoTempo'
import type { Noticia, Banner } from '@/lib/types'

export const revalidate = 60 // Revalidate every minute

async function getDestaques(): Promise<Noticia[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('status', 'published')
    .eq('destaque', true)
    .order('publicado_em', { ascending: false })
    .limit(3)
  return data ?? []
}

async function getUltimasNoticias(): Promise<Noticia[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('status', 'published')
    .order('publicado_em', { ascending: false })
    .limit(30)
  return data ?? []
}

async function getNoticiasByCategory(categoria: string, limit = 4): Promise<Noticia[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('status', 'published')
    .eq('categoria', categoria)
    .order('publicado_em', { ascending: false })
    .limit(limit)
  return data ?? []
}

async function getMaisVistas(): Promise<Noticia[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('status', 'published')
    .order('visualizacoes', { ascending: false })
    .limit(6)
  return data ?? []
}

async function getActiveBanner(tipo: 'popup'): Promise<Banner | null> {
  const supabase = createPublicClient()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('tipo', tipo)
    .eq('ativo', true)
    .or(`expirado_em.is.null,expirado_em.gt.${now}`)
    .order('criado_em', { ascending: false })
    .limit(1)
    .single()
  return data ?? null
}

export default async function HomePage() {
  const [destaques, ultimasNoticias, popup, politica, economia, esporte, maisVistas] = await Promise.all([
    getDestaques(),
    getUltimasNoticias(),
    getActiveBanner('popup'),
    getNoticiasByCategory('Política'),
    getNoticiasByCategory('Economia'),
    getNoticiasByCategory('Esporte'),
    getMaisVistas(),
  ])

  // Filter out destaques from latest to avoid duplicates
  const destaqueIds = new Set(destaques.map((n) => n.id))
  const recentNotFeatured = ultimasNoticias.filter((n) => !destaqueIds.has(n.id))

  return (
    <>
      {popup && <PopupBanner banner={popup} />}

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* ── Highlights ───────────────────────────────────────── */}
        {destaques.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-800 rounded inline-block" />
              Destaques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destaques.map((n, i) => (
                <NoticiaCard key={n.id} noticia={n} variant="highlight" />
              ))}
            </div>
          </section>
        )}

        {/* ── Main grid ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest news */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-800 rounded inline-block" />
              Últimas Notícias
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentNotFeatured.slice(0, 12).map((n) => (
                <NoticiaCard key={n.id} noticia={n} />
              ))}
            </div>
          </div>

          {/* Sidebar: more recent + sidebar banner */}
          <aside className="space-y-4">
            <WidgetCopa />
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent rounded inline-block" />
              Mais Recentes
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
              {recentNotFeatured.slice(12, 18).map((n) => (
                <NoticiaCard key={n.id} noticia={n} variant="horizontal" />
              ))}
            </div>
            <SidebarBanner />
          </aside>
        </section>

        {/* ── Mais Vistas ──────────────────────────────────────── */}
        {maisVistas.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-800 rounded inline-block" />
              Notícias Mais Vistas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {maisVistas.map((n) => (
                <div key={n.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                  <NoticiaCard noticia={n} variant="horizontal" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Previsão do tempo ────────────────────────────────── */}
        <PrevisaoTempo />

        {/* ── Category sections ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Política */}
          {politica.length > 0 && (
            <CategorySection title="Política" href="/política" noticias={politica} />
          )}
          {/* Economia */}
          {economia.length > 0 && (
            <CategorySection title="Economia" href="/economia" noticias={economia} />
          )}
          {/* Esporte */}
          {esporte.length > 0 && (
            <CategorySection title="Esporte" href="/esporte" noticias={esporte} />
          )}
        </div>
      </div>
    </>
  )
}

function CategorySection({
  title,
  href,
  noticias,
}: {
  title: string
  href: string
  noticias: Noticia[]
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-800 rounded inline-block" />
          {title}
        </h2>
        <a href={href} className="text-xs text-blue-700 font-medium hover:underline">
          Ver tudo →
        </a>
      </div>
      <div className="divide-y divide-gray-50">
        {noticias.map((n) => (
          <NoticiaCard key={n.id} noticia={n} variant="compact" />
        ))}
      </div>
    </section>
  )
}
