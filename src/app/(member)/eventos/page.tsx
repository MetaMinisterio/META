import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";
import { Calendar, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Eventos" };

export default async function EventosPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-gold" />
          Eventos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Agenda de cultos e eventos.</p>
      </div>

      {events && events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => {
            const date = new Date(event.event_date);
            return (
              <div key={event.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:border-gold/30 transition-colors">
                {event.image_url ? (
                  <div className="aspect-[21/9] overflow-hidden">
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ) : <div className="h-2 gold-gradient opacity-50" />}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-gold/10 flex flex-col items-center justify-center border border-gold/20">
                      <span className="text-[10px] font-semibold text-gold uppercase">{date.toLocaleDateString("pt-BR",{month:"short"})}</span>
                      <span className="text-xl font-bold leading-none mt-0.5">{date.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base">{event.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gold" />{date.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span>
                        {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold" />{event.location}</span>}
                      </div>
                      {event.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{event.description}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum evento programado.</p>
        </div>
      )}
    </div>
  );
}
