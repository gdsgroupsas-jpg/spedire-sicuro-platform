// Mission & Vision Editor Page
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Target,
  Eye,
  Heart,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import type { CompanyStrategy } from '@/lib/types/strategy';

export default function MissionVisionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [strategy, setStrategy] = useState<CompanyStrategy | null>(null);
  const [formData, setFormData] = useState({
    mission: '',
    vision: '',
    values: [] as string[],
    elevator_pitch: '',
    tagline: '',
  });
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    loadStrategy();
  }, []);

  async function loadStrategy() {
    try {
      setLoading(true);
      const res = await fetch('/api/strategy/mission-vision');
      const data = await res.json();

      if (data.data) {
        setStrategy(data.data);
        setFormData({
          mission: data.data.mission || '',
          vision: data.data.vision || '',
          values: data.data.values || [],
          elevator_pitch: data.data.elevator_pitch || '',
          tagline: data.data.tagline || '',
        });
      }
    } catch (error) {
      console.error('Error loading strategy:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const method = strategy ? 'PUT' : 'POST';
      const body = strategy
        ? { ...formData, id: strategy.id }
        : formData;

      const res = await fetch('/api/strategy/mission-vision', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('Failed to save strategy');
      }

      const data = await res.json();
      setStrategy(data.data);

      alert('Mission e Vision salvate con successo!');
    } catch (error) {
      console.error('Error saving strategy:', error);
      alert('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  }

  function addValue() {
    if (newValue.trim()) {
      setFormData({
        ...formData,
        values: [...formData.values, newValue.trim()],
      });
      setNewValue('');
    }
  }

  function removeValue(index: number) {
    setFormData({
      ...formData,
      values: formData.values.filter((_, i) => i !== index),
    });
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/strategy"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mission & Vision
            </h1>
            <p className="text-gray-600 mt-1">
              Definisci la missione, visione e valori della tua azienda
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Salva
            </>
          )}
        </button>
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mission</h2>
            <p className="text-sm text-gray-600">
              Perché esiste la tua azienda? Qual è il suo scopo?
            </p>
          </div>
        </div>

        <textarea
          value={formData.mission}
          onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
          placeholder="Es: La nostra missione è semplificare la logistica per le PMI italiane, offrendo una piattaforma intelligente che confronta automaticamente i prezzi dei corrieri e garantisce il miglior rapporto qualità-prezzo."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Vision Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Eye className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Vision</h2>
            <p className="text-sm text-gray-600">
              Dove vuoi arrivare? Qual è il futuro che immagini?
            </p>
          </div>
        </div>

        <textarea
          value={formData.vision}
          onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
          placeholder="Es: Diventare il punto di riferimento nazionale per l'ottimizzazione dei costi di spedizione, rendendo accessibile a tutte le imprese italiane una tecnologia di livello enterprise."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Values Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Heart className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Valori</h2>
            <p className="text-sm text-gray-600">
              Quali principi guidano le tue decisioni e comportamenti?
            </p>
          </div>
        </div>

        {/* Values List */}
        {formData.values.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.values.map((value, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full"
              >
                <span className="text-sm text-green-800">{value}</span>
                <button
                  onClick={() => removeValue(index)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Value Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addValue()}
            placeholder="Es: Trasparenza, Innovazione, Eccellenza"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={addValue}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Aggiungi
          </button>
        </div>
      </div>

      {/* Elevator Pitch Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Elevator Pitch</h2>
            <p className="text-sm text-gray-600">
              Presenta la tua azienda in 30 secondi (opzionale)
            </p>
          </div>
        </div>

        <textarea
          value={formData.elevator_pitch}
          onChange={(e) =>
            setFormData({ ...formData, elevator_pitch: e.target.value })
          }
          placeholder="Es: Spedire Sicuro è la piattaforma che ti aiuta a risparmiare sulle spedizioni. Carica una foto dell'ordine WhatsApp, il nostro AI estrae i dati e confronta automaticamente i prezzi di tutti i corrieri. Risparmio medio del 30% garantito."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Tagline Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-pink-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tagline</h2>
            <p className="text-sm text-gray-600">
              Una frase breve e memorabile (opzionale, max 100 caratteri)
            </p>
          </div>
        </div>

        <input
          type="text"
          value={formData.tagline}
          onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
          placeholder="Es: Spedisci smart, risparmia sempre"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.tagline.length}/100 caratteri
        </p>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Suggerimenti</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• <strong>Mission:</strong> Concentrati sul presente e sul "perché" esisti</li>
          <li>• <strong>Vision:</strong> Immagina il futuro che vuoi creare (3-5 anni)</li>
          <li>• <strong>Valori:</strong> Scegli 3-5 principi fondamentali che guidano l'azienda</li>
          <li>• <strong>Elevator Pitch:</strong> Spiega cosa fai, per chi e perché sei unico</li>
        </ul>
      </div>
    </div>
  );
}
