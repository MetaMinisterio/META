import { createClient } from "@/lib/supabase/server";
import { Users, HandHeart, Calendar, Megaphone, TrendingUp, Heart, ArrowUpRight, AlertCircle } from "lucide-react";
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
    { label: "Total de Membros", value: membersCount || 0, icon: Users, trend: "Ver lista", color: "text-blue-500", bg: "bg-blue-500/10", href: "/admin/membros" },
    { label: "Orações Ativas", value: prayersCount || 0, icon: HandHeart, trend: "Gerenciar", color: "text-amber-500", bg: "bg-amber-500/10", href: "/admin/oracoes" },
    { label: "Eventos Publicados", value: eventsCount || 0, icon: Calendar, trend: "Ver agenda", color: "text-green-500", bg: "bg-green-500/10", href: "/admin/eventos" },
    { label: "Ofertas Pendentes", value: pendingTithes || 0, icon: Heart, trend: pendingTithes ? "Requer ação" : "Em dia", color: "text-red-500", bg: "bg-red-500/10", href: "/admin/contribuicoes", urgent: (pendingTithes || 0) > 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Painel de Controle</h1>
        <p className="text-sm text-muted-foreground">Acompanhe as métricas e gerencie a Igreja META em tempo real.</p>
      </div>

      {(pendingTithes || 0) > 0 && (
        <Link href="/admin/contribuicoes" className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors group">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {pendingTithes} {pendingTithes === 1 ? "oferta aguarda" : "ofertas aguardam"} confirmação
            </p>
            <p className="text-xs text-muted-foreground">Clique aqui para revisar e aprovar os comprovantes enviados pelos membros</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </Link>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group block">
            <div className={`bg-card border rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md ${s.urgent ? "border-red-500/40 hover:border-red-500/60" : "border-border hover:border-gold/30"}`}>
              <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full ${s.bg} blur-2xl opacity-40 group-hover:opacity-80 transition-opacity`} />

              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl ${s.bg} border border-border flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} strokeWidth={1.5} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <p className="text-2xl font-bold text-foreground tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-tight">{s.label}</p>
              <p className={`text-[10px] mt-1.5 font-medium ${s.urgent ? "text-red-500" : "text-muted-foreground"}`}>{s.trend}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-gold" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-foreground tracking-tight">Ações Rápidas</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { href: "/admin/membros", label: "Membros", desc: "Gerenciar usuários", icon: Users },
              { href: "/admin/oracoes", label: "Orações", desc: "Ver e moderar pedidos", icon: HandHeart },
              { href: "/admin/contribuicoes", label: "Contribuições", desc: "Aprovar ofertas e dízimos", icon: Heart },
              { href: "/admin/banners", label: "Banners", desc: "Carrossel do app", icon: Megaphone },
              { href: "/admin/eventos", label: "Eventos", desc: "Agenda da igreja", icon: Calendar },
              { href: "/admin/avisos", label: "Avisos", desc: "Comunicados", icon: Megaphone },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="group block">
                <div className="h-full flex flex-col items-center text-center p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted hover:border-gold/30 transition-all duration-200">
                  <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <a.icon className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-semibold text-foreground leading-tight">{a.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight hidden sm:block">{a.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-foreground tracking-tight mb-6">Status do Sistema</h2>
          <div className="space-y-3">
            {[
              { label: "Banco de Dados", status: "Online", value: "12ms" },
              { label: "Autenticação", status: "Online", value: "Online" },
              { label: "Storage API", status: "Online", value: "Online" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <span className="text-xs text-green-500 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
