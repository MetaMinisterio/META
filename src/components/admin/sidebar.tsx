"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Image as ImageIcon, Megaphone, Calendar,
  HandHeart, FolderOpen, Menu, X, ChevronLeft, Heart,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/admin",              label: "Dashboard",     icon: LayoutDashboard },
  { href: "/admin/membros",      label: "Membros",       icon: Users },
  { href: "/admin/banners",      label: "Banners",       icon: ImageIcon },
  { href: "/admin/avisos",       label: "Avisos",        icon: Megaphone },
  { href: "/admin/eventos",      label: "Eventos",       icon: Calendar },
  { href: "/admin/oracoes",      label: "Orações",       icon: HandHeart },
  { href: "/admin/contribuicoes",label: "Contribuições", icon: Heart },
  { href: "/admin/arquivos",     label: "Arquivos",      icon: FolderOpen },
];

const roleLabel: Record<string, string> = {
  admin:  "Administrador",
  pastor: "Pastor",
  leader: "Líder",
  member: "Membro",
};

export default function AdminSidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    /*
     * bg-sidebar / border-sidebar-border são tokens definidos em globals.css:
     * Light: branco + borda slate-200 + sombra suave (sidebar-shadow)
     * Dark:  #0C0C0E + borda zinc-800
     */
    <div className="flex flex-col h-full bg-sidebar border-r border-[color:var(--sidebar-border)] sidebar-shadow text-foreground">

      {/* ── Brand header ── */}
      <div className="h-16 border-b border-[color:var(--sidebar-border)] flex items-center justify-between px-5 shrink-0">
        <Link href="/admin" className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shadow-sm shadow-gold/20 shrink-0">
            <span className="text-black font-extrabold text-xs tracking-tighter">M</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight leading-tight text-foreground truncate">META Admin</p>
            <p className="text-[10px] text-muted-foreground capitalize leading-tight truncate">
              {roleLabel[userRole] ?? userRole}
            </p>
          </div>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto no-scrollbar">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              ].join(" ")}
            >
              {/* Gold left indicator for active */}
              <span className={`shrink-0 w-0.5 h-4 rounded-full transition-all duration-150 ${active ? "bg-gold" : "bg-transparent"}`} />
              <l.icon
                className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-gold" : "text-muted-foreground group-hover:text-foreground"}`}
                strokeWidth={active ? 2 : 1.5}
              />
              <span className="truncate">{l.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="p-4 border-t border-[color:var(--sidebar-border)] space-y-3 shrink-0">
        {/* User info */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-medium text-foreground truncate flex-1">{userName}</p>
          <ThemeToggle />
        </div>

        {/* Back to app */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-1 text-xs font-medium text-gold hover:text-gold-light transition-colors group"
        >
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          Voltar ao App
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground shadow-sm hover:text-foreground transition-colors"
      >
        <Menu className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      {/* Sidebar mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {sidebar}
      </aside>
    </>
  );
}
