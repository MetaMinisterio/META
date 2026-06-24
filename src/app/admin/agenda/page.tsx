"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CalendarDays, Calendar, List, ChevronLeft, ChevronRight,
  MapPin, Clock, Cake, X, Plus, Edit2, Trash2, AlertTriangle,
} from "lucide-react";
import type { Event, Profile } from "@/lib/types/database";

type DayItem =
  | { kind: "event"; data: Event }
  | { kind: "birthday"; data: Pick<Profile, "full_name" | "birth_date"> };

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEK_DAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function pad2(n: number) { return String(n).padStart(2, "0"); }
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstWeekday(y: number, m: number) { return new Date(y, m, 1).getDay(); }

type EventForm = {
  title: string; description: string; location: string;
  event_date: string; event_time: string; image_url: string; is_published: boolean;
};

const emptyForm: EventForm = {
  title: "", description: "", location: "",
  event_date: "", event_time: "19:00", image_url: "", is_published: true,
};

export default function AdminAgendaPage() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [today] = useState(new Date());
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [events, setEvents] = useState<Event[]>([]);
  const [birthdays, setBirthdays] = useState<Pick<Profile, "full_name" | "birth_date">[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<DayItem | null>(null);
  const [modal, setModal] = useState<"none" | "create" | "edit" | "delete">("none");
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const monthStart = `${cursor.year}-${pad2(cursor.month + 1)}-01`;
    const nextM = new Date(cursor.year, cursor.month + 1, 1);
    const monthEnd = `${nextM.getFullYear()}-${pad2(nextM.getMonth() + 1)}-01`;

    const [{ data: evs }, { data: bdays }] = await Promise.all([
      supabase.from("events").select("*").gte("event_date", monthStart).lt("event_date", monthEnd).order("event_date"),
      supabase.from("profiles").select("full_name, birth_date").not("birth_date", "is", null).eq("is_active", true),
    ]);
    setEvents((evs as Event[]) || []);
    const m = cursor.month + 1;
    setBirthdays(
      ((bdays || []) as Pick<Profile, "full_name" | "birth_date">[]).filter((p) => {
        const bd = p.birth_date; if (!bd) return false;
        return parseInt(bd.slice(5, 7), 10) === m;
      })
    );
    setLoading(false);
  }, [cursor]);

  useEffect(() => { load(); }, [load]);

  const dayMap = new Map<string, DayItem[]>();
  for (const ev of events) {
    const key = ev.event_date.slice(0, 10);
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push({ kind: "event", data: ev });
  }
  for (const b of birthdays) {
    const bd = b.birth_date!;
    const key = `${cursor.year}-${bd.slice(5, 7)}-${bd.slice(8, 10)}`;
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push({ kind: "birthday", data: b });
  }

  function prevMonth() { setCursor((c) => { const d = new Date(c.year, c.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; }); setSelected(null); }
  function nextMonth() { setCursor((c) => { const d = new Date(c.year, c.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; }); setSelected(null); }

  function openCreate(date?: string) {
    setForm({ ...emptyForm, event_date: date || "" });
    setEditingId(null); setError(null); setDetailItem(null); setModal("create");
  }
  function openEdit(ev: Event) {
    const dt = new Date(ev.event_date);
    setForm({
      title: ev.title, description: ev.description || "", location: ev.location || "",
      event_date: ev.event_date.slice(0, 10),
      event_time: dt.toTimeString().slice(0, 5),
      image_url: ev.image_url || "", is_published: ev.is_published,
    });
    setEditingId(ev.id); setError(null); setDetailItem(null); setModal("edit");
  }

  async function handleSave() {
    if (!form.title || !form.event_date) { setError("Título e data são obrigatórios."); return; }
    setSaving(true); setError(null);
    const supabase = createClient();
    const payload = {
      title: form.title,
      description: form.description || null,
      location: form.location || null,
      event_date: `${form.event_date}T${form.event_time}:00`,
      image_url: form.image_url || null,
      is_published: form.is_published,
    };
    if (modal === "create") {
      const { data, error: err } = await supabase.from("events").insert(payload).select().single();
      if (err) { setError("Erro ao criar evento."); setSaving(false); return; }
      setEvents((prev) => [...prev, data as Event].sort((a, b) => a.event_date.localeCompare(b.event_date)));
    } else if (editingId) {
      const { error: err } = await supabase.from("events").update(payload).eq("id", editingId);
      if (err) { setError("Erro ao atualizar evento."); setSaving(false); return; }
      setEvents((prev) => prev.map((e) => e.id === editingId ? { ...e, ...payload } as Event : e));
    }
    setModal("none"); setSaving(false);
  }

  async function handleDelete() {
    if (!editingId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", editingId);
    setEvents((prev) => prev.filter((e) => e.id !== editingId));
    setModal("none"); setDetailItem(null); setSaving(false);
  }

  const daysInMonth = getDaysInMonth(cursor.year, cursor.month);
  const firstWd = getFirstWeekday(cursor.year, cursor.month);
  const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
  const selectedItems = selected ? (dayMap.get(selected) || []) : [];
  const listItems: { date: string; item: DayItem }[] = [];
  for (const [date, items] of Array.from(dayMap.entries()).sort())
    for (const item of items) listItems.push({ date, item });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-gold" /> Agenda
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie eventos e visualize aniversários</p>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Novo Evento
        </button>
      </div>

      {/* View toggle + month nav */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex rounded-xl bg-muted p-0.5">
          <button onClick={() => setView("calendar")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            <Calendar className="w-3.5 h-3.5" /> Calendário
          </button>
          <button onClick={() => setView("list")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            <List className="w-3.5 h-3.5" /> Lista
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="font-semibold text-sm min-w-28 text-center">{MONTH_NAMES[cursor.month]} {cursor.year}</span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {loading ? <div className="skeleton h-72 rounded-2xl" /> : view === "calendar" ? (
        <>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border">
              {WEEK_DAYS.map((d) => <div key={d} className="py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstWd }).map((_, i) => <div key={`e${i}`} className="h-14 border-b border-r border-border/40" />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const key = `${cursor.year}-${pad2(cursor.month + 1)}-${pad2(day)}`;
                const items = dayMap.get(key) || [];
                const isToday = key === todayKey;
                const isSelected = key === selected;
                const hasEvent = items.some((i) => i.kind === "event");
                const hasBirthday = items.some((i) => i.kind === "birthday");
                const col = (firstWd + day - 1) % 7;
                return (
                  <button key={key} onClick={() => setSelected(key === selected ? null : key)}
                    className={`relative h-14 flex flex-col items-center justify-start pt-1.5 transition-colors border-b ${col === 6 ? "" : "border-r"} border-border/40 ${isSelected ? "bg-gold/10" : "hover:bg-muted/40"}`}>
                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-gold text-black font-bold" : "text-foreground"}`}>{day}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {hasEvent && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
                      {hasBirthday && <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gold inline-block" />Evento</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />Aniversário</span>
          </div>
          {selected && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {new Date(selected + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <button onClick={() => openCreate(selected)} className="text-xs text-gold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Adicionar</button>
              </div>
              {selectedItems.length === 0
                ? <p className="text-xs text-muted-foreground">Nenhum item nesse dia.</p>
                : selectedItems.map((item, idx) => (
                  <AdminDayCard key={idx} item={item} onEdit={(ev) => openEdit(ev)} onDelete={(ev) => { setEditingId(ev.id); setModal("delete"); }} onDetail={(i) => setDetailItem(i)} />
                ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          {listItems.length === 0
            ? <div className="text-center py-16"><Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Nenhum item neste mês.</p></div>
            : listItems.map(({ date, item }, idx) => {
              const showLabel = idx === 0 || listItems[idx - 1].date !== date;
              return (
                <div key={`${date}-${idx}`}>
                  {showLabel && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-1.5">{new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>}
                  <AdminDayCard item={item} onEdit={(ev) => openEdit(ev)} onDelete={(ev) => { setEditingId(ev.id); setModal("delete"); }} onDetail={(i) => setDetailItem(i)} />
                </div>
              );
            })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold">{modal === "create" ? "Novo Evento" : "Editar Evento"}</h2>
              <button onClick={() => setModal("none")} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Título *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors" placeholder="Ex: Culto Dominical" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Data *</label>
                  <input type="date" value={form.event_date} onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Horário</label>
                  <input type="time" value={form.event_time} onChange={(e) => setForm((f) => ({ ...f, event_time: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Local</label>
                <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors" placeholder="Santuário principal" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors resize-none" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="text-sm font-medium">Publicado</p>
                  <p className="text-xs text-muted-foreground">Visível para os membros</p>
                </div>
                <button onClick={() => setForm((f) => ({ ...f, is_published: !f.is_published }))} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.is_published ? "bg-green-500" : "bg-zinc-400 dark:bg-zinc-600"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.is_published ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal("none")} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-semibold disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {modal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-6 h-6 text-red-500" strokeWidth={1.5} /></div>
            <h2 className="font-bold mb-2">Excluir evento?</h2>
            <p className="text-sm text-muted-foreground mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setModal("none")} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">{saving ? "..." : "Excluir"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${detailItem.kind === "event" ? "bg-gold/20 text-gold" : "bg-pink-500/20 text-pink-500"}`}>
                {detailItem.kind === "event" ? "Evento" : "Aniversário"}
              </span>
              <div className="flex items-center gap-1">
                {detailItem.kind === "event" && (
                  <>
                    <button onClick={() => openEdit(detailItem.data)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setEditingId(detailItem.data.id); setModal("delete"); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                )}
                <button onClick={() => setDetailItem(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {detailItem.kind === "event" ? <EventDetail event={detailItem.data} /> : <BirthdayDetail profile={detailItem.data} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDayCard({ item, onEdit, onDelete, onDetail }: {
  item: DayItem;
  onEdit: (ev: Event) => void;
  onDelete: (ev: Event) => void;
  onDetail: (item: DayItem) => void;
}) {
  if (item.kind === "event") {
    const ev = item.data;
    const date = new Date(ev.event_date);
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors">
        <button className="flex-1 min-w-0 flex items-center gap-3 text-left" onClick={() => onDetail(item)}>
          <div className="shrink-0 w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex flex-col items-center justify-center">
            <span className="text-[9px] font-semibold text-gold uppercase">{date.toLocaleDateString("pt-BR", { month: "short" })}</span>
            <span className="text-sm font-bold leading-none">{date.getDate()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{ev.title}</p>
            <div className="flex flex-wrap gap-2 mt-0.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gold" />{date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
              {ev.location && <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 text-gold shrink-0" />{ev.location}</span>}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(ev)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(ev)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-pink-500/20 bg-card">
      <div className="shrink-0 w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center"><Cake className="w-4 h-4 text-pink-500" /></div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{item.data.full_name}</p>
        <p className="text-[11px] text-muted-foreground">Aniversário</p>
      </div>
    </div>
  );
}

function EventDetail({ event: ev }: { event: Event }) {
  const date = new Date(ev.event_date);
  return (
    <>
      {ev.image_url && <img src={ev.image_url} alt="" className="w-full h-36 object-cover rounded-xl" />}
      <h2 className="font-bold text-lg">{ev.title}</h2>
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold shrink-0" />{date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })} às {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
        {ev.location && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold shrink-0" />{ev.location}</p>}
      </div>
      {ev.description && <p className="text-sm text-muted-foreground leading-relaxed">{ev.description}</p>}
    </>
  );
}

function BirthdayDetail({ profile }: { profile: Pick<Profile, "full_name" | "birth_date"> }) {
  const bd = profile.birth_date!;
  const day = parseInt(bd.slice(8, 10), 10);
  const month = parseInt(bd.slice(5, 7), 10) - 1;
  const birthYear = parseInt(bd.slice(0, 4), 10);
  const age = new Date().getFullYear() - birthYear;
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto mb-3"><Cake className="w-8 h-8 text-pink-500" strokeWidth={1.5} /></div>
      <h2 className="font-bold text-lg">{profile.full_name}</h2>
      <p className="text-muted-foreground text-sm mt-1">{day} de {MONTH_NAMES[month]}</p>
      {birthYear > 1900 && <p className="text-xs text-muted-foreground mt-0.5">{age} anos</p>}
    </div>
  );
}
