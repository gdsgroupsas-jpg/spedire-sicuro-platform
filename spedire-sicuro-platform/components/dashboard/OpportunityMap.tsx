'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map, LocateFixed, TrendingUp } from 'lucide-react'

export function OpportunityMap() {
  return (
    <Card className="col-span-full lg:col-span-3 h-[400px] relative overflow-hidden bg-slate-950 text-white border-slate-800 shadow-2xl group">
      
      {/* Header Overlay */}
      <CardHeader className="absolute top-0 left-0 z-20 w-full bg-gradient-to-b from-black/90 via-black/50 to-transparent pb-12">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-yellow-400 mb-1">
              <Map className="h-5 w-5" />
              Geointelligence Attiva
            </CardTitle>
            <p className="text-xs text-slate-400">Visualizzazione real-time densità spedizioni e zone calde</p>
          </div>
          <div className="flex gap-2">
             <div className="bg-white/10 hover:bg-white/20 p-2 rounded-md cursor-pointer transition-colors">
                <LocateFixed className="h-4 w-4 text-white" />
             </div>
             <div className="bg-white/10 hover:bg-white/20 p-2 rounded-md cursor-pointer transition-colors">
                <TrendingUp className="h-4 w-4 text-green-400" />
             </div>
          </div>
        </div>
      </CardHeader>

      {/* Map Visualization (CSS Art / Placeholder) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black opacity-80"></div>
      
      {/* Simulated Map Grid */}
      <div className="absolute inset-0" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Data Points (Simulated) */}
      <div className="absolute inset-0">
         {/* Milano Cluster */}
         <div className="absolute top-[30%] left-[45%] group-hover:scale-110 transition-transform duration-500">
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-pulse" />
            <div className="absolute -top-8 left-4 bg-black/80 text-[10px] px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
               Milano: +15% Vol.
            </div>
         </div>

         {/* Roma Cluster */}
         <div className="absolute top-[55%] left-[50%] group-hover:scale-110 transition-transform duration-500 delay-100">
            <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce" />
         </div>

         {/* Napoli Cluster */}
         <div className="absolute top-[65%] left-[55%]">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
         </div>
         
         {/* Connection Lines (SVG) */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <path d="M 45% 30% Q 55% 40% 50% 55%" stroke="white" fill="none" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
            <path d="M 50% 55% Q 48% 60% 55% 65%" stroke="white" fill="none" strokeDasharray="4 4" />
         </svg>
      </div>

      {/* Stats Overlay Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-12">
        <div className="grid grid-cols-3 gap-4 text-center">
           <div>
              <div className="text-2xl font-bold text-white">1,284</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Spedizioni Nord</div>
           </div>
           <div>
              <div className="text-2xl font-bold text-white">856</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Spedizioni Centro</div>
           </div>
           <div>
              <div className="text-2xl font-bold text-white">642</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Spedizioni Sud</div>
           </div>
        </div>
      </div>
    </Card>
  )
}
