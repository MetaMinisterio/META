import { createClient } from "@/lib/supabase/server";
import {
  Users, HandHeart, CalendarDays, Megaphone,
  TrendingUp, TrendingDown, Wallet, Heart,
  ArrowUpRight, AlertCircle, Cake,
} from "lucide-react";
import Link from "next/link";
import { getFinancialSummary, getCategoryDistribution } from "@/lib/actions/finances";
import FinancialChart from "@/components/admin/FinancialChart";
import FinancialPieChart from "@/components/admin/FinancialPieChart";
import { getInitials } from "@/lib/utils";

function formatBRL(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  const [
    { count: membersCount },
    { count: prayersCount },
    { count: eventsCount },
    { count: pendingTithes },
    { data: recentMembers },
    { data: birthdayMembers },
    financial,
    pieData,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("is_archived", false),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("tithes").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("id, full_name, avatar_url, role, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("full_name, birth_date").not("birth_date", "is", null).eq("is_active", true),
    getFinancialSummary(6),
    getCategoryDistribution(),
  ]);

  const operationalStats = [
    { label: "Total de Membros", value: membersCount || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", href: "/admin/membros" },
    { label: "Orações Ativas", value: prayersCount || 0, icon: HandHeart, color: "text-amber-500", bg: "bg-amber-500/10", href: "/admin/oracoes" },
    { label: "Eventos Publicados", value: eventsCount || 0, icon: CalendarDays, color: "text-green-500", bg: "bg-green-500/10", href: "/admin/agenda" },
    { label: "Ofertas Pendentes", value: pendingTithes || 0, icon: Heart, color: "text-red-500", bg: "bg-red-500/10", href: "/admin/contribuicoes", urgent: (pendingTithes || 0) > 0 },
  ];

  const allBdays = (birthdayMembers || []) as { full_name: string; birth_date: string }[];
  const todayDay = now.getDate();
  const thisMonthBdays = allBdays
    .filter((p) => parseInt(p.birth_date.slice(5, 7), 10) === currentMonth && parseInt(p.birth_date.slice(8, 10), 10) >= todayDay)
    .sort((a, b) => parseInt(a.birth_date.slice(8, 10), 10) - parseInt(b.birth_date.slice(8, 10), 10))
    .slice(0, 5);

  const nextMonthBdays = allBdays
    .filter((p) => parseInt(p.birth_date.slice(5, 7), 10) === (currentMonth % 12) + 1)
    .sort((a, b) => parseInt(a.birth_date.slice(8, 10), 10) - parseInt(b.birth_date.slice(8, 10), 10))
    .slice(0, 3);

  const saldoPositive = financial.saldo >= 0;

  const storytelling = (() => {
    if (financial.incomeMonth === 0 && financial.expenseMonth === 0)
      return { msg: "Nenhum lançamento financeiro registrado este mês.", color: "text-muted-foreground", icon: "💡" };
    if (saldoPositive)
      return { msg: `Ótimo! A igreja fechou o mês com saldo positivo de ${formatBRL(financial.saldo)}.`, color: "text-green-500", icon: "✅" };
    return { msg: `Atenção: as saídas superaram as entradas em ${formatBRL(Math.abs(financial.saldo))} este mês.`, color: "text-red-500", icon: "⚠️" };
  })();

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-1">Painel de Controle</h1>
        <p className="text-sm text-muted-foreground">Acompanhe as métricas da Igreja META em tempo real.</p>
      </div>

      {(pendingTithes || 0) > 0 && (
        <Link href="/admin/contribuicoes" className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors group">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{pendingTithes} {pendingTithes === 1 ? "oferta aguarda" : "ofertas aguardam"} confirmação</p>
            <p className="text-xs text-muted-foreground">Clique para revisar os comprovantes</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </Link>
      )}

      {/* Operational KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {operationalStats.map((s) => (
          <Link key={s.label} href={s.href} className="group block">
            <div className={`bg-card border rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md ${(s as any).urgent ? "border-red-500/40 hover:border-red-500/60" : "border-border hover:border-gold/30"}`}>
              <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full ${s.bg} blur-2xl opacity-40 group-hover:opacity-80 transition-opacity`} />
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl ${s.bg} border border-border flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} strokeWidth={1.5} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-tight">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Financial KPIs */}
      <div>
        <h2 className="text-base font-bold mb-3 text-foreground">
          Financeiro — {now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-green-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 rounded-full bg-green-500/10 blur-2xl" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-500" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Entradas</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{formatBRL(financial.incomeMonth)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Receitas do mês</p>
          </div>
          <div className="bg-card border border-red-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 rounded-full bg-red-500/10 blur-2xl" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-500" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Saídas</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{formatBRL(financial.expenseMonth)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Despesas do mês</p>
          </div>
          <div className={`bg-card border rounded-2xl p-5 relative overflow-hidden ${saldoPositive ? "border-gold/30" : "border-red-500/20"}`}>
            <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 rounded-full blur-2xl ${saldoPositive ? "bg-gold/10" : "bg-red-500/10"}`} />
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${saldoPositive ? "bg-gold/10" : "bg-red-500/10"}`}>
                <Wallet className={`w-4 h-4 ${saldoPositive ? "text-gold" : "text-red-500"}`} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Saldo</span>
            </div>
            <p className={`text-2xl font-bold ${saldoPositive ? "text-gold" : "text-red-500"}`}>{formatBRL(financial.saldo)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Resultado do mês</p>
          </div>
        </div>
        <div className={`mt-3 p-3 rounded-xl bg-muted/50 border border-border text-sm ${storytelling.color} flex items-center gap-2`}>
          <span>{storytelling.icon}</span>
          <span>{storytelling.msg}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <FinancialChart initialSeries={financial.series} initialMonths={6} />
        </div>
        <div className="lg:col-span-2">
          <FinancialPieChart data={pieData} />
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" strokeWidth={1.5} />
              <h3 className="font-bold">Últimos Membros</h3>
            </div>
            <Link href="/admin/membros" className="text-xs text-gold hover:underline flex items-center gap-0.5">
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {(recentMembers || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {(recentMembers as any[]).map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center overflow-hidden shrink-0">
                    {m.avatar_url
                      ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-xs font-bold text-gold">{getInitials(m.full_name)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{m.full_name || "Sem nome"}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{m.role}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground shrink-0">
                    {new Date(m.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Birthdays */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-500" strokeWidth={1.5} />
              <h3 className="font-bold">Aniversariantes</h3>
            </div>
            <Link href="/admin/agenda" className="text-xs text-gold hover:underline flex items-center gap-0.5">
              Ver agenda <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {thisMonthBdays.length === 0 && nextMonthBdays.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum aniversário próximo.</p>
          ) : (
            <div className="space-y-4">
              {thisMonthBdays.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Este mês</p>
                  <div className="space-y-2">
                    {thisMonthBdays.map((b, i) => {
                      const day = parseInt(b.birth_date.slice(8, 10), 10);
                      const isToday = day === todayDay;
                      return (
                        <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${isToday ? "bg-pink-500/10 border border-pink-500/20" : "bg-muted/30"}`}>
                          <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                            <Cake className="w-3.5 h-3.5 text-pink-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{b.full_name}</p>
                            {isToday && <p className="text-[10px] text-pink-500 font-medium">Hoje! 🎉</p>}
                          </div>
                          <p className="text-xs font-medium text-muted-foreground shrink-0">dia {day}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {nextMonthBdays.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Próximo mês</p>
                  <div className="space-y-2">
                    {nextMonthBdays.map((b, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                          <Cake className="w-3.5 h-3.5 text-pink-500" />
                        </div>
                        <p className="text-sm font-semibold truncate flex-1">{b.full_name}</p>
                        <p className="text-xs text-muted-foreground shrink-0">dia {parseInt(b.birth_date.slice(8, 10), 10)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-gold" strokeWidth={1.5} />
          <h2 className="text-base font-bold">Ações Rápidas</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/membros",       label: "Membros",    desc: "Gerenciar usuários",  icon: Users },
            { href: "/admin/oracoes",        label: "Orações",    desc: "Moderar pedidos",     icon: HandHeart },
            { href: "/admin/contribuicoes",  label: "Financeiro", desc: "Entradas e saídas",   icon: Wallet },
            { href: "/admin/avisos",         label: "Avisos",     desc: "Comunicados",         icon: Megaphone },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="group block">
              <div className="h-full flex flex-col items-center text-center p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted hover:border-gold/30 transition-all duration-200">
                <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <a.icon className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold leading-tight">{a.label}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{a.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
