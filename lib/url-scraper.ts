// Extract article title and body from a URL using Cheerio
// Runs SERVER-SIDE only (API route)

export interface ScrapedArticle {
  titulo: string
  conteudo: string
  nomeFonte: string
  imagemUrl?: string
}

const SOURCE_SELECTORS: Record<
  string,
  { titulo: string; conteudo: string; nome: string }
> = {
  'oesteoagora.com.br': {
    titulo: 'h1',
    conteudo: '.entry-content, .post-content, .td-post-content, article',
    nome: 'Oeste Agora',
  },
  'extremooeste.com.br': {
    titulo: 'h1',
    conteudo: '.post_body, .entry-content, .post-content, article',
    nome: 'Extremo Oeste',
  },
}

function detectSource(url: string) {
  for (const [domain, selectors] of Object.entries(SOURCE_SELECTORS)) {
    if (url.includes(domain)) return selectors
  }
  return {
    titulo: 'h1',
    conteudo: 'article, .article-body, .post-content, main',
    nome: new URL(url).hostname.replace('www.', ''),
  }
}

export async function scrapeArticleFromUrl(url: string): Promise<ScrapedArticle> {
  const cheerio = await import('cheerio')

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  })

  if (!res.ok) {
    throw new Error(`Falha ao buscar URL: ${res.status} ${res.statusText}`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)

  // Imagem og:image (antes de remover elementos)
  const imagemUrl = $('meta[property="og:image"]').attr('content') || undefined

  // Remove elementos desnecessários
  $('script, style, nav, footer, header, aside, .ad, .advertisement, .social-share, .related, .tags').remove()

  const selectors = detectSource(url)

  // Título: tenta seletor específico, depois og:title, depois <title>
  let titulo = $(selectors.titulo).first().text().trim()
  if (!titulo) titulo = $('meta[property="og:title"]').attr('content') ?? ''
  if (!titulo) titulo = $('title').text().trim()

  // Remove sufixo do site do título (ex: " - Portal Extremo Oeste")
  titulo = titulo.replace(/\s*[-|]\s*(Portal\s+)?.*?(Oeste|Agora|News).*$/i, '').trim()

  if (!titulo) {
    throw new Error('Não foi possível extrair o título da URL')
  }

  // Conteúdo
  let conteudo = $(selectors.conteudo).first().text().trim()
  if (!conteudo || conteudo.length < 100) {
    // fallback: maior bloco de texto da página
    let maxLen = 0
    $('div, section, article').each((_, el) => {
      const text = $(el).text().trim()
      if (text.length > maxLen) {
        maxLen = text.length
        conteudo = text
      }
    })
  }

  return {
    titulo,
    conteudo: conteudo || titulo,
    nomeFonte: selectors.nome,
    imagemUrl,
  }
}
