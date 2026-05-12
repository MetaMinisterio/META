"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Plus, Trash2, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { createEvent } from "@/lib/actions/events";

export default function AdminEventosPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", location: "", event_date: "", end_date: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  }

  async function handleCreate(formData: FormData) {
    if (!formData.get("title") || !formData.get("event_date")) return;
    setSaving(true);
    
    await createEvent(formData);
    
    setForm({ title: "", description: "", location: "", event_date: "", end_date: "" });
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Calendar className="w-6 h-6 text-gold" /> Eventos</h1>
        <p className="text-sm text-muted-foreground mt-1">Agende cultos e eventos.</p>
      </div>

      <form action={handleCreate} className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-gold" /> Novo Evento</h3>
        <input name="title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nome do evento" required
          className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
        <textarea name="description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição (opcional)" rows={2}
          className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors resize-none" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Início</label>
            <input name="event_date" type="datetime-local" value={form.event_date} onChange={(e) => setForm(f => ({ ...f, event_date: e.target.value }))} required
              className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Fim (opcional)</label>
            <input name="end_date" type="datetime-local" value={form.end_date} onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
          </div>
        </div>
        <input name="location" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Local (opcional)"
          className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
        <button type="submit" disabled={saving} className="btn-gold px-6 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Criar Evento
        </button>
      </form>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum evento criado.</div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">{ev.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(ev.event_date)}{ev.location ? ` · ${ev.location}` : ""}</p>
              </div>
              <button onClick={() => handleDelete(ev.id)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
