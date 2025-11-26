"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, FileSpreadsheet, Search, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from '@/lib/utils';

// Tipi definiti inline per sicurezza
type ListinoRow = {
  id: string;
  corriere: string;
  nome_servizio: string;
  peso_min: number;
  peso_max: number;
  prezzo: number;
  zona: string;
  tempi_consegna: string;
};

export default function ListiniManager() {
  const supabase = createClient();
  const [isUploading, setIsUploading] = useState(false);
  const [listini, setListini] = useState<ListinoRow[]>([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, couriers: 0 });

  const fetchListini = async () => {
    const { data, error } = await supabase
      .from('listini_corrieri')
      .select('*')
      .order('prezzo', { ascending: true }); // Default sort by cheapest

    if (data) {
      // Map Supabase data to ListinoRow
      // Assuming Supabase schema matches or needs mapping
      // Based on schema: corriere, nome_servizio (or servizio), zona (or zone_coperte array?), peso_min, peso_max, prezzo (or inside fasce?)
      // The schema in types.ts is complex (JSONB for dati_listino). 
      // The new simplified schema proposed in supabase-fix.sql matches ListinoRow better.
      // If the new schema is applied, data will match directly.
      // If not, this might break until migration is run.
      // Let's assume the migration WILL be run.
      const mappedListini = data.map((d: any) => ({
          id: d.id,
          corriere: d.corriere,
          nome_servizio: d.nome_servizio || d.servizio,
          peso_min: d.peso_min,
          peso_max: d.peso_max,
          prezzo: d.prezzo,
          zona: d.zona || 'ITA',
          tempi_consegna: d.tempi_consegna
      }));
      setListini(mappedListini);
      
      // Calcolo stats live
      const uniqueCouriers = new Set(mappedListini.map((d: ListinoRow) => d.corriere)).size;
      setStats({ total: mappedListini.length, couriers: uniqueCouriers });
    }
  };

  useEffect(() => {
    fetchListini();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Usiamo l'API server-side per parsing sicuro
      const response = await fetch('/api/listini/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Upload fallito');

      await fetchListini();
      alert(`✅ Successo! Importate ${result.count} righe.`);
    } catch (error) {
      console.error(error);
      alert("❌ Errore nell'upload. Verifica che il CSV abbia le colonne: peso_min, peso_max, prezzo, corriere.");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const filteredListini = listini.filter(l => 
    (l.corriere && l.corriere.toLowerCase().includes(search.toLowerCase())) ||
    (l.nome_servizio && l.nome_servizio.toLowerCase().includes(search.toLowerCase())) ||
    (l.zona && l.zona.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDeleteAll = async () => {
    if(!confirm("Sei sicuro? Cancellerai TUTTI i listini.")) return;
    await supabase.from('listini_corrieri').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Trick per delete all
    await fetchListini();
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-full text-white">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tariffe Attive</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-full text-white">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Corrieri</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.couriers}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-dashed border-2 border-gray-300 hover:border-amber-500 transition-colors cursor-pointer relative overflow-hidden group">
          <input 
            type="file" 
            accept=".csv,.xlsx" 
            onChange={handleFileUpload}
            disabled={isUploading}
            className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full"
          />
          <CardContent className="p-0 h-full flex flex-col items-center justify-center text-gray-500 group-hover:text-amber-600 group-hover:bg-amber-50/50 transition-all">
            {isUploading ? (
              <div className="flex flex-col items-center animate-pulse">
                <Upload className="h-8 w-8 mb-2 animate-bounce" />
                <span className="font-medium">AI Processing...</span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mb-2" />
                <span className="font-medium">Carica CSV Listino</span>
                <span className="text-xs text-gray-400 mt-1">Drag & Drop supportato</span>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tools Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Cerca per corriere, zona o servizio..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="destructive" size="sm" onClick={handleDeleteAll}>
          <Trash2 className="h-4 w-4 mr-2" /> Reset Listini
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Corriere</th>
                <th className="px-6 py-3">Servizio</th>
                <th className="px-6 py-3">Zona</th>
                <th className="px-6 py-3 text-center">Peso (Kg)</th>
                <th className="px-6 py-3 text-right">Prezzo</th>
                <th className="px-6 py-3 text-right">Consegna</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredListini.map((row) => (
                  <motion.tr 
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {/* Logo placeholder dinamico */}
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                          {row.corriere ? row.corriere.substring(0,2) : '??'}
                        </div>
                        {row.corriere}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{row.nome_servizio}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {row.zona}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-gray-500">
                      {row.peso_min} - {row.peso_max}
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-amber-600">
                      {formatCurrency(row.prezzo)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500">
                      {row.tempi_consegna || "24/48h"}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredListini.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
                      <p>Nessun listino trovato</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
