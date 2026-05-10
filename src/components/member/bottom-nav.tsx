"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  HandHeart,
  Heart,
  Calendar,
  User,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/oracoes", label: "Oração", icon: HandHeart },
  { href: "/contribuir", label: "Ofertar", icon: Heart },
  { href: "/eventos", label: "Eventos", icon: Calendar },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <item.icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110" : ""
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-gold" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
