"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatsCard from "@/components/StatsCard";
import ChartCard from "@/components/ChartCard";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  source: string;
  category: string | null;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  description: string | null;
  client: { name: string };
}

interface ClientWithPayments {
  id: string;
  payments: { status: string }[];
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<ClientWithPayments[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/transacciones?limit=10").then((r) => r.json()),
      fetch("/api/pagos?upcoming=true").then((r) => r.json()),
      fetch("/api/clientes").then((r) => r.json()),
    ]).then(([txs, pays, cls]) => {
      setTransactions(txs);
      setPayments(pays);
      setClients(cls);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const ingresosAll = thisMonth.filter((t) => t.type === "ingreso");
  const ingresos = ingresosAll.reduce((s, t) => s + t.amount, 0);
  const ventasNuevas = ingresosAll.filter((t) => t.category === "ventas_nuevas").reduce((s, t) => s + t.amount, 0);
  const cuotas = ingresosAll.filter((t) => t.category === "cuotas").reduce((s, t) => s + t.amount, 0);
  const ventasInternas = ingresosAll.filter((t) => t.category === "ventas_internas").reduce((s, t) => s + t.amount, 0);
  const egresos = thisMonth.filter((t) => t.type === "egreso").reduce((s, t) => s + t.amount, 0);
  const balance = ingresos - egresos;

  // Chart data: last 6 months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleDateString("es-ES", { month: "short" });
    const monthTxs = transactions.filter((t) => {
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    return {
      month: month.charAt(0).toUpperCase() + month.slice(1),
      ingresos: monthTxs.filter((t) => t.type === "ingreso").reduce((s, t) => s + t.amount, 0),
      egresos: monthTxs.filter((t) => t.type === "egreso").reduce((s, t) => s + t.amount, 0),
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">
          Resumen financiero &middot; {new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Ingresos del mes"
          value={formatCurrency(ingresos)}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Egresos del mes"
          value={formatCurrency(egresos)}
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="Balance"
          value={formatCurrency(balance)}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Clientes activos"
          value={String(clients.length)}
          subtitle={`${clients.filter((c) => c.payments.some((p) => p.status === "pendiente")).length} con pagos pendientes`}
          icon={Users}
          color="cyan"
        />
      </div>

      {/* Income Breakdown */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Desglose de Ingresos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <div>
              <p className="text-xs text-white/40">Ventas Nuevas</p>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(ventasNuevas)}</p>
            </div>
            <ArrowUpRight size={20} className="text-emerald-400/40" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <div>
              <p className="text-xs text-white/40">Cuotas</p>
              <p className="text-lg font-bold text-blue-400">{formatCurrency(cuotas)}</p>
            </div>
            <DollarSign size={20} className="text-blue-400/40" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <div>
              <p className="text-xs text-white/40">Ventas Internas</p>
              <p className="text-lg font-bold text-purple-400">{formatCurrency(ventasInternas)}</p>
            </div>
            <ArrowUpRight size={20} className="text-purple-400/40" />
          </div>
        </div>
      </div>

      {/* Chart + Upcoming payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard title="Ingresos vs Egresos" subtitle="Últimos 6 meses">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a1a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#e5e5e5",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorIngresos)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="egresos"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorEgresos)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Upcoming payments */}
        <ChartCard title="Próximos Pagos" subtitle="Cuotas pendientes">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {payments.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-8">
                No hay pagos pendientes
              </p>
            ) : (
              payments.slice(0, 5).map((p) => (
                <div key={p.id} className="glass-card-interactive p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{p.client.name}</p>
                      <p className="text-xs text-white/30">{p.description || "Pago"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {formatCurrency(p.amount, p.currency)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <Clock size={10} />
                        {formatDate(p.dueDate)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>

      {/* Recent transactions */}
      <ChartCard title="Últimas Transacciones" subtitle="Movimientos recientes">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Fuente</th>
                <th className="text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-white/30 py-8">
                    No hay transacciones registradas
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        {tx.type === "ingreso" ? (
                          <ArrowUpRight size={14} className="text-emerald-400" />
                        ) : (
                          <ArrowDownRight size={14} className="text-red-400" />
                        )}
                        <StatusBadge
                          status={tx.type === "ingreso" ? "pagado" : "vencido"}
                        />
                      </div>
                    </td>
                    <td className="text-white/80">{tx.description}</td>
                    <td className="text-white/50">{formatDate(tx.date)}</td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                        {tx.source}
                      </span>
                    </td>
                    <td className="text-right">
                      <span
                        className={`font-medium ${
                          tx.type === "ingreso" ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {tx.type === "ingreso" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
