"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heart, CheckCircle2, XCircle, Clock, ExternalLink, Search, ChevronDown } from "lucide-react";

type Tithe = {
  id: string;
  user_id: string | null;
  amount: number;
  type: "tithe" | "offering" | "campaign";
  description: string | null;
  payment_method: string;
  receipt_url: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  profiles: { full_name: string } | null;
};

const typeLabels: Record<string, string> = {
  tithe: "Dízimo",
  offering: "Oferta",
  campaign: "Campanha",
};

const statusConfig = {
  pending: { label: "Pendente", color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
  confirmed: { label: "Confirmado", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "text-red-500", bg: "bg-red-500/10", icon: XCircle },
};

export default function AdminContribuicoesPage() {
  const [tithes, setTithes] = useState<Tithe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "confirmed" | "cancelled" | "all">("pending");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("tithes")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });
    setTithes((data as Tithe[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: "confirmed" | "cancelled" | "pending") {
    setActionLoading(id + status);
    const supabase = createClient();
    await supabase.from("tithes").update({ status }).eq("id", id);
    setTithes((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    setActionLoading(null);
  }

  const filtered = tithes.filter((t) => {
    const matchFilter = filter === "all" || t.status === filter;
    const matchSearch =
      !search ||
      t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      typeLabels[t.type]?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totals = {
    pending: tithes.filter((t) => t.status === "pending").length,
    confirmed: tithes.filter((t) => t.status === "confirmed").reduce((sum, t) => sum + t.amount, 0),
  };

  const tabs: { key: typeof filter; label: string; count?: number }[] = [
    { key: "pending", label: "Pendentes", count: tithes.filter((t) => t.status === "pending").length },
    { key: "confirmed", label: "Confirmados" },
    { key: "cancelled", label: "Cancelados" },
    { key: "all", label: "Todos" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-gold" /> Contribuições
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie dízimos e ofertas enviados pelos membros
          </p>
        </div>
        {totals.confirmed > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-muted-foreground">Total confirmado</p>
            <p className="text-xl font-bold text-green-500">
              R$ {totals.confirmed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      {totals.pending > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-sm text-amber-600 dark:text-amber-400">
          <strong>{totals.pending} {totals.pending === 1 ? "contribuição aguarda" : "contribuições aguardam"} sua revisão.</strong>
          {" "}Verifique o comprovante e confirme ou recuse cada uma.
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou tipo..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm outline-none focus:border-gold transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              filter === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${
                filter === tab.key ? "bg-amber-500 text-black" : "bg-muted-foreground/30 text-foreground"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <Heart className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
          Nenhuma contribuição encontrada.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const cfg = statusConfig[t.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={t.id} className={`p-4 rounded-xl border bg-card transition-colors ${
                t.status === "pending" ? "border-amber-500/30" : "border-border"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {t.profiles?.full_name || "Membro"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium shrink-0">
                        {typeLabels[t.type] || t.type}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color} shrink-0`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    {t.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(t.created_at).toLocaleString("pt-BR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {t.receipt_url && (
                      <a
                        href={t.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Comprovante
                      </a>
                    )}
                    {t.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(t.id, "confirmed")}
                          disabled={actionLoading !== null}
                          className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors font-medium disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {actionLoading === t.id + "confirmed" ? "..." : "Confirmar"}
                        </button>
                        <button
                          onClick={() => updateStatus(t.id, "cancelled")}
                          disabled={actionLoading !== null}
                          className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors font-medium disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          {actionLoading === t.id + "cancelled" ? "..." : "Recusar"}
                        </button>
                      </>
                    )}
                    {t.status !== "pending" && (
                      <button
                        onClick={() => updateStatus(t.id, "pending")}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                      >
                        <ChevronDown className="w-3 h-3" />
                        Reabrir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
