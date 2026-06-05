"use client";

import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HandHeart, Loader2, Send, Globe, Lock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useEffect } from "react";
import type { PrayerRequest } from "@/lib/types/database";

type FormState = { error?: string; success?: string };

async function submitPrayer(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sessão expirada." };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const isPublic = formData.get("visibility") === "public";

  if (!title) return { error: "Informe o título do pedido." };

  // Garante perfil para usuários OAuth sem trigger executado
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      avatar_url: user.user_metadata?.avatar_url || null,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  const { error } = await supabase.from("prayer_requests").insert({
    user_id: user.id,
    title,
    description: description || null,
    is_public: isPublic,
  });

  if (error) return { error: "Erro ao enviar pedido." };
  return { success: "Pedido enviado com sucesso! 🙏" };
}

export default function OracoesPage() {
  const [tab, setTab] = useState<"form" | "my" | "public">("form");
  const [myPrayers, setMyPrayers] = useState<PrayerRequest[]>([]);
  const [publicPrayers, setPublicPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const [state, action, pending] = useActionState<FormState, FormData>(submitPrayer, {});

  useEffect(() => {
    loadPrayers();
  }, [tab, state.success]);

  async function loadPrayers() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (tab === "my" && user) {
      const { data } = await supabase
        .from("prayer_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setMyPrayers(data || []);
    }

    if (tab === "public") {
      const { data } = await supabase
        .from("prayer_requests")
        .select("*, profiles(full_name, avatar_url)")
        .eq("is_public", true)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(20);
      setPublicPrayers(data || []);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <HandHeart className="w-6 h-6 text-gold" />
          Pedidos de Oração
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compartilhe seus pedidos e ore por outros.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-muted p-1">
        {[
          { key: "form", label: "Novo Pedido" },
          { key: "my", label: "Meus" },
          { key: "public", label: "Mural" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              tab === t.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* New prayer form */}
      {tab === "form" && (
        <div className="rounded-2xl border border-border bg-card p-5">
          {state.error && (
            <div className="mb-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="mb-3 p-3 rounded-lg bg-success/10 text-success text-sm">
              {state.success}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Título
              </label>
              <input
                name="title"
                required
                placeholder="Pelo que deseja oração?"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold/50 transition-colors text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Detalhes{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Conte mais sobre seu pedido..."
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold/50 transition-colors text-sm outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Visibilidade
              </label>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center gap-2 p-3 rounded-xl border border-border bg-muted cursor-pointer has-[:checked]:border-gold has-[:checked]:bg-gold/5 transition-colors">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    defaultChecked
                    className="sr-only"
                  />
                  <Globe className="w-4 h-4 text-gold" />
                  <div>
                    <p className="text-xs font-medium">Público</p>
                    <p className="text-[10px] text-muted-foreground">
                      Mural da igreja
                    </p>
                  </div>
                </label>
                <label className="flex-1 flex items-center gap-2 p-3 rounded-xl border border-border bg-muted cursor-pointer has-[:checked]:border-gold has-[:checked]:bg-gold/5 transition-colors">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    className="sr-only"
                  />
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium">Privado</p>
                    <p className="text-[10px] text-muted-foreground">
                      Só pastores
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="btn-gold w-full py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Pedido
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* My prayers */}
      {tab === "my" && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          ) : myPrayers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Você ainda não enviou pedidos.
            </div>
          ) : (
            myPrayers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-border bg-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{p.title}</p>
                    {p.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.is_public ? (
                      <Globe className="w-3 h-3 text-gold" />
                    ) : (
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    )}
                    {p.is_answered && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-medium">
                        Respondido
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {formatDateTime(p.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Public prayer wall */}
      {tab === "public" && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          ) : publicPrayers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Nenhum pedido público no momento.
            </div>
          ) : (
            publicPrayers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-border bg-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gold">
                      {(p.profiles as unknown as { full_name: string })?.full_name?.[0] || "?"}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {(p.profiles as unknown as { full_name: string })?.full_name || "Membro"}
                  </span>
                </div>
                <p className="font-semibold text-sm">{p.title}</p>
                {p.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                    {p.description}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">
                  {formatDateTime(p.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
