import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-400 to-blue-900">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-8 bg-white rounded-full p-4">
            <Image 
              src="/logo.jpg" 
              alt="Spedire Sicuro" 
              width={200} 
              height={200}
              className="rounded-full"
            />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            SPEDIRE SICURO PLATFORM
          </h1>
          
          <p className="text-2xl text-yellow-300 mb-8">
            🚀 Gestione Spedizioni con AI
          </p>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-6">
              ⚡ In Costruzione - LIVE Progress
            </h2>
            
            <div className="text-left space-y-4 text-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <span>Setup Next.js + TypeScript</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <span>Tailwind CSS + Configurazione</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <span>Logo Spedire Sicuro caricato</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <span>Supabase Integration...</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <span>Claude Vision OCR...</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <span>Dashboard Multi-Cliente...</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <span>Comparatore Prezzi...</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-400 text-blue-900 rounded-lg font-bold">
              🔥 Tempo stimato completamento: 18 ore
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
