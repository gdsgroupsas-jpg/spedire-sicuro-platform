export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-500 via-yellow-600 to-green-700 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl">
              <span className="text-6xl">📦</span>
            </div>
          </div>

          {/* Titolo */}
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">
            SPEDIRE SICURO
          </h1>
          <p className="text-3xl text-yellow-200 font-semibold">
            🚀 Gestione Spedizioni AI-Powered
          </p>
          
          {/* Descrizione */}
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Piattaforma intelligente per la gestione automatizzata delle spedizioni
            con OCR Claude Vision, comparatore prezzi dinamico e integrazione database.
          </p>

          {/* Cards Funzionalità */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <a 
              href="/dashboard"
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
              <div className="text-6xl mb-4">📷</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Dashboard OCR
              </h2>
              <p className="text-yellow-100 text-lg">
                Upload screenshot WhatsApp e estrai automaticamente tutti i dati della spedizione con AI
              </p>
            </a>
            
            <a 
              href="/listini"
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Gestione Listini
              </h2>
              <p className="text-yellow-100 text-lg">
                Carica e gestisci listini prezzi corrieri in formato CSV o Excel
              </p>
            </a>
          </div>

          {/* Features List */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">
              ✨ Funzionalità Principali
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/90">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl mb-2">🤖</div>
                <p className="font-semibold">OCR Claude Vision</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl mb-2">💰</div>
                <p className="font-semibold">Comparatore Prezzi</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl mb-2">📊</div>
                <p className="font-semibold">Database Supabase</p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-white/70 text-sm">
            <p>GDS Group S.A.S. • POSTAexpress • Spedire Sicuro</p>
            <p className="mt-2">Powered by Claude AI + Next.js 14</p>
          </div>
        </div>
      </div>
    </div>
  );
}
