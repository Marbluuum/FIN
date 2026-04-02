"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  X,
  Download,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import StatsCard from "@/components/StatsCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  category: string | null;
  description: string;
  date: string;
  source: string;
}

export default function TransaccionesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ type: "", source: "", from: "", to: "" });
  const [form, setForm] = useState({
    type: "ingreso",
    amount: "",
    currency: "USD",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    source: "manual",
  });

  const fetchTransactions = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.source) params.set("source", filters.source);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const res = await fetch(`/api/transacciones?${params.toString()}`);
    setTransactions(await res.json());
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/mercury");
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(`Sincronizadas ${data.synced} transacciones de ${data.accounts} cuenta(s)`);
        fetchTransactions();
      }
    } catch {
      alert("Error al sincronizar con Mercury");
    }
    setSyncing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/transacciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({
      type: "ingreso",
      amount: "",
      currency: "USD",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      source: "manual",
    });
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta transacción?")) return;
    await fetch(`/api/transacciones?id=${id}`, { method: "DELETE" });
    fetchTransactions();
  };

  const ingresos = transactions.filter((t) => t.type === "ingreso").reduce((s, t) => s + t.amount, 0);
  const egresos = transactions.filter((t) => t.type === "egreso").reduce((s, t) => s + t.amount, 0);

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
          <h1 className="text-2xl font-bold text-white">Transacciones</h1>
          <p className="text-sm text-white/40 mt-1">Ingresos y egresos de tu empresa</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSync} className="btn-secondary" disabled={syncing}>
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Sincronizando..." : "Sync Mercury"}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? "Cerrar" : "Nueva"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Ingresos" value={formatCurrency(ingresos)} icon={TrendingUp} color="green" />
        <StatsCard title="Total Egresos" value={formatCurrency(egresos)} icon={TrendingDown} color="red" />
        <StatsCard title="Balance" value={formatCurrency(ingresos - egresos)} icon={DollarSign} color="blue" />
      </div>

      {/* New transaction form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-white mb-4">Nueva Transacción</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, category: "" })} className="w-full">
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
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
              {form.type === "ingreso" ? (
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full">
                  <option value="">Seleccionar categoría</option>
                  <option value="ventas_nuevas">Ventas Nuevas</option>
                  <option value="cuotas">Cuotas</option>
                  <option value="ventas_internas">Ventas Internas</option>
                </select>
              ) : (
                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ej: Servicios" className="w-full" />
              )}
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Plataforma</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full">
                <option value="manual">Manual</option>
                <option value="mercury">Mercury</option>
                <option value="stripe">Stripe</option>
                <option value="binance">Binance</option>
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
              <Download size={14} /> Registrar
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-white/40" />
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Filtros</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="w-full">
            <option value="">Todos los tipos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
          <select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className="w-full">
            <option value="">Todas las fuentes</option>
            <option value="manual">Manual</option>
            <option value="mercury">Mercury</option>
            <option value="stripe">Stripe</option>
          </select>
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="w-full" placeholder="Desde" />
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="w-full" placeholder="Hasta" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th className="hidden sm:table-cell">Categoría</th>
                <th>Fecha</th>
                <th className="hidden sm:table-cell">Fuente</th>
                <th className="text-right">Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-white/30 py-12">
                    No hay transacciones
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        {tx.type === "ingreso" ? (
                          <ArrowUpRight size={14} className="text-emerald-400" />
                        ) : (
                          <ArrowDownRight size={14} className="text-red-400" />
                        )}
                        <span className="text-xs text-white/50 capitalize">{tx.type}</span>
                      </div>
                    </td>
                    <td className="text-white/80 max-w-[200px] truncate">{tx.description}</td>
                    <td className="hidden sm:table-cell text-white/40 text-xs">
                      {{ ventas_nuevas: "Ventas Nuevas", cuotas: "Cuotas", ventas_internas: "Ventas Internas" }[tx.category ?? ""] || tx.category || "-"}
                    </td>
                    <td className="text-white/50 text-sm">{formatDate(tx.date)}</td>
                    <td className="hidden sm:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                        {tx.source}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className={`font-medium ${tx.type === "ingreso" ? "text-emerald-400" : "text-red-400"}`}>
                        {tx.type === "ingreso" ? "+" : "-"}{formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(tx.id)}
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
  );
}
