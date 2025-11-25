// Strategic Planning Hub - Main landing page
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Eye,
  TrendingUp,
  Grid3x3,
  DollarSign,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import type { BudgetAlert, MediaBudget } from '@/lib/types/strategy';

interface StrategyStats {
  missionVisionComplete: boolean;
  swotItemsCount: number;
  canvasItemsCount: number;
  currentBudget: MediaBudget | null;
  unreadAlerts: number;
}

export default function StrategyHubPage() {
  const [stats, setStats] = useState<StrategyStats>({
    missionVisionComplete: false,
    swotItemsCount: 0,
    canvasItemsCount: 0,
    currentBudget: null,
    unreadAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [missionRes, swotRes, canvasRes, budgetRes, alertsRes] = await Promise.all([
        fetch('/api/strategy/mission-vision'),
        fetch('/api/strategy/swot'),
        fetch('/api/strategy/canvas'),
        fetch('/api/strategy/budget?current=true'),
        fetch('/api/strategy/alerts'),
      ]);

      const missionData = await missionRes.json();
      const swotData = await swotRes.json();
      const canvasData = await canvasRes.json();
      const budgetData = await budgetRes.json();
      const alertsData = await alertsRes.json();

      const mission = missionData.data;
      const swotItems = swotData.data || [];
      const canvasItems = canvasData.data || [];
      const currentBudget = budgetData.data;
      const alerts = alertsData.data || [];

      setStats({
        missionVisionComplete: !!(mission?.mission && mission?.vision),
        swotItemsCount: swotItems.length,
        canvasItemsCount: canvasItems.length,
        currentBudget,
        unreadAlerts: alerts.length,
      });
    } catch (error) {
      console.error('Error loading strategy stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      title: 'Mission & Vision',
      description: 'Definisci la missione, visione e valori aziendali',
      icon: Target,
      href: '/dashboard/strategy/mission-vision',
      color: 'blue',
      status: stats.missionVisionComplete ? 'complete' : 'incomplete',
    },
    {
      title: 'Analisi SWOT',
      description: 'Analizza punti di forza, debolezza, opportunità e minacce',
      icon: TrendingUp,
      href: '/dashboard/strategy/swot',
      color: 'green',
      status: stats.swotItemsCount > 0 ? 'complete' : 'incomplete',
      badge: stats.swotItemsCount > 0 ? `${stats.swotItemsCount} elementi` : undefined,
    },
    {
      title: 'Business Model Canvas',
      description: 'Crea e gestisci il tuo business model canvas',
      icon: Grid3x3,
      href: '/dashboard/strategy/canvas',
      color: 'purple',
      status: stats.canvasItemsCount > 0 ? 'complete' : 'incomplete',
      badge: stats.canvasItemsCount > 0 ? `${stats.canvasItemsCount} elementi` : undefined,
    },
    {
      title: 'Budget Media',
      description: 'Monitora il budget media - Obiettivo: vicino allo 0',
      icon: DollarSign,
      href: '/dashboard/strategy/budget',
      color: 'orange',
      status: stats.currentBudget ? 'complete' : 'incomplete',
      badge: stats.currentBudget
        ? `€${stats.currentBudget.actual_spent.toFixed(2)}`
        : undefined,
      alert: stats.unreadAlerts > 0,
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pianificazione Strategica
          </h1>
          <p className="text-gray-600 mt-1">
            Gestisci mission, vision, analisi SWOT, business canvas e budget media
          </p>
        </div>

        <Link
          href="/dashboard/strategy/export"
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FileText className="h-5 w-5" />
          Esporta Report
        </Link>
      </div>

      {/* Alerts Banner */}
      {stats.unreadAlerts > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900">
              {stats.unreadAlerts} {stats.unreadAlerts === 1 ? 'Alert non letto' : 'Alert non letti'}
            </h3>
            <p className="text-sm text-orange-700">
              Controlla il budget media per vedere gli avvisi
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const isComplete = card.status === 'complete';

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all p-6"
            >
              {/* Alert indicator */}
              {card.alert && (
                <div className="absolute top-4 right-4">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                  card.color === 'blue'
                    ? 'bg-blue-100 text-blue-600'
                    : card.color === 'green'
                    ? 'bg-green-100 text-green-600'
                    : card.color === 'purple'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-orange-100 text-orange-600'
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <div className="flex-1 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700">
                    {card.title}
                  </h3>
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                <p className="text-gray-600 text-sm">{card.description}</p>

                {/* Badge */}
                {card.badge && (
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        card.color === 'blue'
                          ? 'bg-blue-100 text-blue-800'
                          : card.color === 'green'
                          ? 'bg-green-100 text-green-800'
                          : card.color === 'purple'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="flex items-center text-sm font-medium text-gray-600 group-hover:text-gray-900">
                Gestisci
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Budget Status Card */}
      {stats.currentBudget && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Budget Media - Mese Corrente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Budget Pianificato</p>
              <p className="text-2xl font-bold text-gray-900">
                €{stats.currentBudget.planned_budget.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Speso</p>
              <p className="text-2xl font-bold text-orange-600">
                €{stats.currentBudget.actual_spent.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Varianza</p>
              <p
                className={`text-2xl font-bold ${
                  stats.currentBudget.variance > 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {stats.currentBudget.variance > 0 ? '+' : ''}
                €{stats.currentBudget.variance.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">% Varianza</p>
              <p
                className={`text-2xl font-bold ${
                  Math.abs(stats.currentBudget.variance_percentage) > 25
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {stats.currentBudget.variance_percentage.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Goal indicator */}
          {stats.currentBudget.actual_spent <= 10 && (
            <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">
                🎯 Obiettivo raggiunto! Budget media vicino allo zero
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Suggerimenti
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <Eye className="h-4 w-4 mt-0.5 text-blue-500" />
            <span>
              Inizia definendo <strong>Mission e Vision</strong> per dare direzione strategica
            </span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 mt-0.5 text-green-500" />
            <span>
              Usa l'<strong>analisi SWOT</strong> per identificare opportunità e minacce
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Grid3x3 className="h-4 w-4 mt-0.5 text-purple-500" />
            <span>
              Completa il <strong>Business Model Canvas</strong> per visualizzare il modello di business
            </span>
          </li>
          <li className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 mt-0.5 text-orange-500" />
            <span>
              Monitora il <strong>Budget Media</strong> - l'obiettivo è mantenerlo vicino allo 0
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
