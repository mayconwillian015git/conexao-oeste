import { createClient } from '@supabase/supabase-js'
import type { Noticia, FonteBusca, Banner, LogProcessamento } from './types'

// ─── Database type helper ─────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      noticias: {
        Row: Noticia
        Insert: Omit<Noticia, 'id' | 'criado_em' | 'atualizado_em'>
        Update: Partial<Omit<Noticia, 'id' | 'criado_em'>>
      }
      fontes_busca: {
        Row: FonteBusca
        Insert: Omit<FonteBusca, 'id' | 'criado_em'>
        Update: Partial<Omit<FonteBusca, 'id' | 'criado_em'>>
      }
      banners: {
        Row: Banner
        Insert: Omit<Banner, 'id' | 'criado_em'>
        Update: Partial<Omit<Banner, 'id' | 'criado_em'>>
      }
      log_processamento: {
        Row: LogProcessamento
        Insert: Omit<LogProcessamento, 'id' | 'criado_em'>
        Update: never
      }
    }
  }
}

// ─── Public client (anon key) – use in React Server Components / client ──────
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createClient<Database>(url, key)
}

// ─── Admin / server-only client (service role) – NEVER expose to browser ────
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ─── Singleton public client (lazy) ──────────────────────────
let _publicClient: ReturnType<typeof createPublicClient> | null = null

export function getPublicClient() {
  if (!_publicClient) {
    _publicClient = createPublicClient()
  }
  return _publicClient
}
