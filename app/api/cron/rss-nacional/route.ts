import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { fetchRSSFeed, normalizeTitle } from '@/lib/rss'
import { fetchCurrentsNews, currentsArticleToRSSItem } from '@/lib/currents'
import { rewriteArticle, buildRSSPrompt } from '@/lib/claude'
import { subHours, startOfDay } from 'date-fns'

export const maxDuration = 300

const DAILY_LIMIT = 10 // máximo de notícias processadas por dia

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const summary = {
    rssFeeds: 0,
    currentsArticles: 0,
    processed: 0,
    skippedDuplicate: 0,
    skippedDailyLimit: 0,
    errors: 0,
    inserted: [] as string[],
  }

  try {
    // ── 1. Verificar quantas notícias já foram inseridas hoje ──
    const todayStart = startOfDay(new Date()).toISOString()
    const { count: todayCount } = await supabase
      .from('noticias')
      .select('id', { count: 'exact', head: true })
      .eq('origem', 'ia_nacional')
      .gte('criado_em', todayStart)

    const remaining = DAILY_LIMIT - (todayCount ?? 0)

    if (remaining <= 0) {
      return NextResponse.json({
        success: true,
        summary: { ...summary, message: `Limite diário de ${DAILY_LIMIT} já atingido.` },
      })
    }

    // ── 2. Buscar fontes RSS ───────────────────────────────────
    const { data: fontes, error: fontesError } = await supabase
      .from('fontes_busca')
      .select('*')
      .eq('ativo', true)
      .eq('tipo', 'rss')

    if (fontesError) throw fontesError

    const allItems: Array<{
      title: string
      link: string
      content: string
      source: string
      imageUrl?: string
    }> = []

    for (const fonte of fontes ?? []) {
      const items = await fetchRSSFeed(fonte.url, fonte.nome)
      allItems.push(...items)
      summary.rssFeeds++
    }

    // ── 3. Buscar da Currents API ──────────────────────────────
    const currentItems = await fetchCurrentsNews()
    summary.currentsArticles = currentItems.length
    allItems.push(...currentItems.map(currentsArticleToRSSItem))

    // ── 4. Checar duplicatas (últimas 48h) ────────────────────
    const since48h = subHours(new Date(), 48).toISOString()
    const { data: recentNoticias } = await supabase
      .from('noticias')
      .select('titulo')
      .gte('criado_em', since48h)

    const recentTitlesNormalized = new Set(
      (recentNoticias ?? []).map((n) => normalizeTitle(n.titulo))
    )

    // ── 5. Processar até o limite restante do dia ─────────────
    let processedCount = 0

    for (const item of allItems) {
      if (processedCount >= remaining) {
        summary.skippedDailyLimit++
        continue
      }

      if (!item.title || !item.content) continue

      const normalizedTitle = normalizeTitle(item.title)
      if (recentTitlesNormalized.has(normalizedTitle)) {
        summary.skippedDuplicate++
        continue
      }

      try {
        const prompt = buildRSSPrompt(item.title, item.content, item.source)
        const article = await rewriteArticle(prompt)

        let slug = article.slug
        const { data: existing } = await supabase
          .from('noticias')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()

        if (existing) slug = `${slug}-${Date.now()}`

        const { data: inserted, error: insertError } = await supabase
          .from('noticias')
          .insert({
            titulo: article.titulo,
            slug,
            resumo: article.resumo,
            conteudo: article.conteudo,
            categoria: article.categoria,
            imagem_url: item.imageUrl ?? null,
            status: 'pending_review',
            origem: 'ia_nacional',
            destaque: false,
            fonte_original_url: item.link,
            fonte_original_nome: item.source,
            meta_title: article.meta_title,
            meta_description: article.meta_description,
          })
          .select('id')
          .single()

        if (insertError) throw insertError

        recentTitlesNormalized.add(normalizedTitle)
        summary.processed++
        processedCount++
        summary.inserted.push(inserted?.id ?? '')

        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[cron/rss] Erro:', item.title, '|', msg)
        summary.errors++
      }
    }

    // ── 6. Log ────────────────────────────────────────────────
    await supabase.from('log_processamento').insert({
      tipo: 'cron_rss_nacional',
      status: summary.errors === 0 ? 'success' : 'warning',
      mensagem: `${summary.processed} inseridas, ${summary.skippedDuplicate} duplicatas, ${summary.errors} erros`,
      detalhes: summary as unknown as Record<string, unknown>,
    })

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    await supabase.from('log_processamento').insert({
      tipo: 'cron_rss_nacional',
      status: 'error',
      mensagem: errMsg,
      detalhes: { error: errMsg },
    })
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
