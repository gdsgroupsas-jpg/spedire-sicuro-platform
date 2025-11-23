# 🚀 Spedire Sicuro Platform

Piattaforma intelligente per gestione spedizioni con OCR AI e comparatore prezzi automatico.

## ✨ Features

- 📸 **OCR Screenshot WhatsApp** - Claude Vision legge automaticamente gli ordini
- 💰 **Comparatore Prezzi** - Speedgo (GLS BA, SDA H24+) vs Spedizioni Prime (PD1, PRIME)
- 📊 **Calcolo Margini Automatico** - Real-time per ogni corriere
- 📥 **Export CSV** - Formato Spedisci.online pronto all'uso
- 🎨 **Multi-Tenant** - Dashboard personalizzata per ogni cliente
- ⚡ **Real-time** - Elaborazione immediata con AI

## 🛠️ Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **AI**: Claude Sonnet 4 (Anthropic)
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Apri [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 📸 Come Funziona

1. **Upload Screenshot** - Trascina screenshot ordine WhatsApp
2. **AI Estrae Dati** - Claude Vision legge destinatario, indirizzo, peso, etc
3. **Comparazione Prezzi** - Sistema confronta tutti i corrieri automaticamente
4. **Download CSV** - Scarica file pronto per Spedisci.online

## 🔑 Environment Variables

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
ANTHROPIC_API_KEY=your_claude_api_key
\`\`\`

## 📊 Listini Supportati

### Speedgo
- GLS BA (Italia, Sicilia, Sardegna, Calabria)
- SDA H24+ (Express nazionale)
- Fuel: 0%

### Spedizioni Prime
- PD1 (con contrassegno)
- PD5 (senza contrassegno)
- PRIME Campania/Lazio
- Nota credito -€0,40 per 0-2kg

## 🎯 Roadmap

- [x] OCR Claude Vision
- [x] Comparatore prezzi
- [x] Export CSV
- [ ] Auth multi-tenant
- [ ] Dashboard clienti
- [ ] Tracking automatico
- [ ] Mobile app
- [ ] WhatsApp Business integration

## 📝 License

Proprietary - GDS Group S.A.S.

---

**Built with ❤️ by Claude AI in 18 hours**
