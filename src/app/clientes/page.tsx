"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Mail,
  Phone,
  Building,
} from "lucide-react";
import ClientModal from "@/components/ClientModal";
import PaymentModal from "@/components/PaymentModal";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  description: string | null;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  payments: Payment[];
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [clientModal, setClientModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetch(`/api/clientes${params}`);
    const data = await res.json();
    setClients(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSaveClient = async (data: { id?: string; name: string; email: string | null; company: string | null; phone: string | null; notes: string | null }) => {
    const method = data.id ? "PUT" : "POST";
    await fetch("/api/clientes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setClientModal(false);
    setEditClient(null);
    fetchClients();
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("¿Eliminar este cliente y todos sus pagos?")) return;
    await fetch(`/api/clientes?id=${id}`, { method: "DELETE" });
    fetchClients();
  };

  const handleSavePayment = async (data: { id?: string; clientId: string; amount: string; currency: string; status: string; category: string; dueDate: string; description: string }) => {
    const method = data.id ? "PUT" : "POST";
    await fetch("/api/pagos", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setPaymentModal(false);
    setSelectedClient(null);
    fetchClients();
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm("¿Eliminar este pago?")) return;
    await fetch(`/api/pagos?id=${id}`, { method: "DELETE" });
    fetchClients();
  };

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
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-sm text-white/40 mt-1">{clients.length} clientes registrados</p>
        </div>
        <button
          onClick={() => {
            setEditClient(null);
            setClientModal(true);
          }}
          className="btn-primary"
        >
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full !pl-10"
        />
      </div>

      {/* Client list */}
      <div className="space-y-3">
        {clients.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-white/30">No hay clientes registrados</p>
            <button
              onClick={() => setClientModal(true)}
              className="btn-primary mt-4"
            >
              <Plus size={16} /> Agregar primer cliente
            </button>
          </div>
        ) : (
          clients.map((client) => {
            const isExpanded = expandedClient === client.id;
            const pendingPayments = client.payments.filter((p) => p.status === "pendiente");
            const totalPending = pendingPayments.reduce((s, p) => s + p.amount, 0);

            return (
              <div key={client.id} className="glass-card overflow-hidden">
                {/* Client header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary-light font-bold text-sm">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{client.name}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        {client.company && (
                          <span className="flex items-center gap-1 text-xs text-white/30">
                            <Building size={10} /> {client.company}
                          </span>
                        )}
                        {client.email && (
                          <span className="flex items-center gap-1 text-xs text-white/30">
                            <Mail size={10} /> {client.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {totalPending > 0 && (
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-white/40">Pendiente</p>
                        <p className="text-sm font-bold text-amber-400">
                          {formatCurrency(totalPending)}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <StatusBadge
                        status={
                          pendingPayments.length > 0 ? "pendiente" : client.payments.length > 0 ? "pagado" : "pendiente"
                        }
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-white/30" />
                    ) : (
                      <ChevronDown size={16} className="text-white/30" />
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-4 animate-fade-in">
                    {/* Client details */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      {client.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-white/40">
                          <Phone size={12} /> {client.phone}
                        </span>
                      )}
                      {client.notes && (
                        <span className="text-xs text-white/40">
                          Notas: {client.notes}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditClient(client);
                          setClientModal(true);
                        }}
                        className="btn-secondary text-xs !py-1.5 !px-3"
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(client.id);
                          setPaymentModal(true);
                        }}
                        className="btn-primary text-xs !py-1.5 !px-3"
                      >
                        <CreditCard size={12} /> Nuevo Pago
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.id);
                        }}
                        className="btn-danger text-xs !py-1.5 !px-3"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Payments table */}
                    {client.payments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Descripción</th>
                              <th>Vencimiento</th>
                              <th>Estado</th>
                              <th className="text-right">Monto</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {client.payments.map((p) => (
                              <tr key={p.id}>
                                <td className="text-white/80">
                                  {p.description || "Pago"}
                                </td>
                                <td className="text-white/50">
                                  {formatDate(p.dueDate)}
                                </td>
                                <td>
                                  <StatusBadge status={p.status} />
                                </td>
                                <td className="text-right font-medium text-white">
                                  {formatCurrency(p.amount, p.currency)}
                                </td>
                                <td>
                                  <button
                                    onClick={() => handleDeletePayment(p.id)}
                                    className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-white/20 text-center py-4">
                        Sin pagos registrados
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ClientModal
        open={clientModal}
        onClose={() => {
          setClientModal(false);
          setEditClient(null);
        }}
        onSave={handleSaveClient}
        client={editClient}
      />

      <PaymentModal
        open={paymentModal}
        onClose={() => {
          setPaymentModal(false);
          setSelectedClient(null);
        }}
        onSave={handleSavePayment}
        clientId={selectedClient || ""}
      />
    </div>
  );
}
