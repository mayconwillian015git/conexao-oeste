import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { scrapeArticleFromUrl } from '@/lib/url-scraper'
import { rewriteArticle, buildUrlImportPrompt } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body as { url: string }

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 })
    }

    // ── 1. Scrape URL ─────────────────────────────────────────
    const scraped = await scrapeArticleFromUrl(url)

    // ── 2. Call Claude API ────────────────────────────────────
    const prompt = buildUrlImportPrompt(url, scraped.titulo, scraped.conteudo, scraped.nomeFonte)
    const article = await rewriteArticle(prompt)

    const adminClient = createAdminClient()

    // ── 3. Ensure slug uniqueness ─────────────────────────────
    let slug = article.slug
    const { data: existing } = await adminClient
      .from('noticias')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    // ── 4. Insert into noticias ───────────────────────────────
    const { data: noticia, error: insertError } = await adminClient
      .from('noticias')
      .insert({
        titulo: article.titulo,
        slug,
        resumo: article.resumo,
        conteudo: article.conteudo,
        categoria: article.categoria,
        imagem_url: scraped.imagemUrl ?? null,
        status: 'pending_review',
        origem: 'importacao_url',
        destaque: false,
        fonte_original_url: url,
        fonte_original_nome: scraped.nomeFonte,
        meta_title: article.meta_title,
        meta_description: article.meta_description,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      noticiaId: noticia.id,
      titulo: noticia.titulo,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[importar-url] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
