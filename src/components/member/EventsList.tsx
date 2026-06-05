"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Calendar, MapPin, Clock, RefreshCw } from "lucide-react";

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  end_date: string | null;
  image_url: string | null;
  is_recurring: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Modal({ event, onClose }: { event: Event; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const day = new Date(event.event_date).getDate();
  const month = new Date(event.event_date).toLocaleDateString("pt-BR", { month: "short" });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-lg animate-fade-in-up">
        <div className="sm:hidden flex justify-center pb-2">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          {/* Image or date hero */}
          {event.image_url ? (
            <div className="relative h-52 shrink-0">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-5 flex items-end gap-3">
                <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">{month}</span>
                  <span className="text-2xl font-black text-white leading-none">{day}</span>
                </div>
                <p className="text-white font-bold text-lg leading-tight pb-1">{event.title}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-b border-border p-6 flex items-center gap-5 shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{month}</span>
                <span className="text-2xl font-black text-foreground leading-none">{day}</span>
              </div>
              <h2 className="text-lg font-bold text-foreground leading-snug flex-1">{event.title}</h2>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* Meta info */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="capitalize">{formatDate(event.event_date)}</span>
              </div>

              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                <span>
                  {formatTime(event.event_date)}
                  {event.end_date && ` — ${formatTime(event.end_date)}`}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}

              {event.is_recurring && (
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <RefreshCw className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Evento recorrente</span>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventsList({ events }: { events: Event[] }) {
  const [selected, setSelected] = useState<Event | null>(null);
  const close = useCallback(() => setSelected(null), []);

  if (events.length === 0) {
    return (
      <div className="bento-card p-8 flex flex-col items-center justify-center text-center">
        <Calendar className="w-8 h-8 text-muted-foreground/30 mb-3" strokeWidth={1.5} />
        <p className="text-muted-foreground text-sm">Nenhum evento programado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {events.slice(0, 4).map((event) => (
          <button
            key={event.id}
            onClick={() => setSelected(event)}
            className="bento-card bg-card p-4 flex gap-4 group cursor-pointer hover:border-blue-500/30 transition-all w-full text-left"
          >
            <div className="shrink-0 w-14 h-14 rounded-xl bg-muted border border-border flex flex-col items-center justify-center group-hover:border-blue-500/30 transition-colors">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                {new Date(event.event_date).toLocaleDateString("pt-BR", { month: "short" })}
              </span>
              <span className="text-lg font-black text-foreground leading-none mt-0.5">
                {new Date(event.event_date).getDate()}
              </span>
            </div>
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground group-hover:text-blue-500 transition-colors truncate">
                {event.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(event.event_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                {event.location && ` • ${event.location}`}
              </p>
              {event.description && (
                <p className="text-[11px] text-muted-foreground/60 mt-1 truncate">{event.description}</p>
              )}
            </div>
            <div className="shrink-0 self-center text-blue-500/50 group-hover:text-blue-500 transition-colors text-xs font-semibold">
              →
            </div>
          </button>
        ))}
      </div>

      {selected && <Modal event={selected} onClose={close} />}
    </>
  );
}
