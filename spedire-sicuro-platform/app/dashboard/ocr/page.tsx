'use client';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Componenti UI richiesti
import { SpedizioneArricchita } from '@/lib/types'; // Assumendo l'esistenza di un tipo arricchito con i campi profitto

// NOTA: Dropzone component omesso per brevità, si assume il suo funzionamento è corretto.

export default function OCRScannerPage() {
    // Stato: file selezionato, dati risultanti (estratti + prezzi), loading, errore
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<SpedizioneArricchita[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileDrop = useCallback((uploadedFile: File) => {
        if (uploadedFile.size > 10 * 1024 * 1024) { 
            setError("File troppo grande. Max 10MB.");
            return;
        }
        setFile(uploadedFile);
        setError(null);
        setData(null);
    }, []);

    const processOCR = async () => {
        if (!file) {
            setError("Seleziona prima un file da processare.");
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const formData = new FormData();
            formData.append('image', file);

            // Chiamata all'API unificata (OCR Extractor + Price Logic)
            const response = await fetch('/api/ocr', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                 // Cattura l'errore che si vedeva nell'immagine
                 throw new Error(result.error || result.details || "Errore sconosciuto durante l'estrazione.");
            }

            setData(result.data); 
            setFile(null);
            
        } catch (err: any) {
            setError(`CRITICO: ${err.message || String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = async () => {
        if (!data || data.length === 0) return;
        
        try {
            const response = await fetch('/api/csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shipments: data }),
            });

            if (response.ok) {
                // 2. Gestione download file CSV
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `spedizioni_ocr_${new Date().toISOString().slice(0,10)}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                setError("Errore durante la generazione del CSV.");
            }
        } catch (e) {
             setError("Errore di rete durante download CSV.");
        }
    };
    
    // Funzione per formattare il Contrassegno (XX.XX€) e il Margine
    const formatCurrency = (value: string | number) => {
        const num = parseFloat(String(value));
        return isNaN(num) ? "N/A" : num.toFixed(2) + "€";
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl">OCR Scanner</CardTitle>
                    <p className="text-sm text-gray-500">
                        L'AI estrarrà e calcolerà il profitto ottimale in tempo reale.
                    </p>
                </CardHeader>
                <CardContent>
                    {/* ... Dropzone e File Selected UI (come nel codice precedente) ... */}
                    
                    {!file && !data && (
                        <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed border-yellow-300 rounded-lg bg-yellow-50/50 relative">
                             <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleFileDrop(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <Upload className="w-10 h-10 text-yellow-500" />
                            <p className="mt-2 text-sm text-gray-600">
                                Trascina screenshot o clicca per selezionare
                            </p>
                            <Button className="mt-4 pointer-events-none">
                                Carica file
                            </Button>
                        </div>
                    )}

                    {file && !loading && !data && (
                        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-slate-50">
                            <p className="mb-4 font-medium text-slate-700">File selezionato: {file.name}</p>
                            <div className="flex gap-3">
                                <Button onClick={processOCR} className="bg-blue-600 hover:bg-blue-700">
                                    🚀 Avvia Analisi AI
                                </Button>
                                <Button variant="outline" onClick={() => setFile(null)}>
                                    Annulla
                                </Button>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center p-12">
                            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
                            <p className="mt-4 text-lg text-slate-600">Analisi immagine e calcolo profitti in corso...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="mt-4 p-3 border border-red-500 rounded-md bg-red-50 text-red-700 flex items-center">
                            <X className="w-5 h-5 mr-2" />
                            <p className="text-sm">ERRORE: {error}</p> 
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* PHASE 2: RISULTATI E TABELLA DI PROFITTO (MARKETING/CFO VISUALIZATION) */}
            {data && data.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center text-xl">
                            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                            {data.length} Spedizioni Analizzate
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button 
                                onClick={downloadCSV} 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={loading}
                            >
                                Scarica CSV per spedisci.online
                            </Button>
                            <Button variant="outline" onClick={() => { setData(null); setFile(null); }}>
                                Nuova Scansione
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead>Destinatario</TableHead>
                                        <TableHead>Città/CAP</TableHead>
                                        <TableHead>Contrassegno (Entrata)</TableHead>
                                        <TableHead>Corriere Ottimale</TableHead>
                                        <TableHead>Costo Spedizione</TableHead>
                                        <TableHead className="text-right">💰 Margine Netto</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((shipment, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {shipment.destinatario}
                                                <div className="text-xs text-gray-500 truncate">{shipment.indirizzo}</div>
                                            </TableCell>
                                            <TableCell>{shipment.localita} ({shipment.provincia}) - {shipment.cap}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(shipment.contrassegno || 0)}</TableCell>
                                            <TableCell className="font-bold text-yellow-600">{shipment.corriere_ottimale || 'N/A'}</TableCell>
                                            <TableCell>{formatCurrency(shipment.costo_corriere || 'N/A')}</TableCell>
                                            <TableCell 
                                                className={`text-right font-bold text-lg ${
                                                    (parseFloat(String(shipment.margine || '0')) > 0 ? 'text-green-600' : 'text-red-600')
                                                }`}
                                            >
                                                {formatCurrency(shipment.margine || 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
