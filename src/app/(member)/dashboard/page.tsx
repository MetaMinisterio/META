import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  FileText,
  HandHeart,
  Megaphone,
  Users,
} from "lucide-react";
import AnnouncementsGrid from "@/components/member/AnnouncementsGrid";
import EventsList from "@/components/member/EventsList";

export const metadata: Metadata = {
  title: "Início",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch data in parallel for performance
  const [
    { data: profile },
    { data: banners },
    { data: events },
    { data: announcements },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user!.id).single(),
    supabase.from("banners").select("*").eq("is_active", true).order("display_order", { ascending: true }).limit(5),
    supabase.from("events").select("*").eq("is_published", true).gte("event_date", new Date().toISOString()).order("event_date", { ascending: true }).limit(5),
    supabase.from("announcements").select("*").eq("is_published", true).order("is_pinned", { ascending: false }).order("published_at", { ascending: false }).limit(5),
  ]);

  // Fallback chain: profile > Google metadata (name) > generic
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Membro";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase mb-1">Visão Geral</p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Olá, {firstName} <span className="text-gold">✦</span>
        </h1>
      </div>

      {/* Banners Carousel */}
      <section>
        <div className="flex overflow-x-auto gap-4 md:gap-6 no-scrollbar snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {banners && banners.length > 0 ? (
            banners.map((banner) => (
              <div
                key={banner.id}
                className="relative shrink-0 w-[90vw] md:w-[70vw] lg:w-[60vw] max-w-4xl aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden border border-border bg-card snap-center group"
              >
                {banner.image_url ? (
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center relative overflow-hidden">
                    <Megaphone className="w-64 h-64 text-muted-foreground/20 absolute -right-10 -bottom-10 rotate-[-15deg]" strokeWidth={1} />
                  </div>
                )}
                {/* Cinematic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="text-white text-lg md:text-2xl font-bold tracking-tight mb-2">
                    {banner.title}
                  </p>
                  <p className="text-zinc-300 text-sm md:text-base line-clamp-2 max-w-2xl">
                    {banner.content || "Fique por dentro do que está acontecendo em nossa comunidade."}
                  </p>
                </div>
              </div>
            ))
          ) : (
            /* Quick placeholder banners when empty */
            [
              { title: "Culto da Família", desc: "Todo domingo às 18h", icon: Users },
              { title: "Jovens META", desc: "Sexta-feira vibrante às 20h", icon: Megaphone },
            ].map((placeholder, i) => (
              <div
                key={i}
                className="relative shrink-0 w-[90vw] md:w-[70vw] lg:w-[60vw] max-w-4xl aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden border border-border bg-card snap-center group"
              >
                <div className="w-full h-full bg-muted flex items-center justify-center relative overflow-hidden">
                  <placeholder.icon className="w-64 h-64 text-muted-foreground/10 absolute -right-10 -bottom-10 rotate-[-15deg]" strokeWidth={1} />
                </div>
                {/* Cinematic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="text-white text-lg md:text-2xl font-bold tracking-tight mb-1">
                    {placeholder.title}
                  </p>
                  <p className="text-zinc-400 text-sm md:text-base">
                    {placeholder.desc}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Main Grid: Quick Actions & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Actions & Announcements */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-xl font-bold tracking-tight mb-4">Acesso Rápido</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { href: "/oracoes", icon: HandHeart, label: "Orar", color: "text-amber-500", bg: "bg-amber-500/10" },
                { href: "/contribuir", icon: FileText, label: "Ofertar", color: "text-green-500", bg: "bg-green-500/10" },
                { href: "/agenda", icon: Calendar, label: "Agenda", color: "text-blue-500", bg: "bg-blue-500/10" },
                { href: "/arquivos", icon: Megaphone, label: "Avisos", color: "text-purple-500", bg: "bg-purple-500/10" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bento-card bg-card p-4 md:p-6 flex flex-col items-center justify-center gap-3 text-center group hover:bg-muted"
                >
                  <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-semibold text-foreground transition-colors">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold tracking-tight mb-4">Mural de Avisos</h2>
            <AnnouncementsGrid announcements={announcements ?? []} />
          </section>
        </div>

        {/* Right Column: Events */}
        <div className="lg:col-span-1">
          <section className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Agenda</h2>
              <Link
                href="/agenda"
                className="text-xs text-gold font-medium hover:text-gold-light transition-colors flex items-center gap-1"
              >
                Ver todos <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <EventsList events={events ?? []} />
          </section>
        </div>
      </div>
    </div>
  );
}
