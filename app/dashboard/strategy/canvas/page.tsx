// Business Model Canvas Page
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, X } from 'lucide-react';
import type { BusinessCanvasItem, CanvasSegment } from '@/lib/types/strategy';
import { CANVAS_SEGMENT_LABELS } from '@/lib/types/strategy';

interface CanvasFormData {
  id?: string;
  segment: CanvasSegment;
  title: string;
  description: string;
}

export default function BusinessCanvasPage() {
  const [items, setItems] = useState<BusinessCanvasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<BusinessCanvasItem | null>(null);
  const [formData, setFormData] = useState<CanvasFormData>({
    segment: 'value_propositions',
    title: '',
    description: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      const res = await fetch('/api/strategy/canvas');
      const data = await res.json();
      setItems(data.data || []);
    } catch (error) {
      console.error('Error loading canvas items:', error);
    } finally {
      setLoading(false);
    }
  }

  function openDialog(segment: CanvasSegment, item?: BusinessCanvasItem) {
    if (item) {
      setEditing(item);
      setFormData({
        id: item.id,
        segment: item.segment,
        title: item.title,
        description: item.description || '',
      });
    } else {
      setEditing(null);
      setFormData({
        segment,
        title: '',
        description: '',
      });
    }
    setShowDialog(true);
  }

  async function handleSave() {
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { ...formData, id: editing.id } : formData;

      const res = await fetch('/api/strategy/canvas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save');

      await loadItems();
      setShowDialog(false);
      setEditing(null);
    } catch (error) {
      console.error('Error saving canvas item:', error);
      alert('Errore durante il salvataggio');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questo elemento?')) return;

    try {
      const res = await fetch(`/api/strategy/canvas?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');
      await loadItems();
    } catch (error) {
      console.error('Error deleting canvas item:', error);
    }
  }

  function getItemsBySegment(segment: CanvasSegment) {
    return items.filter((item) => item.segment === segment);
  }

  function SegmentCell({ segment, className = '' }: { segment: CanvasSegment; className?: string }) {
    const segmentItems = getItemsBySegment(segment);
    const colors = {
      key_partners: 'bg-blue-50 border-blue-200',
      key_activities: 'bg-purple-50 border-purple-200',
      key_resources: 'bg-green-50 border-green-200',
      value_propositions: 'bg-red-50 border-red-200',
      customer_relationships: 'bg-orange-50 border-orange-200',
      channels: 'bg-yellow-50 border-yellow-200',
      customer_segments: 'bg-pink-50 border-pink-200',
      cost_structure: 'bg-gray-50 border-gray-300',
      revenue_streams: 'bg-emerald-50 border-emerald-200',
    };

    return (
      <div className={`${colors[segment]} border-2 rounded-lg p-4 min-h-[200px] ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">
            {CANVAS_SEGMENT_LABELS[segment]}
          </h3>
          <button
            onClick={() => openDialog(segment)}
            className="p-1 hover:bg-white rounded transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {segmentItems.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Vuoto</p>
          ) : (
            segmentItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded p-2 shadow-sm text-xs group hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    {item.description && (
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openDialog(segment, item)}
                      className="p-1 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="h-3 w-3 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-[600px] bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/strategy" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Model Canvas</h1>
            <p className="text-gray-600 mt-1">Visualizza e gestisci il tuo modello di business</p>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-700">{items.length} elementi</span>
      </div>

      {/* Canvas Grid */}
      <div className="grid grid-cols-5 gap-4">
        {/* Row 1 */}
        <SegmentCell segment="key_partners" className="row-span-2" />
        <SegmentCell segment="key_activities" />
        <SegmentCell segment="value_propositions" className="row-span-2" />
        <SegmentCell segment="customer_relationships" />
        <SegmentCell segment="customer_segments" className="row-span-2" />

        {/* Row 2 */}
        <SegmentCell segment="key_resources" />
        <SegmentCell segment="channels" />

        {/* Row 3 */}
        <SegmentCell segment="cost_structure" className="col-span-2" />
        <div className="col-span-1"></div>
        <SegmentCell segment="revenue_streams" className="col-span-2" />
      </div>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {editing ? 'Modifica' : 'Aggiungi'} Elemento
              </h2>
              <button onClick={() => setShowDialog(false)} className="p-2 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Segmento</label>
                <select
                  value={formData.segment}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value as CanvasSegment })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {(Object.keys(CANVAS_SEGMENT_LABELS) as CanvasSegment[]).map((seg) => (
                    <option key={seg} value={seg}>{CANVAS_SEGMENT_LABELS[seg]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Titolo *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDialog(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.title.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {editing ? 'Salva' : 'Aggiungi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
