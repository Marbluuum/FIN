"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ClientData {
  id?: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
}

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClientData) => void;
  client?: ClientData | null;
}

const empty: ClientData = { name: "", email: null, company: null, phone: null, notes: null };

export default function ClientModal({ open, onClose, onSave, client }: ClientModalProps) {
  const [form, setForm] = useState<ClientData>(empty);

  useEffect(() => {
    setForm(client ? { ...client } : empty);
  }, [client, open]);

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
            {client?.id ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} className="text-white/50" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Nombre *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre del cliente"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@ejemplo.com"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Empresa</label>
            <input
              type="text"
              value={form.company || ""}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Nombre de la empresa"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Teléfono</label>
            <input
              type="tel"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 234 567 890"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Notas</label>
            <textarea
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {client?.id ? "Guardar" : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
