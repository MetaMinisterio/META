import { createClient } from "@/lib/supabase/server";
import { Users, HandHeart, Calendar, Megaphone, TrendingUp, Heart, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: membersCount },
    { count: prayersCount },
    { count: eventsCount },
    { count: pendingTithes },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("is_archived", false),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("tithes").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const stats = [
    { label: "Total de Membros", value: membersCount || 0, icon: Users, trend: "+12%", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Orações Ativas", value: prayersCount || 0, icon: HandHeart, trend: "+5%", color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Eventos Publicados", value: eventsCount || 0, icon: Calendar, trend: "Estável", color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Aprovações Pendentes", value: pendingTithes || 0, icon: Heart, trend: "Atenção", color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Painel de Controle</h1>
        <p className="text-sm text-muted-foreground">Acompanhe as métricas e gerencie a Igreja META em tempo real.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-gold/30 transition-colors">
            {/* Subtle Gradient Glow */}
            <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full ${s.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} border border-border flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} strokeWidth={1.5} />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-[10px] font-medium text-muted-foreground">
                {s.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3 text-green-500" strokeWidth={2} /> : null}
                {s.trend}
              </span>
            </div>
            
            <p className="text-3xl font-bold text-foreground tracking-tight">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-gold" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-foreground tracking-tight">Ações Rápidas</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { href: "/admin/membros", label: "Membros", desc: "Gerenciar usuários", icon: Users },
              { href: "/admin/oracoes", label: "Orações", desc: "Ver mural", icon: HandHeart },
              { href: "/admin/banners", label: "Banners", desc: "Carrossel App", icon: Megaphone },
              { href: "/admin/eventos", label: "Eventos", desc: "Agenda", icon: Calendar },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="group block">
                <div className="h-full flex flex-col items-center text-center p-6 rounded-xl border border-border bg-muted/30 hover:bg-muted hover:border-gold/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <a.icon className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{a.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">{a.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Status placeholder */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-lg font-bold text-foreground tracking-tight mb-6">Status do Sistema</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-foreground">Banco de Dados</span>
              </div>
              <span className="text-xs text-green-500 font-mono">12ms</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-foreground">Autenticação</span>
              </div>
              <span className="text-xs text-green-500 font-mono">Online</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-foreground">Storage API</span>
              </div>
              <span className="text-xs text-green-500 font-mono">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
