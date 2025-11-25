import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MarketingHome from '@/components/MarketingHome';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let session = null;

  try {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data } = await supabase.auth.getSession();
    session = data.session;

  } catch (error) {
    // Se Supabase fallisce, non mostrare pagina errore, mostra la Home Marketing
    console.error("⚠️ Errore check sessione home:", error);
  }

  // Redirect SOLO se siamo sicuri al 100% della sessione
  if (session) {
    redirect('/dashboard');
  }

  // Altrimenti mostra la Home Marketing
  return <MarketingHome />;
}
