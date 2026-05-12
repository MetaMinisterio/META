import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/member/bottom-nav";
import Link from "next/link";
import { Home, HandHeart, Heart, Calendar, User, LogOut, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/oracoes", label: "Oração", icon: HandHeart },
  { href: "/contribuir", label: "Ofertar", icon: Heart },
  { href: "/eventos", label: "Eventos", icon: Calendar },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile && ["admin", "pastor"].includes(profile.role);

  return (
    <div className="min-h-dvh bg-background flex flex-col md:flex-row">
      {/* Mobile Header (md:hidden) */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 md:hidden">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center">
              <span className="text-black font-extrabold text-[10px]">M</span>
            </div>
            <span className="text-sm font-bold tracking-tight">META</span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin" className="text-xs font-semibold text-gold bg-gold/10 px-3 py-1.5 rounded-full border border-gold/20">
                Admin
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl h-dvh sticky top-0">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-gold/20">
              <span className="text-black font-extrabold text-sm">M</span>
            </div>
            <span className="font-bold tracking-tight text-lg">META</span>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:text-gold transition-colors" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800/50 space-y-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-bold text-gold hover:text-gold-light hover:bg-gold/10 border border-gold/20 transition-all"
            >
              <Settings className="w-5 h-5" strokeWidth={1.5} />
              Painel Administrativo
            </Link>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
              Sair da conta
            </button>
          </form>
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-6 overflow-x-hidden">
        {children}
      </main>

      {/* Bottom navigation for mobile */}
      <BottomNav />
    </div>
  );
}
