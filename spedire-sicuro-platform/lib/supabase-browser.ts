import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached client if available
  if (supabaseClient) {
    return supabaseClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time, provide mock values to prevent errors
  // At runtime, the actual environment variables will be used
  const safeUrl = url || 'https://placeholder.supabase.co'
  const safeKey = key || 'placeholder-key'

  if (!url || !key) {
    if (typeof window !== 'undefined') {
      console.error('⚠️ Supabase Environment Variables missing in Client!', { url: !!url, key: !!key })
    }
  }

  supabaseClient = createBrowserClient(safeUrl, safeKey)
  return supabaseClient
}
