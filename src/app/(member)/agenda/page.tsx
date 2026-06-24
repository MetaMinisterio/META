"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, List, ChevronLeft, ChevronRight, MapPin, Clock, Cake, X, CalendarDays } from "lucide-react";
import type { Event, Profile } from "@/lib/types/database";

type DayItem =
  | { kind: "event"; data: Event }
  | { kind: "birthday"; data: Pick<Profile, "full_name" | "birth_date"> };

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function pad2(n: number) {
  return String(n).padStart(2, "0");
}

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEK_DAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export default function AgendaPage() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [today] = useState(new Date());
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [events, setEvents] = useState<Event[]>([]);
  const [birthdays, setBirthdays] = useState<Pick<Profile, "full_name" | "birth_date">[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null); // "YYYY-MM-DD"
  const [detailItem, setDetailItem] = useState<DayItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const monthStart = `${cursor.year}-${pad2(cursor.month + 1)}-01`;
    const nextMonth = new Date(cursor.year, cursor.month + 1, 1);
    const monthEnd = `${nextMonth.getFullYear()}-${pad2(nextMonth.getMonth() + 1)}-01`;

    const [{ data: evs }, { data: bdays }] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .gte("event_date", monthStart)
        .lt("event_date", monthEnd)
        .order("event_date"),
      supabase
        .from("profiles")
        .select("full_name, birth_date")
        .not("birth_date", "is", null)
        .eq("is_active", true),
    ]);

    setEvents((evs as Event[]) || []);
    // Filter birthdays that fall in this month
    const m = cursor.month + 1;
    setBirthdays(
      ((bdays || []) as Pick<Profile, "full_name" | "birth_date">[]).filter((p) => {
        const bd = p.birth_date;
        if (!bd) return false;
        const bMonth = parseInt(bd.slice(5, 7), 10);
        return bMonth === m;
      })
    );
    setLoading(false);
  }, [cursor]);

  useEffect(() => { load(); }, [load]);

  // Build day → items map
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

  function prevMonth() {
    setCursor((c) => {
      const d = new Date(c.year, c.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelected(null);
  }
  function nextMonth() {
    setCursor((c) => {
      const d = new Date(c.year, c.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelected(null);
  }

  const daysInMonth = getDaysInMonth(cursor.year, cursor.month);
  const firstWd = getFirstWeekday(cursor.year, cursor.month);
  const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

  // List: merge events + birthdays sorted by date
  const listItems: { date: string; item: DayItem }[] = [];
  for (const [date, items] of Array.from(dayMap.entries()).sort()) {
    for (const item of items) listItems.push({ date, item });
  }

  const selectedItems = selected ? (dayMap.get(selected) || []) : [];

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-gold" />
            Agenda
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Eventos e aniversários</p>
        </div>
        {/* View toggle */}
        <div className="flex rounded-xl bg-muted p-0.5">
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendário
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <List className="w-3.5 h-3.5" /> Lista
          </button>
        </div>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-sm">
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="skeleton h-64 rounded-2xl" />
      ) : view === "calendar" ? (
        <>
          {/* Calendar grid */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Week headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {WEEK_DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstWd }).map((_, i) => (
                <div key={`empty-${i}`} className="h-12 border-b border-r border-border/40" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const key = `${cursor.year}-${pad2(cursor.month + 1)}-${pad2(day)}`;
                const items = dayMap.get(key) || [];
                const isToday = key === todayKey;
                const isSelected = key === selected;
                const hasEvent = items.some((i) => i.kind === "event");
                const hasBirthday = items.some((i) => i.kind === "birthday");
                const col = (firstWd + day - 1) % 7;
                const isLast = col === 6;
                return (
                  <button
                    key={key}
                    onClick={() => setSelected(key === selected ? null : key)}
                    className={`relative h-12 flex flex-col items-center justify-start pt-1.5 transition-colors border-b ${isLast ? "" : "border-r"} border-border/40 ${
                      isSelected ? "bg-gold/10" : "hover:bg-muted/40"
                    }`}
                  >
                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? "bg-gold text-black font-bold" : "text-foreground"
                    }`}>
                      {day}
                    </span>
                    <div className="flex gap-0.5 mt-0.5">
                      {hasEvent && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
                      {hasBirthday && <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gold inline-block" /> Evento</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500 inline-block" /> Aniversário</span>
          </div>

          {/* Selected day items */}
          {selected && selectedItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {new Date(selected + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              {selectedItems.map((item, idx) => (
                <button key={idx} onClick={() => setDetailItem(item)} className="w-full text-left">
                  <DayItemCard item={item} />
                </button>
              ))}
            </div>
          )}
          {selected && selectedItems.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-4">Nenhum evento ou aniversário nesse dia.</p>
          )}
        </>
      ) : (
        /* List view */
        <div className="space-y-2">
          {listItems.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum evento ou aniversário neste mês.</p>
            </div>
          ) : (
            listItems.map(({ date, item }, idx) => {
              const showDateLabel = idx === 0 || listItems[idx - 1].date !== date;
              return (
                <div key={`${date}-${idx}`}>
                  {showDateLabel && (
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-1.5">
                      {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                  )}
                  <button className="w-full text-left" onClick={() => setDetailItem(item)}>
                    <DayItemCard item={item} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Detail modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                detailItem.kind === "event" ? "bg-gold/20 text-gold" : "bg-pink-500/20 text-pink-500"
              }`}>
                {detailItem.kind === "event" ? "Evento" : "Aniversário"}
              </span>
              <button onClick={() => setDetailItem(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {detailItem.kind === "event" ? (
                <EventDetail event={detailItem.data} />
              ) : (
                <BirthdayDetail profile={detailItem.data} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DayItemCard({ item }: { item: DayItem }) {
  if (item.kind === "event") {
    const ev = item.data;
    const date = new Date(ev.event_date);
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex flex-col items-center justify-center">
          <span className="text-[9px] font-semibold text-gold uppercase">{date.toLocaleDateString("pt-BR", { month: "short" })}</span>
          <span className="text-sm font-bold leading-none">{date.getDate()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{ev.title}</p>
          <div className="flex flex-wrap gap-2 mt-0.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gold" />{date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold" />{ev.location}</span>}
          </div>
        </div>
      </div>
    );
  }
  const bd = item.data.birth_date!;
  const day = parseInt(bd.slice(8, 10), 10);
  const month = parseInt(bd.slice(5, 7), 10) - 1;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-pink-500/20 bg-card hover:border-pink-500/40 transition-colors">
      <div className="shrink-0 w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
        <Cake className="w-4 h-4 text-pink-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{item.data.full_name}</p>
        <p className="text-[11px] text-muted-foreground">Aniversário · {day} de {MONTH_NAMES[month]}</p>
      </div>
    </div>
  );
}

function EventDetail({ event: ev }: { event: Event }) {
  const date = new Date(ev.event_date);
  return (
    <>
      {ev.image_url && (
        <img src={ev.image_url} alt="" className="w-full h-36 object-cover rounded-xl" />
      )}
      <h2 className="font-bold text-lg">{ev.title}</h2>
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold shrink-0" />
          {date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })} às {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
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
      <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto mb-3">
        <Cake className="w-8 h-8 text-pink-500" strokeWidth={1.5} />
      </div>
      <h2 className="font-bold text-lg">{profile.full_name}</h2>
      <p className="text-muted-foreground text-sm mt-1">{day} de {MONTH_NAMES[month]}</p>
      {birthYear > 1900 && <p className="text-xs text-muted-foreground mt-0.5">{age} anos</p>}
    </div>
  );
}

