import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { scrapeArticleFromUrl } from '@/lib/url-scraper'
import { rewriteArticle, buildUrlImportPrompt } from '@/lib/claude'
import { fetchRSSFeed } from '@/lib/rss'

export const maxDuration = 300

const LIMITE_POR_EXECUCAO = 5

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const summary = {
    fontesVerificadas: 0,
    linksEncontrados: 0,
    processadas: 0,
    puladas: 0,
    erros: 0,
    inseridas: [] as string[],
  }

  try {
    // ── 1. Buscar fontes RSS ativas ────────────────────────────
    const { data: fontes, error: fontesError } = await supabase
      .from('fontes_busca')
      .select('*')
      .eq('ativo', true)
      .eq('tipo', 'rss')

    if (fontesError) throw fontesError
    if (!fontes?.length) {
      return NextResponse.json({ success: true, summary: { ...summary, message: 'Nenhuma fonte RSS ativa.' } })
    }

    // ── 2. URLs já importadas via portais ──────────────────────
    const { data: jaImportadas } = await supabase
      .from('noticias')
      .select('fonte_original_url')
      .in('origem', ['importacao_url', 'cron_portais'])
      .not('fonte_original_url', 'is', null)

    const urlsJaImportadas = new Set(
      (jaImportadas ?? []).map((n) => n.fonte_original_url as string)
    )

    // ── 3. Coletar links de artigos dos feeds RSS ──────────────
    const candidatos: Array<{ url: string; nome: string }> = []

    for (const fonte of fontes) {
      const items = await fetchRSSFeed(fonte.url, fonte.nome)
      summary.fontesVerificadas++

      for (const item of items) {
        if (!item.link) continue
        const link = item.link.split('#')[0].split('?')[0]
        if (!urlsJaImportadas.has(link)) {
          candidatos.push({ url: link, nome: fonte.nome })
          summary.linksEncontrados++
        }
      }
    }

    // ── 4. Embaralha para variar entre portais ─────────────────
    candidatos.sort(() => Math.random() - 0.5)

    // ── 5. Scrapa e reescreve até o limite ─────────────────────
    for (const { url, nome } of candidatos) {
      if (summary.processadas >= LIMITE_POR_EXECUCAO) break

      try {
        const scraped = await scrapeArticleFromUrl(url)

        if (!scraped.conteudo || scraped.conteudo.length < 100) {
          summary.puladas++
          continue
        }

        const prompt = buildUrlImportPrompt(url, scraped.titulo, scraped.conteudo, nome)
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
            imagem_url: scraped.imagemUrl ?? null,
            status: 'pending_review',
            origem: 'cron_portais',
            destaque: false,
            fonte_original_url: url,
            fonte_original_nome: nome,
            meta_title: article.meta_title,
            meta_description: article.meta_description,
          })
          .select('id')
          .single()

        if (insertError) throw insertError

        summary.processadas++
        summary.inseridas.push(inserted?.id ?? '')
        urlsJaImportadas.add(url)

        await new Promise((r) => setTimeout(r, 500))
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[cron/buscar-portais] Erro:', url, '|', msg)
        summary.erros++
      }
    }

    // ── 6. Log ────────────────────────────────────────────────
    await supabase.from('log_processamento').insert({
      tipo: 'cron_buscar_portais',
      status: summary.erros === 0 ? 'success' : 'warning',
      mensagem: `${summary.processadas} inseridas de ${summary.linksEncontrados} links novos em ${summary.fontesVerificadas} fontes`,
      detalhes: summary as unknown as Record<string, unknown>,
    })

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    await supabase.from('log_processamento').insert({
      tipo: 'cron_buscar_portais',
      status: 'error',
      mensagem: errMsg,
      detalhes: { error: errMsg },
    })
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
