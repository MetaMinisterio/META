"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Search, Shield } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-gold/20 text-gold" },
  pastor: { label: "Pastor", color: "bg-blue-500/20 text-blue-400" },
  leader: { label: "Líder", color: "bg-green-500/20 text-green-400" },
  member: { label: "Membro", color: "bg-muted text-muted-foreground" },
};

export default function MembrosPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("*").order("full_name");
    setMembers(data || []);
    setLoading(false);
  }

  const filtered = members.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search) ||
    m.ministries?.some((min) => min.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-gold" /> Membros
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{members.length} membros cadastrados</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, telefone ou ministério..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm outline-none focus:border-gold transition-colors" />
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum membro encontrado.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors">
              <div className="shrink-0 w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center overflow-hidden">
                {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gold">{getInitials(m.full_name)}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{m.full_name || "Sem nome"}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleLabels[m.role]?.color}`}>{roleLabels[m.role]?.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">
                  {m.phone || "Sem telefone"}{m.ministries && m.ministries.length > 0 ? ` · ${m.ministries.join(", ")}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground">{m.created_at ? formatDate(m.created_at) : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
