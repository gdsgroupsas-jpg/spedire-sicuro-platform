// SWOT Analysis Page
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import type { SwotAnalysisItem, SwotCategory } from '@/lib/types/strategy';
import { SWOT_CATEGORY_CONFIG } from '@/lib/types/strategy';

interface SwotFormData {
  id?: string;
  category: SwotCategory;
  title: string;
  description: string;
  impact_score: number;
  probability_score: number;
}

export default function SwotAnalysisPage() {
  const [items, setItems] = useState<SwotAnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<SwotFormData | null>(null);
  const [formData, setFormData] = useState<SwotFormData>({
    category: 'strengths',
    title: '',
    description: '',
    impact_score: 3,
    probability_score: 3,
  });

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      const res = await fetch('/api/strategy/swot');
      const data = await res.json();
      setItems(data.data || []);
    } catch (error) {
      console.error('Error loading SWOT items:', error);
    } finally {
      setLoading(false);
    }
  }

  function openDialog(category: SwotCategory, item?: SwotAnalysisItem) {
    if (item) {
      setEditing(item);
      setFormData({
        id: item.id,
        category: item.category,
        title: item.title,
        description: item.description || '',
        impact_score: item.impact_score || 3,
        probability_score: item.probability_score || 3,
      });
    } else {
      setEditing(null);
      setFormData({
        category,
        title: '',
        description: '',
        impact_score: 3,
        probability_score: 3,
      });
    }
    setShowDialog(true);
  }

  async function handleSave() {
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing
        ? { ...formData, id: editing.id }
        : formData;

      const res = await fetch('/api/strategy/swot', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save');

      await loadItems();
      setShowDialog(false);
      setEditing(null);
    } catch (error) {
      console.error('Error saving SWOT item:', error);
      alert('Errore durante il salvataggio');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questo elemento?')) return;

    try {
      const res = await fetch(`/api/strategy/swot?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      await loadItems();
    } catch (error) {
      console.error('Error deleting SWOT item:', error);
      alert('Errore durante l\'eliminazione');
    }
  }

  function getItemsByCategory(category: SwotCategory) {
    return items.filter((item) => item.category === category);
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
              Analisi SWOT
            </h1>
            <p className="text-gray-600 mt-1">
              Identifica punti di forza, debolezza, opportunità e minacce
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">
            {items.length} elementi totali
          </span>
        </div>
      </div>

      {/* SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(SWOT_CATEGORY_CONFIG) as SwotCategory[]).map((category) => {
          const config = SWOT_CATEGORY_CONFIG[category];
          const categoryItems = getItemsByCategory(category);

          return (
            <div
              key={category}
              className={`rounded-lg border-2 ${config.bgColor} border-gray-200 p-6 min-h-[400px]`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-xl font-bold ${config.color}`}>
                    {config.label}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {config.description}
                  </p>
                </div>
                <button
                  onClick={() => openDialog(category)}
                  className={`p-2 ${config.bgColor} ${config.color} rounded-lg hover:opacity-80 transition-opacity`}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {categoryItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">Nessun elemento</p>
                    <button
                      onClick={() => openDialog(category)}
                      className="text-xs mt-2 underline hover:no-underline"
                    >
                      Aggiungi il primo
                    </button>
                  </div>
                ) : (
                  categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {item.description}
                            </p>
                          )}

                          {/* Scores */}
                          {(item.impact_score || item.probability_score) && (
                            <div className="flex gap-3 text-xs">
                              {item.impact_score && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Impatto:</span>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                      <div
                                        key={n}
                                        className={`w-2 h-2 rounded-full ${
                                          n <= item.impact_score!
                                            ? config.color.replace('text-', 'bg-')
                                            : 'bg-gray-200'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                              {item.probability_score && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Probabilità:</span>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                      <div
                                        key={n}
                                        className={`w-2 h-2 rounded-full ${
                                          n <= item.probability_score!
                                            ? config.color.replace('text-', 'bg-')
                                            : 'bg-gray-200'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => openDialog(category, item)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editing ? 'Modifica' : 'Aggiungi'} Elemento SWOT
              </h2>
              <button
                onClick={() => setShowDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as SwotCategory })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {(Object.keys(SWOT_CATEGORY_CONFIG) as SwotCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {SWOT_CATEGORY_CONFIG[cat].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titolo *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Es: Piattaforma OCR con AI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrizione dettagliata..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Impatto (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.impact_score}
                    onChange={(e) =>
                      setFormData({ ...formData, impact_score: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Basso</span>
                    <span className="font-semibold text-gray-900">
                      {formData.impact_score}
                    </span>
                    <span>Alto</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probabilità (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.probability_score}
                    onChange={(e) =>
                      setFormData({ ...formData, probability_score: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Bassa</span>
                    <span className="font-semibold text-gray-900">
                      {formData.probability_score}
                    </span>
                    <span>Alta</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.title.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {editing ? 'Salva Modifiche' : 'Aggiungi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
