"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Megaphone, Plus, Trash2, Loader2, Pin } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Announcement } from "@/lib/types/database";

export default function AdminAvisosPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("announcements").select("*").order("is_pinned", { ascending: false }).order("published_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("announcements").insert({ title, content, created_by: user?.id });
    setTitle(""); setContent("");
    setSaving(false);
    load();
  }

  async function togglePin(id: string, pinned: boolean) {
    const supabase = createClient();
    await supabase.from("announcements").update({ is_pinned: !pinned }).eq("id", id);
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, is_pinned: !pinned } : a));
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("announcements").delete().eq("id", id);
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Megaphone className="w-6 h-6 text-gold" /> Avisos</h1>
        <p className="text-sm text-muted-foreground mt-1">Publique comunicados para os membros.</p>
      </div>

      <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-gold" /> Novo Aviso</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do aviso" required
          className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Conteúdo do aviso..." rows={3} required
          className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors resize-none" />
        <button type="submit" disabled={saving} className="btn-gold px-6 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Publicar
        </button>
      </form>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="skeleton h-20 rounded-xl"/>)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum aviso publicado.</div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {a.is_pinned && <span className="text-gold">📌</span>}
                    <p className="font-semibold text-sm">{a.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{formatDateTime(a.published_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePin(a.id, a.is_pinned)} className={`p-1.5 rounded-lg transition-colors ${a.is_pinned ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-foreground"}`}>
                    <Pin className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
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
