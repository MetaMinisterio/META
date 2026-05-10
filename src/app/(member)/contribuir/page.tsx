"use client";

import { useActionState, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Heart,
  Copy,
  Check,
  Upload,
  Loader2,
  Receipt,
  QrCode,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Tithe } from "@/lib/types/database";

const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY || "pix@igrejameta.com";

type FormState = { error?: string; success?: string };

async function submitTithe(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sessão expirada." };

  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const receipt = formData.get("receipt") as File;

  if (!amount || amount <= 0) return { error: "Informe um valor válido." };
  if (!type) return { error: "Selecione o tipo." };

  let receiptUrl: string | null = null;

  // Upload receipt if provided
  if (receipt && receipt.size > 0) {
    if (receipt.size > 2 * 1024 * 1024) {
      return { error: "Comprovante muito grande. Máximo 2MB." };
    }

    const ext = receipt.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, receipt, { cacheControl: "3600" });

    if (uploadError) return { error: "Erro ao enviar comprovante." };

    const {
      data: { publicUrl },
    } = supabase.storage.from("receipts").getPublicUrl(fileName);
    receiptUrl = publicUrl;
  }

  const { error } = await supabase.from("tithes").insert({
    user_id: user.id,
    amount,
    type,
    description: description || null,
    receipt_url: receiptUrl,
    payment_method: "pix",
    status: "pending",
  });

  if (error) return { error: "Erro ao registrar contribuição." };
  return { success: "Contribuição registrada! Aguarde a confirmação. 🙏" };
}

export default function ContribuirPage() {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"pix" | "history">("pix");
  const [history, setHistory] = useState<Tithe[]>([]);
  const [loading, setLoading] = useState(false);

  const [state, action, pending] = useActionState<FormState, FormData>(submitTithe, {});

  async function copyPix() {
    await navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab, state.success]);

  async function loadHistory() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("tithes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setHistory(data || []);
    setLoading(false);
  }

  const typeLabels: Record<string, string> = {
    tithe: "Dízimo",
    offering: "Oferta",
    campaign: "Campanha",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendente", color: "bg-warning/20 text-warning" },
    confirmed: { label: "Confirmado", color: "bg-success/20 text-success" },
    cancelled: { label: "Cancelado", color: "bg-destructive/20 text-destructive" },
  };

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-gold" />
          Contribuir
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dízimos e ofertas via PIX.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-muted p-1">
        <button
          onClick={() => setTab("pix")}
          className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${
            tab === "pix"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          PIX
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${
            tab === "history"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Histórico
        </button>
      </div>

      {tab === "pix" && (
        <div className="space-y-4">
          {/* PIX Card */}
          <div className="rounded-2xl border border-gold/20 bg-card p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-gold" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Chave PIX (Email)
            </p>
            <p className="text-lg font-bold text-foreground mb-4 break-all">
              {PIX_KEY}
            </p>
            <button
              onClick={copyPix}
              className="btn-gold px-6 py-2.5 text-sm font-semibold rounded-xl inline-flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Chave PIX
                </>
              )}
            </button>
          </div>

          {/* Register contribution */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gold" />
              Registrar Contribuição
            </h3>

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

            <form action={action} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Valor (R$)
                  </label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Tipo</label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors appearance-none"
                  >
                    <option value="tithe">Dízimo</option>
                    <option value="offering">Oferta</option>
                    <option value="campaign">Campanha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Descrição{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </label>
                <input
                  name="description"
                  placeholder="Ex: Oferta missionária"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Comprovante{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional, máx 2MB)
                  </span>
                </label>
                <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted border border-border border-dashed cursor-pointer hover:border-gold/50 transition-colors">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Anexar comprovante
                  </span>
                  <input
                    name="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    className="sr-only"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="btn-gold w-full py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Registrar Contribuição"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Nenhuma contribuição registrada.
            </div>
          ) : (
            history.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
              >
                <div>
                  <p className="font-semibold text-sm">
                    {typeLabels[t.type] || t.type}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDateTime(t.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gold">
                    {formatCurrency(t.amount)}
                  </p>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      statusLabels[t.status]?.color || ""
                    }`}
                  >
                    {statusLabels[t.status]?.label || t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
