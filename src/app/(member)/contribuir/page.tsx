"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Heart,
  Copy,
  Check,
  Upload,
  Loader2,
  Receipt,
  ArrowRight,
  Smartphone,
  ClipboardCheck,
  X,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Tithe } from "@/lib/types/database";

const PIX_KEY = "59117881000178";
const PIX_KEY_FORMATTED = "59.117.881/0001-78";

type FormState = { error?: string; success?: string };

async function submitTithe(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const receipt = formData.get("receipt") as File;

  if (!amount || amount <= 0) return { error: "Informe um valor válido." };
  if (!type) return { error: "Selecione o tipo de contribuição." };

  // Garante que o perfil existe — necessário para usuários que entraram via Google
  // e cujo trigger de auto-criação pode não ter executado
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      avatar_url: user.user_metadata?.avatar_url || null,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  let receiptUrl: string | null = null;

  if (receipt && receipt.size > 0) {
    if (receipt.size > 2 * 1024 * 1024) return { error: "Comprovante muito grande. Máximo 2MB." };
    const ext = receipt.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("receipts").upload(fileName, receipt, { cacheControl: "3600" });
    if (uploadError) return { error: "Erro ao enviar comprovante." };
    const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(fileName);
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
  return { success: "Contribuição registrada com sucesso! Que Deus abençoe sua oferta. 🙏" };
}

const typeOptions = [
  { value: "tithe", label: "Dízimo", description: "10% da sua renda" },
  { value: "offering", label: "Oferta", description: "Contribuição voluntária" },
  { value: "campaign", label: "Campanha", description: "Projeto específico" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-500/10 text-amber-500" },
  confirmed: { label: "Confirmado", className: "bg-green-500/10 text-green-600" },
  cancelled: { label: "Cancelado", className: "bg-red-500/10 text-red-500" },
};

const typeLabels: Record<string, string> = {
  tithe: "Dízimo",
  offering: "Oferta",
  campaign: "Campanha",
};

export default function ContribuirPage() {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"pix" | "history">("pix");
  const [selectedType, setSelectedType] = useState("tithe");
  const [history, setHistory] = useState<Tithe[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, action, pending] = useActionState<FormState, FormData>(submitTithe, {});

  async function copyPix() {
    await navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab, state.success]);

  async function loadHistory() {
    setLoadingHistory(true);
    const supabase = createClient();
    const { data } = await supabase.from("tithes").select("*").order("created_at", { ascending: false }).limit(20);
    setHistory(data || []);
    setLoadingHistory(false);
  }

  const total = history.filter(t => t.status === "confirmed").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Heart className="w-6 h-6 text-amber-500" />
          Contribuir
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dízimos e ofertas da Igreja META
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        {(["pix", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "pix" ? "Fazer PIX" : "Meu Histórico"}
          </button>
        ))}
      </div>

      {tab === "pix" && (
        <div className="space-y-4">

          {/* PIX Key Card */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-600/5 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Chave PIX</p>
                <p className="text-xl font-bold text-foreground tracking-tight">{PIX_KEY_FORMATTED}</p>
                <p className="text-xs text-muted-foreground mt-1">CNPJ · Banco Itaú</p>
              </div>
              <button
                onClick={copyPix}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all duration-300 ${
                  copied
                    ? "bg-green-500/10 border-green-500/30 text-green-600"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-600 hover:bg-amber-500/20 active:scale-95"
                }`}
              >
                {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                <span className="text-[10px] font-semibold mt-1">{copied ? "Copiado" : "Copiar"}</span>
              </button>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { icon: Copy, label: "Copie a chave" },
                { icon: Smartphone, label: "Abra seu banco" },
                { icon: ClipboardCheck, label: "Registre aqui" },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center">
                    <step.icon className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight">{step.label}</span>
                  {i < 2 && (
                    <div className="absolute" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-500 shrink-0" />
              <h3 className="font-semibold text-sm text-foreground">Registrar após o pagamento</h3>
            </div>

            {state.error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
                {state.error}
              </div>
            )}
            {state.success && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 text-xs font-medium">
                {state.success}
              </div>
            )}

            <form action={action} className="space-y-4">
              {/* Hidden type field */}
              <input type="hidden" name="type" value={selectedType} />

              {/* Type selector */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Tipo de contribuição
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedType(opt.value)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        selectedType === opt.value
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-600"
                          : "bg-muted border-transparent text-muted-foreground hover:border-border"
                      }`}
                    >
                      <span className="text-xs font-bold">{opt.label}</span>
                      <span className="text-[10px] mt-0.5 leading-tight opacity-80">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">R$</span>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-semibold outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Observação <span className="normal-case font-normal">(opcional)</span>
                </label>
                <input
                  name="description"
                  placeholder="Ex: Oferta missionária"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all"
                />
              </div>

              {/* File upload */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Comprovante <span className="normal-case font-normal">(opcional · máx 2MB)</span>
                </label>
                {fileName ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/5 border border-green-500/20">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm text-green-700 truncate flex-1">{fileName}</span>
                    <button
                      type="button"
                      onClick={() => { setFileName(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-dashed border-border cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group">
                    <Upload className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 transition-colors shrink-0" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Clique para anexar
                    </span>
                    <input
                      ref={fileInputRef}
                      name="receipt"
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-all shadow-[0_2px_12px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Registrar Contribuição
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {/* Summary */}
          {history.length > 0 && (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total confirmado</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(total)}</p>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <p>{history.filter(t => t.status === "confirmed").length} confirmado(s)</p>
                <p>{history.filter(t => t.status === "pending").length} pendente(s)</p>
              </div>
            </div>
          )}

          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma contribuição registrada ainda.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Suas contribuições aparecerão aqui.</p>
            </div>
          ) : (
            history.map((t) => {
              const status = statusConfig[t.status] || { label: t.status, className: "bg-muted text-muted-foreground" };
              return (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{typeLabels[t.type] || t.type}</p>
                    {t.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">{formatDateTime(t.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-bold text-sm text-amber-500">{formatCurrency(t.amount)}</p>
                    <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
