import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  FileText,
  HandHeart,
  Megaphone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Início",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch data in parallel for performance
  const [
    { data: profile },
    { data: banners },
    { data: events },
    { data: announcements },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .single(),
    supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(5),
    supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(5),
    supabase
      .from("announcements")
      .select("*")
      .eq("is_published", true)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(5),
  ]);

  const firstName = profile?.full_name?.split(" ")[0] || "Membro";

  return (
    <div className="space-y-6 pb-4">
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-sm">Olá,</p>
        <h1 className="text-2xl font-bold tracking-tight">
          {firstName}! <span className="text-gold">✦</span>
        </h1>
      </div>

      {/* Banners Carousel */}
      {banners && banners.length > 0 && (
        <section>
          <div className="flex overflow-x-auto gap-3 no-scrollbar -mx-4 px-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="relative shrink-0 w-[85vw] max-w-[340px] aspect-[16/9] rounded-2xl overflow-hidden border border-border bg-card"
              >
                {banner.image_url ? (
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full gold-gradient opacity-20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-semibold">
                    {banner.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick placeholder banners when empty */}
      {(!banners || banners.length === 0) && (
        <section>
          <div className="flex overflow-x-auto gap-3 no-scrollbar -mx-4 px-4">
            {[
              "Culto da Família — Domingo 18h",
              "Jovens META — Sexta 20h",
            ].map((text, i) => (
              <div
                key={i}
                className="relative shrink-0 w-[85vw] max-w-[340px] aspect-[16/9] rounded-2xl overflow-hidden border border-border bg-card"
              >
                <div className="w-full h-full bg-gradient-to-br from-gold/20 via-gold/5 to-transparent flex items-center justify-center">
                  <div className="text-center px-4">
                    <div className="w-10 h-10 rounded-lg gold-gradient mx-auto mb-2 flex items-center justify-center">
                      <span className="text-black font-extrabold text-sm">
                        M
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section className="grid grid-cols-4 gap-3">
        {[
          {
            href: "/oracoes",
            icon: HandHeart,
            label: "Orar",
            color: "from-amber-500/20 to-amber-600/5",
          },
          {
            href: "/contribuir",
            icon: FileText,
            label: "Ofertar",
            color: "from-green-500/20 to-green-600/5",
          },
          {
            href: "/eventos",
            icon: Calendar,
            label: "Eventos",
            color: "from-blue-500/20 to-blue-600/5",
          },
          {
            href: "/arquivos",
            icon: Megaphone,
            label: "Arquivos",
            color: "from-purple-500/20 to-purple-600/5",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card hover:border-gold/30 transition-all duration-200"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}
            >
              <item.icon className="w-5 h-5 text-gold" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">
              {item.label}
            </span>
          </Link>
        ))}
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Próximos Eventos</h2>
          <Link
            href="/eventos"
            className="text-xs text-gold font-medium flex items-center gap-0.5 hover:text-gold-light transition-colors"
          >
            Ver todos <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {events && events.length > 0 ? (
          <div className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gold/10 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-medium text-gold uppercase">
                    {new Date(event.event_date).toLocaleDateString("pt-BR", {
                      month: "short",
                    })}
                  </span>
                  <span className="text-lg font-bold text-foreground leading-none">
                    {new Date(event.event_date).getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(event.event_date)}
                    {event.location && ` · ${event.location}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum evento programado.
          </div>
        )}
      </section>

      {/* Announcements */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Avisos</h2>
        </div>

        {announcements && announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-xl border border-border bg-card"
              >
                <div className="flex items-start gap-2">
                  {ann.is_pinned && (
                    <span className="text-gold text-xs font-bold">📌</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{ann.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {ann.content}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {formatDateTime(ann.published_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum aviso no momento.
          </div>
        )}
      </section>
    </div>
  );
}
