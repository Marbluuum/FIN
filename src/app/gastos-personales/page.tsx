"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { formatCurrency, formatDate } from "@/lib/utils";

const CATEGORIES = [
  "Alimentación",
  "Transporte",
  "Entretenimiento",
  "Servicios",
  "Salud",
  "Educación",
  "Ropa",
  "Tecnología",
  "Vivienda",
  "Otros",
];

interface PersonalExpense {
  id: string;
  type: string;
  amount: number;
  currency: string;
  category: string | null;
  description: string;
  date: string;
}

export default function GastosPersonalesPage() {
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ type: "", category: "", from: "", to: "" });
  const [form, setForm] = useState({
    type: "retiro",
    amount: "",
    currency: "USD",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchExpenses = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.category) params.set("category", filters.category);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const res = await fetch(`/api/gastos-personales?${params.toString()}`);
    setExpenses(await res.json());
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/gastos-personales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({
      type: "retiro",
      amount: "",
      currency: "USD",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    fetchExpenses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    await fetch(`/api/gastos-personales?id=${id}`, { method: "DELETE" });
    fetchExpenses();
  };

  const retiros = expenses.filter((e) => e.type === "retiro").reduce((s, e) => s + e.amount, 0);
  const ingresos = expenses.filter((e) => e.type === "ingreso").reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const categoryTotals = expenses
    .filter((e) => e.type === "retiro")
    .reduce((acc, e) => {
      const cat = e.category || "Sin categoría";
      acc[cat] = (acc[cat] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gastos Personales</h1>
          <p className="text-sm text-white/40 mt-1">Retiros e ingresos personales</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cerrar" : "Nuevo Registro"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Retiros" value={formatCurrency(retiros)} icon={TrendingDown} color="red" />
        <StatsCard title="Total Ingresos" value={formatCurrency(ingresos)} icon={TrendingUp} color="green" />
        <StatsCard title="Balance Personal" value={formatCurrency(ingresos - retiros)} icon={Wallet} color="amber" />
      </div>

      {/* New expense form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-white mb-4">Nuevo Registro Personal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full">
                <option value="retiro">Retiro</option>
                <option value="ingreso">Ingreso</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Monto</label>
              <input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Moneda</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Categoría</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full">
                <option value="">Sin categoría</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Descripción</label>
              <input type="text" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Fecha</label>
              <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="btn-primary">
              <Plus size={14} /> Registrar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Gastos por Categoría</h3>
          {sortedCategories.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map(([cat, total]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">{cat}</span>
                    <span className="text-white font-medium">{formatCurrency(total)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${(total / retiros) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="glass-card p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={14} className="text-white/40" />
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Filtros</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="w-full">
                <option value="">Todos</option>
                <option value="retiro">Retiros</option>
                <option value="ingreso">Ingresos</option>
              </select>
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full">
                <option value="">Categorías</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="w-full" />
              <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="w-full" />
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th className="hidden sm:table-cell">Categoría</th>
                    <th>Fecha</th>
                    <th className="text-right">Monto</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-white/30 py-12">
                        No hay registros
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            {exp.type === "ingreso" ? (
                              <ArrowUpRight size={14} className="text-emerald-400" />
                            ) : (
                              <ArrowDownRight size={14} className="text-red-400" />
                            )}
                            <span className="text-xs text-white/50 capitalize">{exp.type}</span>
                          </div>
                        </td>
                        <td className="text-white/80">{exp.description}</td>
                        <td className="hidden sm:table-cell text-white/40 text-xs">{exp.category || "-"}</td>
                        <td className="text-white/50 text-sm">{formatDate(exp.date)}</td>
                        <td className="text-right">
                          <span className={`font-medium ${exp.type === "ingreso" ? "text-emerald-400" : "text-red-400"}`}>
                            {exp.type === "ingreso" ? "+" : "-"}{formatCurrency(exp.amount, exp.currency)}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-red-400 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
