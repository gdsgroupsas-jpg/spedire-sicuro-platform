import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached client if available
  if (supabaseClient) {
    return supabaseClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check for missing environment variables
  if (!url || !key) {
    // During build time (SSR), use placeholder values to prevent build failures
    // At runtime, if env vars are still missing, the app won't work properly
    const isBuildTime = typeof window === 'undefined'
    
    if (!isBuildTime) {
      // Runtime warning - this is a critical configuration issue
      console.error('⚠️ CRITICAL: Supabase Environment Variables missing!', { 
        url: !!url, 
        key: !!key,
        message: 'Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      })
    }
    
    // Use placeholder values to prevent crashes during build
    supabaseClient = createBrowserClient(
      url || 'https://placeholder.supabase.co',
      key || 'placeholder-key'
    )
    return supabaseClient
  }

  supabaseClient = createBrowserClient(url, key)
  return supabaseClient
}
