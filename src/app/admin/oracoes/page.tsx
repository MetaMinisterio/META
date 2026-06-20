"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { HandHeart, Globe, Lock, CheckCircle2, Archive, ArchiveRestore } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type PrayerWithProfile = {
  id: string; title: string; description: string | null; is_public: boolean;
  is_answered: boolean; is_archived: boolean; created_at: string; user_id: string;
  profiles: { full_name: string } | null;
};

type Tab = "active" | "pending" | "answered" | "archived";

export default function AdminOracoesPage() {
  const [prayers, setPrayers] = useState<PrayerWithProfile[]>([]);
  const [archivedPrayers, setArchivedPrayers] = useState<PrayerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("active");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: active }, { data: archived }] = await Promise.all([
      supabase
        .from("prayer_requests")
        .select("*, profiles(full_name)")
        .eq("is_archived", false)
        .order("created_at", { ascending: false }),
      supabase
        .from("prayer_requests")
        .select("*, profiles(full_name)")
        .eq("is_archived", true)
        .order("created_at", { ascending: false }),
    ]);
    setPrayers((active as PrayerWithProfile[]) || []);
    setArchivedPrayers((archived as PrayerWithProfile[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markAnswered(id: string) {
    setActionLoading(id + "answered");
    const supabase = createClient();
    await supabase.from("prayer_requests").update({ is_answered: true }).eq("id", id);
    setPrayers((prev) => prev.map((p) => p.id === id ? { ...p, is_answered: true } : p));
    setActionLoading(null);
  }

  async function archivePrayer(id: string) {
    setActionLoading(id + "archive");
    const supabase = createClient();
    await supabase.from("prayer_requests").update({ is_archived: true }).eq("id", id);
    const prayer = prayers.find((p) => p.id === id);
    if (prayer) setArchivedPrayers((prev) => [{ ...prayer, is_archived: true }, ...prev]);
    setPrayers((prev) => prev.filter((p) => p.id !== id));
    setActionLoading(null);
  }

  async function unarchivePrayer(id: string) {
    setActionLoading(id + "unarchive");
    const supabase = createClient();
    await supabase.from("prayer_requests").update({ is_archived: false }).eq("id", id);
    const prayer = archivedPrayers.find((p) => p.id === id);
    if (prayer) setPrayers((prev) => [{ ...prayer, is_archived: false }, ...prev]);
    setArchivedPrayers((prev) => prev.filter((p) => p.id !== id));
    setActionLoading(null);
  }

  const displayList =
    tab === "archived"
      ? archivedPrayers
      : prayers.filter((p) => {
          if (tab === "pending") return !p.is_answered;
          if (tab === "answered") return p.is_answered;
          return true; // "active" = all non-archived
        });

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "active",   label: "Todos",      count: prayers.length },
    { key: "pending",  label: "Pendentes",  count: prayers.filter((p) => !p.is_answered).length },
    { key: "answered", label: "Respondidos",count: prayers.filter((p) => p.is_answered).length },
    { key: "archived", label: "Arquivadas", count: archivedPrayers.length },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <HandHeart className="w-6 h-6 text-gold" /> Pedidos de Oração
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {prayers.length} {prayers.length === 1 ? "pedido ativo" : "pedidos ativos"} · {archivedPrayers.length} arquivados
        </p>
      </div>

      <div className="flex rounded-xl bg-muted p-1 gap-0.5 overflow-x-auto no-scrollbar">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 min-w-max py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className={`inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[9px] font-bold ${
                tab === key
                  ? key === "archived" ? "bg-zinc-500 text-white" : "bg-gold text-black"
                  : "bg-muted-foreground/20 text-foreground"
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "archived" && archivedPrayers.length > 0 && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
          Pedidos arquivados não aparecem no app. Você pode desarquivá-los para que voltem a ser visíveis.
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <HandHeart className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
          {tab === "archived" ? "Nenhum pedido arquivado." : "Nenhum pedido encontrado."}
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((p) => (
            <div key={p.id} className={`p-4 rounded-xl border bg-card transition-colors ${p.is_archived ? "opacity-70 border-border" : "border-border hover:border-gold/20"}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{p.profiles?.full_name || "Membro"}</span>
                  {p.is_public
                    ? <Globe className="w-3 h-3 text-gold" />
                    : <Lock className="w-3 h-3 text-muted-foreground" />
                  }
                  {p.is_answered && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-500 font-medium">
                      Respondido
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{formatDateTime(p.created_at)}</span>
              </div>

              <p className="font-semibold text-sm text-foreground">{p.title}</p>
              {p.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>}

              <div className="flex items-center justify-end gap-2 mt-3">
                {tab === "archived" ? (
                  <button
                    onClick={() => unarchivePrayer(p.id)}
                    disabled={actionLoading !== null}
                    className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    <ArchiveRestore className="w-3 h-3" />
                    {actionLoading === p.id + "unarchive" ? "..." : "Desarquivar"}
                  </button>
                ) : (
                  <>
                    {!p.is_answered && (
                      <button
                        onClick={() => markAnswered(p.id)}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {actionLoading === p.id + "answered" ? "..." : "Marcar respondido"}
                      </button>
                    )}
                    <button
                      onClick={() => archivePrayer(p.id)}
                      disabled={actionLoading !== null}
                      className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                    >
                      <Archive className="w-3 h-3" />
                      {actionLoading === p.id + "archive" ? "..." : "Arquivar"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
