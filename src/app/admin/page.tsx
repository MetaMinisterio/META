import { createClient } from "@/lib/supabase/server";
import { Users, HandHeart, Calendar, Megaphone, TrendingUp, Heart } from "lucide-react";

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
    { label: "Membros", value: membersCount || 0, icon: Users, color: "from-blue-500/20 to-blue-600/5" },
    { label: "Pedidos de Oração", value: prayersCount || 0, icon: HandHeart, color: "from-amber-500/20 to-amber-600/5" },
    { label: "Eventos Ativos", value: eventsCount || 0, icon: Calendar, color: "from-green-500/20 to-green-600/5" },
    { label: "Contribuições Pendentes", value: pendingTithes || 0, icon: Heart, color: "from-red-500/20 to-red-600/5" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel Administrativo</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da igreja META.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 hover:border-gold/30 transition-colors">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-gold" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gold" /> Ações Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { href: "/admin/membros", label: "Ver Membros", icon: Users },
            { href: "/admin/oracoes", label: "Ver Orações", icon: HandHeart },
            { href: "/admin/banners", label: "Gerenciar Banners", icon: Megaphone },
            { href: "/admin/eventos", label: "Criar Evento", icon: Calendar },
          ].map((a) => (
            <a key={a.href} href={a.href} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-muted hover:border-gold/30 transition-colors text-center">
              <a.icon className="w-5 h-5 text-gold" />
              <span className="text-xs font-medium">{a.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
