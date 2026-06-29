import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { extractDocxText } from '@/lib/docx-extract'
import { rewriteArticle, buildPrefeituraPrompt } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const municipio = formData.get('municipio') as string
    const docxFile = formData.get('docx') as File | null
    const photos = formData.getAll('photos') as File[]

    if (!municipio) {
      return NextResponse.json({ error: 'Municipality is required' }, { status: 400 })
    }

    if (!docxFile) {
      return NextResponse.json({ error: 'DOCX file is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // ── 1. Extract text from .docx ───────────────────────────
    const docxBuffer = Buffer.from(await docxFile.arrayBuffer())
    const docxText = await extractDocxText(docxBuffer)

    if (!docxText || docxText.length < 50) {
      return NextResponse.json({ error: 'Could not extract text from DOCX file' }, { status: 400 })
    }

    // ── 2. Upload photos to Supabase Storage ──────────────────
    const uploadedPhotoUrls: string[] = []

    for (const photo of photos) {
      const ext = photo.name.split('.').pop() ?? 'jpg'
      const fileName = `prefeitura/${municipio.toLowerCase()}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const photoBuffer = Buffer.from(await photo.arrayBuffer())

      const { error: uploadError } = await adminClient.storage
        .from('noticias')
        .upload(fileName, photoBuffer, {
          contentType: photo.type || 'image/jpeg',
          upsert: false,
        })

      if (uploadError) {
        console.error('[importar-prefeitura] Photo upload error:', uploadError)
        continue
      }

      const { data: { publicUrl } } = adminClient.storage
        .from('noticias')
        .getPublicUrl(fileName)

      uploadedPhotoUrls.push(publicUrl)
    }

    // ── 3. Call Claude API ────────────────────────────────────
    const prompt = buildPrefeituraPrompt(municipio, docxText, uploadedPhotoUrls)
    const article = await rewriteArticle(prompt)

    // ── 4. Ensure slug uniqueness ─────────────────────────────
    let slug = article.slug
    const { data: existing } = await adminClient
      .from('noticias')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    // ── 5. Insert into noticias ───────────────────────────────
    const { data: noticia, error: insertError } = await adminClient
      .from('noticias')
      .insert({
        titulo: article.titulo,
        slug,
        resumo: article.resumo,
        conteudo: article.conteudo,
        categoria: article.categoria,
        imagem_url: uploadedPhotoUrls[0] ?? null,
        status: 'pending_review',
        origem: 'prefeitura',
        destaque: false,
        cidade_prefeitura: municipio,
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
      fotosUploaded: uploadedPhotoUrls.length,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[importar-prefeitura] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
