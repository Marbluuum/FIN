"use client";

import { useState, useEffect } from "react";
import {
  Plug,
  Check,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Building2,
  Bitcoin,
} from "lucide-react";

interface IntegrationConfig {
  id: string;
  provider: string;
  apiKey: string;
  apiSecret: string | null;
  enabled: boolean;
}

interface BinanceBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

const integrations = [
  {
    provider: "stripe",
    name: "Stripe",
    description: "Procesamiento de pagos y suscripciones",
    icon: Zap,
    color: "from-violet-500/20 to-violet-500/5 text-violet-400",
    fields: [{ key: "apiKey", label: "Secret Key", placeholder: "sk_live_..." }],
  },
  {
    provider: "mercury",
    name: "Mercury",
    description: "Cuenta bancaria empresarial",
    icon: Building2,
    color: "from-blue-500/20 to-blue-500/5 text-blue-400",
    fields: [{ key: "apiKey", label: "API Token", placeholder: "mercury_..." }],
  },
  {
    provider: "binance",
    name: "Binance",
    description: "Exchange de criptomonedas",
    icon: Bitcoin,
    color: "from-amber-500/20 to-amber-500/5 text-amber-400",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "Tu API Key de Binance" },
      { key: "apiSecret", label: "API Secret", placeholder: "Tu API Secret" },
    ],
  },
];

export default function IntegracionesPage() {
  const [configs, setConfigs] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<Record<string, Record<string, string>>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [binanceBalances, setBinanceBalances] = useState<BinanceBalance[]>([]);
  const [loadingBinance, setLoadingBinance] = useState(false);

  useEffect(() => {
    fetch("/api/integraciones")
      .then((r) => r.json())
      .then((data) => {
        setConfigs(data);
        setLoading(false);
      });
  }, []);

  const getConfig = (provider: string) => configs.find((c) => c.provider === provider);

  const handleSave = async (provider: string) => {
    setSaving(provider);
    const formData = forms[provider] || {};
    await fetch("/api/integraciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        apiKey: formData.apiKey || "",
        apiSecret: formData.apiSecret || null,
        enabled: true,
      }),
    });
    const res = await fetch("/api/integraciones");
    setConfigs(await res.json());
    setForms({ ...forms, [provider]: {} });
    setSaving(null);
  };

  const handleDisconnect = async (provider: string) => {
    if (!confirm(`¿Desconectar ${provider}?`)) return;
    await fetch(`/api/integraciones?provider=${provider}`, { method: "DELETE" });
    const res = await fetch("/api/integraciones");
    setConfigs(await res.json());
  };

  const handleTestBinance = async () => {
    setLoadingBinance(true);
    try {
      const res = await fetch("/api/binance");
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setBinanceBalances(data.balances);
      }
    } catch {
      alert("Error conectando con Binance");
    }
    setLoadingBinance(false);
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
      <div>
        <h1 className="text-2xl font-bold text-white">Integraciones</h1>
        <p className="text-sm text-white/40 mt-1">Conecta tus servicios financieros</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const config = getConfig(integration.provider);
          const isConnected = !!config;
          const Icon = integration.icon;
          const formData = forms[integration.provider] || {};

          return (
            <div key={integration.provider} className="glass-card p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center`}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{integration.name}</h3>
                    <p className="text-xs text-white/40">{integration.description}</p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    isConnected
                      ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                      : "bg-white/5 text-white/30 border border-white/10"
                  }`}
                >
                  {isConnected ? <Check size={10} /> : <X size={10} />}
                  {isConnected ? "Conectado" : "Desconectado"}
                </div>
              </div>

              {/* Connected state */}
              {isConnected ? (
                <div className="space-y-3">
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">API Key</span>
                      <button
                        onClick={() =>
                          setShowKeys({ ...showKeys, [integration.provider]: !showKeys[integration.provider] })
                        }
                        className="p-1 rounded hover:bg-white/5 text-white/30"
                      >
                        {showKeys[integration.provider] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <p className="text-sm text-white/60 font-mono mt-1">
                      {showKeys[integration.provider] ? config.apiKey : "••••••••••••"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {integration.provider === "binance" && (
                      <button onClick={handleTestBinance} className="btn-secondary text-xs !py-1.5" disabled={loadingBinance}>
                        <RefreshCw size={12} className={loadingBinance ? "animate-spin" : ""} />
                        Ver Balance
                      </button>
                    )}
                    {integration.provider === "mercury" && (
                      <button
                        onClick={async () => {
                          const res = await fetch("/api/mercury");
                          const data = await res.json();
                          alert(data.error || `Sincronizadas ${data.synced} transacciones`);
                        }}
                        className="btn-secondary text-xs !py-1.5"
                      >
                        <RefreshCw size={12} /> Sync
                      </button>
                    )}
                    <button onClick={() => handleDisconnect(integration.provider)} className="btn-danger text-xs !py-1.5">
                      <X size={12} /> Desconectar
                    </button>
                  </div>
                </div>
              ) : (
                /* Disconnected state - config form */
                <div className="space-y-3">
                  {integration.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-white/40 mb-1">{field.label}</label>
                      <input
                        type="password"
                        value={formData[field.key] || ""}
                        onChange={(e) =>
                          setForms({
                            ...forms,
                            [integration.provider]: { ...formData, [field.key]: e.target.value },
                          })
                        }
                        placeholder={field.placeholder}
                        className="w-full"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => handleSave(integration.provider)}
                    className="btn-primary w-full justify-center"
                    disabled={saving === integration.provider}
                  >
                    <Plug size={14} />
                    {saving === integration.provider ? "Conectando..." : "Conectar"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Binance balances */}
      {binanceBalances.length > 0 && (
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-base font-bold text-white mb-4">Balance de Binance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {binanceBalances.map((b) => (
              <div key={b.asset} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <p className="text-xs text-white/40 mb-1">{b.asset}</p>
                <p className="text-lg font-bold text-white">{b.total.toFixed(6)}</p>
                <div className="flex gap-2 mt-1 text-xs">
                  <span className="text-emerald-400/60">Libre: {b.free.toFixed(4)}</span>
                  {b.locked > 0 && (
                    <span className="text-amber-400/60">Bloq: {b.locked.toFixed(4)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
