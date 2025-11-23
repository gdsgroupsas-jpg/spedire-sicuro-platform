import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('⚠️ Supabase Environment Variables missing in Client!', { url: !!url, key: !!key })
  }

  return createBrowserClient(
    url!,
    key!
  )
}
