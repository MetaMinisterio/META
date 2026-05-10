"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Image, Megaphone, Calendar,
  HandHeart, FolderOpen, Menu, X, ChevronLeft,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/membros", label: "Membros", icon: Users },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/avisos", label: "Avisos", icon: Megaphone },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  { href: "/admin/oracoes", label: "Orações", icon: HandHeart },
  { href: "/admin/arquivos", label: "Arquivos", icon: FolderOpen },
];

export default function AdminSidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <span className="text-black font-extrabold text-xs">M</span>
          </div>
          <div>
            <p className="text-sm font-bold">META Admin</p>
            <p className="text-[10px] text-muted-foreground capitalize">{userRole}</p>
          </div>
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden text-muted-foreground"><X className="w-5 h-5" /></button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active ? "bg-gold/10 text-gold" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs font-medium truncate">{userName}</p>
        <Link href="/dashboard" className="text-[10px] text-gold flex items-center gap-1 mt-1 hover:text-gold-light transition-colors">
          <ChevronLeft className="w-3 h-3" /> Voltar ao App
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/60" />}

      {/* Sidebar mobile */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebar}
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
        {sidebar}
      </aside>
    </>
  );
}
