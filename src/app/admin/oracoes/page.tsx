"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HandHeart, Globe, Lock, CheckCircle2, Archive } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type PrayerWithProfile = {
  id: string; title: string; description: string | null; is_public: boolean;
  is_answered: boolean; is_archived: boolean; created_at: string; user_id: string;
  profiles: { full_name: string } | null;
};

export default function AdminOracoesPage() {
  const [prayers, setPrayers] = useState<PrayerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all"|"pending"|"answered">("all");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("prayer_requests")
      .select("*, profiles(full_name)")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });
    setPrayers((data as PrayerWithProfile[]) || []);
    setLoading(false);
  }

  async function markAnswered(id: string) {
    const supabase = createClient();
    await supabase.from("prayer_requests").update({ is_answered: true }).eq("id", id);
    setPrayers((prev) => prev.map((p) => p.id === id ? { ...p, is_answered: true } : p));
  }

  async function archive(id: string) {
    const supabase = createClient();
    await supabase.from("prayer_requests").update({ is_archived: true }).eq("id", id);
    setPrayers((prev) => prev.filter((p) => p.id !== id));
  }

  const filtered = prayers.filter((p) => {
    if (filter === "pending") return !p.is_answered;
    if (filter === "answered") return p.is_answered;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <HandHeart className="w-6 h-6 text-gold" /> Pedidos de Oração
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{prayers.length} pedidos ativos</p>
      </div>

      <div className="flex rounded-xl bg-muted p-1">
        {([["all","Todos"],["pending","Pendentes"],["answered","Respondidos"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${filter===k?"bg-card text-foreground shadow-sm":"text-muted-foreground"}`}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="skeleton h-20 rounded-xl"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum pedido encontrado.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{p.profiles?.full_name || "Membro"}</span>
                  {p.is_public ? <Globe className="w-3 h-3 text-gold" /> : <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                {p.is_answered && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-medium">Respondido</span>}
              </div>
              <p className="font-semibold text-sm">{p.title}</p>
              {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] text-muted-foreground">{formatDateTime(p.created_at)}</p>
                <div className="flex items-center gap-2">
                  {!p.is_answered && (
                    <button onClick={() => markAnswered(p.id)} className="text-[10px] px-2 py-1 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Respondido
                    </button>
                  )}
                  <button onClick={() => archive(p.id)} className="text-[10px] px-2 py-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <Archive className="w-3 h-3" /> Arquivar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
