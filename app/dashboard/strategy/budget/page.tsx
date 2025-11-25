// Media Budget Dashboard with Alerts
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Calendar,
  X,
} from 'lucide-react';
import type { MediaBudget, BudgetAlert, MediaBudgetExpense } from '@/lib/types/strategy';
import { EXPENSE_CATEGORIES } from '@/lib/types/strategy';

export default function MediaBudgetPage() {
  const [budget, setBudget] = useState<MediaBudget | null>(null);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: 'advertising' as string,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [budgetRes, alertsRes] = await Promise.all([
        fetch('/api/strategy/budget?current=true'),
        fetch('/api/strategy/alerts'),
      ]);

      const budgetData = await budgetRes.json();
      const alertsData = await alertsRes.json();

      setBudget(budgetData.data);
      setAlerts(alertsData.data || []);
    } catch (error) {
      console.error('Error loading budget data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addExpense() {
    if (!budget || !expenseForm.description || expenseForm.amount <= 0) return;

    try {
      const newExpense: MediaBudgetExpense = {
        id: crypto.randomUUID(),
        date: expenseForm.date,
        description: expenseForm.description,
        amount: expenseForm.amount,
        category: expenseForm.category,
      };

      const updatedExpenses = [...(budget.expenses || []), newExpense];
      const totalSpent = updatedExpenses.reduce((sum, e) => sum + e.amount, 0);

      const res = await fetch('/api/strategy/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: budget.id,
          expenses: updatedExpenses,
          actual_spent: totalSpent,
        }),
      });

      if (!res.ok) throw new Error('Failed to add expense');

      await loadData();
      setShowExpenseDialog(false);
      setExpenseForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category: 'advertising',
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Errore durante l\'aggiunta della spesa');
    }
  }

  async function deleteExpense(expenseId: string) {
    if (!budget || !confirm('Eliminare questa spesa?')) return;

    try {
      const updatedExpenses = budget.expenses.filter((e) => e.id !== expenseId);
      const totalSpent = updatedExpenses.reduce((sum, e) => sum + e.amount, 0);

      const res = await fetch('/api/strategy/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: budget.id,
          expenses: updatedExpenses,
          actual_spent: totalSpent,
        }),
      });

      if (!res.ok) throw new Error('Failed to delete expense');
      await loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  }

  async function markAlertAsRead(alertId: string) {
    try {
      const res = await fetch('/api/strategy/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId }),
      });

      if (!res.ok) throw new Error('Failed to mark alert as read');
      await loadData();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nessun Budget</h2>
          <p className="text-gray-600">Il budget per il mese corrente non è stato ancora creato.</p>
        </div>
      </div>
    );
  }

  const isNearZero = budget.actual_spent <= 10 && budget.planned_budget <= 10;
  const isOverBudget = budget.variance > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/strategy" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Media</h1>
            <p className="text-gray-600 mt-1">
              Monitora e gestisci il budget media - Obiettivo: vicino allo 0
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowExpenseDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Aggiungi Spesa
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border-red-200'
                  : alert.severity === 'warning'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <AlertCircle
                className={`h-5 w-5 mt-0.5 ${
                  alert.severity === 'critical'
                    ? 'text-red-600'
                    : alert.severity === 'warning'
                    ? 'text-orange-600'
                    : 'text-blue-600'
                }`}
              />
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    alert.severity === 'critical'
                      ? 'text-red-900'
                      : alert.severity === 'warning'
                      ? 'text-orange-900'
                      : 'text-blue-900'
                  }`}
                >
                  {alert.alert_message}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(alert.created_at).toLocaleString('it-IT')}
                </p>
              </div>
              <button
                onClick={() => markAlertAsRead(alert.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Budget Pianificato</p>
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            €{budget.planned_budget.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Speso</p>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            €{budget.actual_spent.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Varianza</p>
            {isOverBudget ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </div>
          <p
            className={`text-3xl font-bold ${
              isOverBudget ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {budget.variance > 0 ? '+' : ''}€{budget.variance.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">% Varianza</p>
            <AlertCircle
              className={`h-4 w-4 ${
                Math.abs(budget.variance_percentage) > 25
                  ? 'text-red-500'
                  : 'text-green-500'
              }`}
            />
          </div>
          <p
            className={`text-3xl font-bold ${
              Math.abs(budget.variance_percentage) > 25
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {budget.variance_percentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Goal Status */}
      {isNearZero && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-bold text-green-900">
                🎯 Obiettivo Raggiunto!
              </h3>
              <p className="text-green-700">
                Il budget media è vicino allo zero. Ottimo lavoro!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Spese ({budget.expenses.length})
        </h2>

        {budget.expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Nessuna spesa registrata</p>
            <button
              onClick={() => setShowExpenseDialog(true)}
              className="text-sm mt-2 text-blue-600 underline hover:no-underline"
            >
              Aggiungi la prima spesa
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {budget.expenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          expense.category === 'advertising'
                            ? 'bg-blue-100 text-blue-800'
                            : expense.category === 'social_media'
                            ? 'bg-purple-100 text-purple-800'
                            : expense.category === 'content'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {EXPENSE_CATEGORIES.find((c) => c.value === expense.category)
                          ?.label || expense.category}
                      </span>
                      <span className="font-medium text-gray-900">
                        {expense.description}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(expense.date).toLocaleDateString('it-IT')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-gray-900">
                      €{expense.amount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Expense Dialog */}
      {showExpenseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Aggiungi Spesa</h2>
              <button
                onClick={() => setShowExpenseDialog(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrizione</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, description: e.target.value })
                  }
                  placeholder="Es: Campagna Facebook Ads"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Importo (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowExpenseDialog(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={addExpense}
                  disabled={!expenseForm.description || expenseForm.amount <= 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
