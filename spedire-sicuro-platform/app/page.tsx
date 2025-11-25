import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
    console.error("⚠️ Errore check sessione home:", error);
  }

  // Se c'è una sessione, vai alla dashboard
  if (session) {
    redirect('/dashboard');
  }

  // Altrimenti vai al login
  redirect('/login');
}
