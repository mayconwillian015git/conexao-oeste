// Currents API wrapper – https://currentsapi.services
// Free plan: ~600 requests/day

export interface CurrentsArticle {
  id: string
  title: string
  description: string
  url: string
  author: string
  image: string
  language: string
  category: string[]
  published: string
}

interface CurrentsResponse {
  status: string
  news: CurrentsArticle[]
}

export async function fetchCurrentsNews(keywords?: string): Promise<CurrentsArticle[]> {
  const apiKey = process.env.CURRENTS_API_KEY
  if (!apiKey) {
    console.warn('[Currents] CURRENTS_API_KEY not set, skipping')
    return []
  }

  const params = new URLSearchParams({
    apiKey,
    language: 'pt',
    country: 'BR',
    ...(keywords ? { keywords } : {}),
  })

  try {
    const res = await fetch(
      `https://api.currentsapi.services/v1/search?${params.toString()}`,
      { next: { revalidate: 0 } }
    )

    if (!res.ok) {
      console.error('[Currents] API error:', res.status, await res.text())
      return []
    }

    const data: CurrentsResponse = await res.json()
    return data.news ?? []
  } catch (error) {
    console.error('[Currents] Fetch error:', error)
    return []
  }
}

export function currentsArticleToRSSItem(article: CurrentsArticle) {
  return {
    title: article.title,
    link: article.url,
    content: article.description,
    pubDate: article.published,
    source: article.author || 'Agência Brasil',
    imageUrl: article.image && article.image !== 'None' ? article.image : undefined,
  }
}
