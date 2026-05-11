"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Image as ImageIcon, Megaphone, Calendar,
  HandHeart, FolderOpen, Menu, X, ChevronLeft,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/membros", label: "Membros", icon: Users },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/avisos", label: "Avisos", icon: Megaphone },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  { href: "/admin/oracoes", label: "Orações", icon: HandHeart },
  { href: "/admin/arquivos", label: "Arquivos", icon: FolderOpen },
];

export default function AdminSidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/80 text-foreground">
      <div className="h-16 border-b border-zinc-800/80 flex items-center justify-between px-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shadow-lg shadow-gold/10">
            <span className="text-black font-extrabold text-xs tracking-tighter">M</span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight leading-tight">META Admin</p>
            <p className="text-[10px] text-zinc-500 capitalize leading-tight">{userRole}</p>
          </div>
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden text-zinc-400 hover:text-white transition-colors">
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active ? "bg-zinc-900 text-white shadow-sm border border-zinc-800/50" : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent"
              }`}>
              <l.icon className={`w-4 h-4 ${active ? "text-gold" : "group-hover:text-gold transition-colors"}`} strokeWidth={1.5} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-5 border-t border-zinc-800/80 bg-black/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400">
            {userName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-medium truncate text-zinc-300">{userName}</p>
        </div>
        
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-medium text-gold hover:text-gold-light transition-colors group">
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Voltar ao App
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-lg">
        <Menu className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Mobile overlay */}
      {open && <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity" />}

      {/* Sidebar mobile */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebar}
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {sidebar}
      </aside>
    </>
  );
}
