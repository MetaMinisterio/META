"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Pin, Megaphone } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_pinned: boolean;
  published_at: string;
};

function Modal({ ann, onClose }: { ann: Announcement; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-lg animate-fade-in-up">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pb-2">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          {/* Image */}
          {ann.image_url && (
            <div className="relative h-52 shrink-0">
              <img
                src={ann.image_url}
                alt={ann.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-6 pb-3 shrink-0">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {ann.is_pinned && (
                <span className="shrink-0 mt-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  <Pin className="w-2.5 h-2.5" />
                  Fixado
                </span>
              )}
              <h2 className="text-lg font-bold text-foreground leading-snug">{ann.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 overflow-y-auto flex-1">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {ann.content}
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-5 font-medium border-t border-border pt-4">
              Publicado em {formatDateTime(ann.published_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsGrid({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [selected, setSelected] = useState<Announcement | null>(null);
  const close = useCallback(() => setSelected(null), []);

  if (announcements.length === 0) {
    return (
      <div className="bento-card p-8 flex flex-col items-center justify-center text-center">
        <Megaphone className="w-8 h-8 text-muted-foreground/30 mb-3" strokeWidth={1.5} />
        <p className="text-muted-foreground text-sm">Nenhum aviso no momento.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {announcements.slice(0, 4).map((ann) => (
          <button
            key={ann.id}
            onClick={() => setSelected(ann)}
            className="bento-card bg-card p-5 text-left group hover:border-amber-500/30 transition-all cursor-pointer w-full"
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${ann.is_pinned ? "bg-amber-500 animate-pulse" : "bg-muted-foreground/40"}`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {ann.is_pinned && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                      Fixado
                    </span>
                  )}
                  <p className="font-semibold text-sm text-foreground group-hover:text-amber-500 transition-colors truncate">
                    {ann.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-3 font-medium flex items-center gap-1">
                  {formatDateTime(ann.published_at)}
                  <span className="ml-auto text-amber-500/70 font-semibold">Ler mais →</span>
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && <Modal ann={selected} onClose={close} />}
    </>
  );
}
