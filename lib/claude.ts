import Anthropic from '@anthropic-ai/sdk'
import type { AIArticleResponse } from './types'

// ─── Generic article rewrite ──────────────────────────────────
export async function rewriteArticle(
  prompt: string
): Promise<AIArticleResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada. Verifique o .env.local e reinicie o servidor.')
  }

  const anthropic = new Anthropic({ apiKey })

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text content')
  }

  // Extract JSON from the response (Claude may wrap it in ```json blocks)
  const raw = textBlock.text
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/(\{[\s\S]*\})/)

  if (!jsonMatch) {
    throw new Error('Claude response did not contain valid JSON')
  }

  const parsed: AIArticleResponse = JSON.parse(jsonMatch[1])

  // Garantir slug sem acentos ou caracteres especiais
  if (parsed.slug) {
    parsed.slug = parsed.slug
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100)
  }

  return parsed
}

// ─── Prompt builders ──────────────────────────────────────────

export function buildRSSPrompt(
  titulo: string,
  conteudo: string,
  fonte: string
): string {
  return `Você é o editor do portal de notícias regional "Conexão Oeste", que cobre o Oeste do Paraná.

Recebeu o seguinte artigo via RSS de "${fonte}":

TÍTULO ORIGINAL: ${titulo}

CONTEÚDO ORIGINAL:
${conteudo}

Sua tarefa é reescrever este artigo de forma original, com linguagem jornalística clara e objetiva para o público do Oeste do Paraná. NÃO copie trechos do texto original – reescreva com suas próprias palavras.

Retorne APENAS um JSON válido (sem markdown externo) com a seguinte estrutura:
{
  "titulo": "Título reescrito, atrativo e direto",
  "slug": "slug-do-titulo-em-kebab-case",
  "resumo": "Resumo de 2-3 frases para listagem",
  "conteudo": "Artigo completo em HTML simples (use <p>, <h2>, <strong>, <em>, <ul>, <li>). Mínimo 300 palavras.",
  "categoria": "Uma das categorias: Política, Economia, Saúde, Educação, Segurança, Esporte, Cultura, Meio Ambiente, Brasil, Mundo, Tecnologia, Geral",
  "meta_title": "Título SEO (máx 60 caracteres)",
  "meta_description": "Descrição SEO (máx 155 caracteres)"
}`
}

export function buildPrefeituraPrompt(
  municipio: string,
  conteudo: string,
  fotosUrls: string[]
): string {
  const fotosRef =
    fotosUrls.length > 0
      ? `\nAs seguintes fotos foram enviadas (já salvas): ${fotosUrls.join(', ')}`
      : ''

  return `Você é o editor do portal "Conexão Oeste". Recebeu um comunicado oficial da Prefeitura de ${municipio}.

CONTEÚDO DO DOCUMENTO:
${conteudo}
${fotosRef}

Transforme este comunicado em uma notícia jornalística bem redigida sobre ${municipio}. Use tom informativo, não publicitário. Mantenha os fatos do documento original. Ao final do conteúdo, inclua obrigatoriamente: "<p><em>Fonte: Assessoria de Imprensa da Prefeitura de ${municipio}.</em></p>"

Retorne APENAS um JSON válido com a estrutura:
{
  "titulo": "Título da notícia",
  "slug": "slug-em-kebab-case",
  "resumo": "Resumo de 2-3 frases",
  "conteudo": "Artigo em HTML (use <p>, <h2>, <strong>). Mínimo 250 palavras. Inclua crédito ao final.",
  "categoria": "Prefeitura",
  "meta_title": "Título SEO (máx 60 caracteres)",
  "meta_description": "Descrição SEO (máx 155 caracteres)"
}`
}

export function buildUrlImportPrompt(
  url: string,
  titulo: string,
  conteudo: string,
  nomeFonte: string
): string {
  return `Você é o editor do portal "Conexão Oeste". Importou um artigo do site "${nomeFonte}" (${url}).

TÍTULO ORIGINAL: ${titulo}

CONTEÚDO ORIGINAL:
${conteudo}

Reescreva este artigo de forma original para o Conexão Oeste. IMPORTANTE: ao final do conteúdo, inclua um parágrafo de crédito visível, por exemplo: "<p><em>Com informações de <a href="${url}">${nomeFonte}</a>.</em></p>"

Retorne APENAS um JSON válido com a estrutura:
{
  "titulo": "Título reescrito",
  "slug": "slug-em-kebab-case",
  "resumo": "Resumo de 2-3 frases",
  "conteudo": "Artigo em HTML incluindo crédito ao final. Mínimo 250 palavras.",
  "categoria": "Uma das: Política, Economia, Saúde, Educação, Segurança, Esporte, Cultura, Meio Ambiente, Regional, Brasil, Mundo, Tecnologia, Geral",
  "meta_title": "Título SEO (máx 60 caracteres)",
  "meta_description": "Descrição SEO (máx 155 caracteres)"
}`
}
