"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PaymentData {
  id?: string;
  clientId: string;
  amount: string;
  currency: string;
  status: string;
  category: string;
  dueDate: string;
  description: string;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PaymentData) => void;
  payment?: PaymentData | null;
  clientId: string;
}

export default function PaymentModal({ open, onClose, onSave, payment, clientId }: PaymentModalProps) {
  const [form, setForm] = useState<PaymentData>({
    clientId,
    amount: "",
    currency: "USD",
    status: "pendiente",
    category: "ventas_nuevas",
    dueDate: new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => {
    if (payment) {
      setForm({ ...payment });
    } else {
      setForm({
        clientId,
        amount: "",
        currency: "USD",
        status: "pendiente",
        category: "ventas_nuevas",
        dueDate: new Date().toISOString().split("T")[0],
        description: "",
      });
    }
  }, [payment, clientId, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">
            {payment?.id ? "Editar Pago" : "Nuevo Pago"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} className="text-white/50" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Tipo de Pago *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full"
            >
              <option value="ventas_nuevas">Ventas Nuevas</option>
              <option value="cuotas">Cuotas</option>
              <option value="ventas_internas">Ventas Internas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Monto *</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Moneda</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ARS">ARS</option>
                <option value="BTC">BTC</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Estado</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full"
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Fecha de Vencimiento *</label>
            <input
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Descripción</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción del pago"
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {payment?.id ? "Guardar" : "Registrar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
