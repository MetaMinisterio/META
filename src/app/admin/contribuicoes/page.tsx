"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Heart, TrendingUp, TrendingDown, Wallet, BarChart3,
  Plus, Edit2, Trash2, X, AlertTriangle, CheckCircle2,
  XCircle, Clock, ExternalLink, Search, Filter,
  FileSpreadsheet, FileText, Tag, ChevronDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  createTransaction, updateTransaction, deleteTransaction,
  createCategory, updateCategory, deleteCategory,
  getFinancialSummary, getCategoryDistribution,
  type TransactionInput,
} from "@/lib/actions/finances";
import type { FinancialCategory, Transaction } from "@/lib/types/database";

type Tab = "overview" | "income" | "expense" | "tithes" | "categories" | "reports";

const TAB_CONFIG: { key: Tab; label: string; icon: any }[] = [
  { key: "overview",    label: "Visão Geral",     icon: BarChart3 },
  { key: "income",      label: "Entradas",         icon: TrendingUp },
  { key: "expense",     label: "Saídas",           icon: TrendingDown },
  { key: "tithes",      label: "Dízimos/Ofertas",  icon: Heart },
  { key: "categories",  label: "Categorias",       icon: Tag },
  { key: "reports",     label: "Relatórios",       icon: FileText },
];

const PAYMENT_METHODS = [
  { value: "pix",      label: "PIX" },
  { value: "cash",     label: "Dinheiro" },
  { value: "card",     label: "Cartão" },
  { value: "transfer", label: "Transferência" },
  { value: "check",    label: "Cheque" },
  { value: "other",    label: "Outro" },
];

const TITHE_LABELS: Record<string, string> = { tithe: "Dízimo", offering: "Oferta", campaign: "Campanha" };

function fmtBRL(v: number) { return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`; }
function fmtDate(s: string) { return new Date(s + "T12:00:00").toLocaleDateString("pt-BR"); }

type TitheRow = {
  id: string; user_id: string | null; amount: number;
  type: "tithe" | "offering" | "campaign"; description: string | null;
  payment_method: string; receipt_url: string | null;
  status: "pending" | "confirmed" | "cancelled"; created_at: string;
  profiles: { full_name: string } | null;
};

export default function AdminContribuicoesPage() {
  const [tab, setTab] = useState<Tab>("overview");

  // Overview
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [summary, setSummary] = useState({ incomeMonth: 0, expenseMonth: 0, saldo: 0, tithesConfirmedMonth: 0, series: [] as any[] });
  const [pieData, setPieData] = useState<{ name: string; color: string; value: number }[]>([]);
  const [chartMonths, setChartMonths] = useState(6);

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txFilter, setTxFilter] = useState("");

  // Tithes
  const [tithes, setTithes] = useState<TitheRow[]>([]);
  const [tithesLoading, setTithesLoading] = useState(false);
  const [tithesStatus, setTithesStatus] = useState<"pending" | "confirmed" | "cancelled" | "all">("pending");
  const [tithesSearch, setTithesSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Categories
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  // Members
  const [members, setMembers] = useState<{ id: string; full_name: string }[]>([]);

  // Modals
  const [modal, setModal] = useState<"none" | "tx" | "cat">("none");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingCat, setEditingCat] = useState<FinancialCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Forms
  const defaultTxForm = { type: "income" as "income" | "expense", category_id: "", amount: "", description: "", payment_method: "pix", reference_date: new Date().toISOString().slice(0, 10), responsible_id: "", notes: "" };
  const [txForm, setTxForm] = useState(defaultTxForm);
  const [catForm, setCatForm] = useState({ name: "", type: "income" as "income" | "expense", color: "#10B981" });

  // Reports
  const [reportFilters, setReportFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    type: "all" as "all" | "income" | "expense" | "tithes",
    categoryId: "", paymentMethod: "", responsibleId: "",
  });
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportRun, setReportRun] = useState(false);

  // ── Loaders ───────────────────────────────────────────────

  const loadOverview = useCallback(async (months: number) => {
    setOverviewLoading(true);
    const [s, pie] = await Promise.all([getFinancialSummary(months), getCategoryDistribution()]);
    setSummary(s); setPieData(pie); setOverviewLoading(false);
  }, []);

  const loadTransactions = useCallback(async (type: "income" | "expense") => {
    setTxLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("transactions")
      .select("*, financial_categories(name, color), responsible:responsible_id(full_name), creator:created_by(full_name)")
      .eq("type", type)
      .order("reference_date", { ascending: false });
    setTransactions((data as Transaction[]) || []); setTxLoading(false);
  }, []);

  const loadTithes = useCallback(async () => {
    setTithesLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("tithes").select("*, profiles(full_name)").order("created_at", { ascending: false });
    setTithes((data as TitheRow[]) || []); setTithesLoading(false);
  }, []);

  const loadCategories = useCallback(async () => {
    setCatLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("financial_categories").select("*").order("type").order("name");
    setCategories((data as FinancialCategory[]) || []); setCatLoading(false);
  }, []);

  const loadMembers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("id, full_name").eq("is_active", true).order("full_name");
    setMembers((data || []) as { id: string; full_name: string }[]);
  }, []);

  useEffect(() => {
    loadMembers();
    loadCategories();
    if (tab === "overview") loadOverview(chartMonths);
    else if (tab === "income") loadTransactions("income");
    else if (tab === "expense") loadTransactions("expense");
    else if (tab === "tithes") loadTithes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ── Tx CRUD ───────────────────────────────────────────────

  function openCreateTx(type: "income" | "expense") {
    setEditingTx(null); setFormError(null);
    setTxForm({ ...defaultTxForm, type });
    setModal("tx");
  }
  function openEditTx(tx: Transaction) {
    setEditingTx(tx); setFormError(null);
    setTxForm({ type: tx.type, category_id: tx.category_id || "", amount: String(tx.amount), description: tx.description, payment_method: tx.payment_method, reference_date: tx.reference_date, responsible_id: tx.responsible_id || "", notes: tx.notes || "" });
    setModal("tx");
  }

  async function handleSaveTx() {
    if (!txForm.description || !txForm.amount || !txForm.reference_date) { setFormError("Descrição, valor e data são obrigatórios."); return; }
    const amount = parseFloat(txForm.amount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) { setFormError("Valor inválido."); return; }
    setSaving(true); setFormError(null);
    const payload: TransactionInput = { type: txForm.type, amount, description: txForm.description, payment_method: txForm.payment_method, reference_date: txForm.reference_date, category_id: txForm.category_id || null, responsible_id: txForm.responsible_id || null, notes: txForm.notes || null };
    const result = editingTx ? await updateTransaction(editingTx.id, payload) : await createTransaction(payload);
    if (result.error) { setFormError(result.error); setSaving(false); return; }
    setModal("none"); setSaving(false);
    if (tab === "income") loadTransactions("income"); else loadTransactions("expense");
  }

  async function handleDeleteTx(id: string) {
    if (!confirm("Excluir este lançamento?")) return;
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Category CRUD ─────────────────────────────────────────

  function openCreateCat() { setEditingCat(null); setCatForm({ name: "", type: "income", color: "#10B981" }); setFormError(null); setModal("cat"); }
  function openEditCat(c: FinancialCategory) { setEditingCat(c); setCatForm({ name: c.name, type: c.type, color: c.color }); setFormError(null); setModal("cat"); }

  async function handleSaveCat() {
    if (!catForm.name) { setFormError("Nome é obrigatório."); return; }
    setSaving(true); setFormError(null);
    const result = editingCat ? await updateCategory(editingCat.id, catForm) : await createCategory(catForm);
    if (result.error) { setFormError(result.error); setSaving(false); return; }
    setModal("none"); setSaving(false); loadCategories();
  }
  async function handleDeleteCat(id: string) {
    if (!confirm("Excluir esta categoria?")) return;
    const r = await deleteCategory(id);
    if (r.error) alert(r.error); else loadCategories();
  }

  // ── Tithes ────────────────────────────────────────────────

  async function updateTitheStatus(id: string, status: "confirmed" | "cancelled" | "pending") {
    setActionLoading(id + status);
    const supabase = createClient();
    await supabase.from("tithes").update({ status }).eq("id", id);
    setTithes((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    setActionLoading(null);
  }

  // ── Reports ───────────────────────────────────────────────

  async function runReport() {
    setReportLoading(true); setReportRun(true);
    const supabase = createClient();
    let rows: any[] = [];

    if (reportFilters.type !== "tithes") {
      let q = supabase.from("transactions").select("*, financial_categories(name), responsible:responsible_id(full_name)").gte("reference_date", reportFilters.startDate).lte("reference_date", reportFilters.endDate).order("reference_date", { ascending: false });
      if (reportFilters.type !== "all") q = q.eq("type", reportFilters.type);
      if (reportFilters.categoryId) q = q.eq("category_id", reportFilters.categoryId);
      if (reportFilters.paymentMethod) q = q.eq("payment_method", reportFilters.paymentMethod);
      if (reportFilters.responsibleId) q = q.eq("responsible_id", reportFilters.responsibleId);
      const { data } = await q;
      rows = (data || []).map((t: any) => ({ data: fmtDate(t.reference_date), tipo: t.type === "income" ? "Entrada" : "Saída", descricao: t.description, categoria: t.financial_categories?.name || "—", valor: fmtBRL(t.amount), pagamento: PAYMENT_METHODS.find((p) => p.value === t.payment_method)?.label || t.payment_method, responsavel: t.responsible?.full_name || "—" }));
    }

    if (reportFilters.type === "tithes" || reportFilters.type === "all") {
      let q = supabase.from("tithes").select("*, profiles(full_name)").gte("created_at", reportFilters.startDate).lte("created_at", reportFilters.endDate + "T23:59:59").order("created_at", { ascending: false });
      if (reportFilters.paymentMethod) q = q.eq("payment_method", reportFilters.paymentMethod);
      if (reportFilters.responsibleId) q = q.eq("user_id", reportFilters.responsibleId);
      const { data } = await q;
      rows = [...rows, ...(data || []).map((t: any) => ({ data: new Date(t.created_at).toLocaleDateString("pt-BR"), tipo: TITHE_LABELS[t.type] || t.type, descricao: t.description || "—", categoria: "Dízimos/Ofertas", valor: fmtBRL(t.amount), pagamento: t.payment_method?.toUpperCase() || "—", responsavel: t.profiles?.full_name || "—" }))];
    }

    setReportData(rows); setReportLoading(false);
  }

  async function exportExcel() {
    const { utils, writeFile } = await import("xlsx");
    const ws = utils.json_to_sheet(reportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Relatório");
    writeFile(wb, `relatorio-${reportFilters.startDate}-${reportFilters.endDate}.xlsx`);
  }

  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Relatório Financeiro — Igreja META", 14, 16);
    doc.setFontSize(10);
    doc.text(`Período: ${reportFilters.startDate} a ${reportFilters.endDate}`, 14, 24);
    autoTable(doc, { startY: 30, head: [["Data","Tipo","Descrição","Categoria","Valor","Pagamento","Responsável"]], body: reportData.map((r) => [r.data,r.tipo,r.descricao,r.categoria,r.valor,r.pagamento,r.responsavel]), styles: { fontSize: 8 }, headStyles: { fillColor: [180, 150, 60] } });
    doc.save(`relatorio-${reportFilters.startDate}-${reportFilters.endDate}.pdf`);
  }

  // ── Derived ───────────────────────────────────────────────

  const filteredTx = transactions.filter((t) => !txFilter || t.description?.toLowerCase().includes(txFilter.toLowerCase()) || (t as any).financial_categories?.name?.toLowerCase().includes(txFilter.toLowerCase()) || (t as any).responsible?.full_name?.toLowerCase().includes(txFilter.toLowerCase()));
  const filteredTithes = tithes.filter((t) => (tithesStatus === "all" || t.status === tithesStatus) && (!tithesSearch || t.profiles?.full_name?.toLowerCase().includes(tithesSearch.toLowerCase())));
  const incomeCats = categories.filter((c) => c.type === "income");
  const expenseCats = categories.filter((c) => c.type === "expense");
  const currentTabCats = txForm.type === "income" ? incomeCats : expenseCats;
  const saldoPos = summary.saldo >= 0;
  const storytelling = summary.incomeMonth === 0 && summary.expenseMonth === 0
    ? { msg: "Nenhum lançamento financeiro registrado este mês.", color: "text-muted-foreground", icon: "💡" }
    : saldoPos
    ? { msg: `Ótimo! A igreja está com saldo positivo de ${fmtBRL(summary.saldo)} neste mês.`, color: "text-green-500", icon: "✅" }
    : { msg: `Atenção: as saídas superaram as entradas em ${fmtBRL(Math.abs(summary.saldo))} este mês.`, color: "text-red-500", icon: "⚠️" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wallet className="w-6 h-6 text-gold" /> Financeiro
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Controle completo das finanças da igreja</p>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto no-scrollbar">
        <div className="flex rounded-xl bg-muted p-1 gap-0.5 min-w-max">
          {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ VISÃO GERAL ══════════════════════════════════════ */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Entradas do mês", val: summary.incomeMonth, Icon: TrendingUp, c: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
              { label: "Saídas do mês",   val: summary.expenseMonth, Icon: TrendingDown, c: "text-red-500",   bg: "bg-red-500/10",   border: "border-red-500/20" },
              { label: "Saldo atual",     val: summary.saldo, Icon: Wallet, c: saldoPos ? "text-gold" : "text-red-500", bg: saldoPos ? "bg-gold/10" : "bg-red-500/10", border: saldoPos ? "border-gold/20" : "border-red-500/20" },
              { label: "Dízimos (mês)",   val: summary.tithesConfirmedMonth, Icon: Heart, c: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
            ].map(({ label, val, Icon, c, bg, border }) => (
              <div key={label} className={`bg-card border ${border} rounded-2xl p-5 relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 rounded-full ${bg} blur-2xl`} />
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}><Icon className={`w-4 h-4 ${c}`} strokeWidth={1.5} /></div>
                {overviewLoading ? <div className="skeleton h-7 w-28 rounded-lg mb-1" /> : <p className={`text-xl font-bold ${c}`}>{fmtBRL(val)}</p>}
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className={`p-4 rounded-xl bg-muted/50 border border-border text-sm ${storytelling.color} flex items-center gap-2`}>
            <span className="text-base">{storytelling.icon}</span><span>{storytelling.msg}</span>
          </div>

          {/* Bar chart */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-gold" strokeWidth={1.5} /><h3 className="font-bold">Entradas × Saídas</h3></div>
              <div className="flex rounded-xl bg-muted p-0.5 w-fit">
                {[3, 6, 12].map((m) => (
                  <button key={m} onClick={async () => { setChartMonths(m); await loadOverview(m); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${chartMonths === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>{m} meses</button>
                ))}
              </div>
            </div>
            {overviewLoading ? <div className="skeleton h-48 rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={summary.series} barGap={4} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `R$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={56} />
                  <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs space-y-1.5">
                      <p className="font-semibold mb-1">{label}</p>
                      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}><span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ background: p.color }} />{p.name === "income" ? "Entradas" : "Saídas"}: {fmtBRL(p.value)}</p>)}
                    </div>
                  ) : null} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
                  <Legend formatter={(v) => v === "income" ? "Entradas" : "Saídas"} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Bar dataKey="income" name="income" fill="#22c55e" radius={[4,4,0,0]} />
                  <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie */}
          {pieData.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4"><h3 className="font-bold">Distribuição por Categoria</h3><span className="text-xs text-muted-foreground">Este mês</span></div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs"><p className="font-semibold">{payload[0].name}</p><p style={{ color: (payload[0].payload as any).color }}>{fmtBRL(payload[0].value as number)}</p></div>
                  ) : null} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{v}</span>} wrapperStyle={{ paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ══ ENTRADAS / SAÍDAS ════════════════════════════════ */}
      {(tab === "income" || tab === "expense") && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={txFilter} onChange={(e) => setTxFilter(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input border border-border text-sm outline-none focus:border-gold transition-all" />
            </div>
            <button onClick={() => openCreateTx(tab === "income" ? "income" : "expense")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-sm font-semibold shrink-0">
              <Plus className="w-4 h-4" />{tab === "income" ? "Nova Entrada" : "Nova Saída"}
            </button>
          </div>
          {txLoading ? <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
            : filteredTx.length === 0 ? <div className="text-center py-16 text-muted-foreground text-sm"><TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />Nenhum lançamento encontrado.</div>
            : (
            <div className="space-y-2">
              {filteredTx.map((t) => {
                const cat = (t as any).financial_categories;
                const resp = (t as any).responsible;
                return (
                  <div key={t.id} className={`p-4 rounded-xl border bg-card ${tab === "income" ? "border-green-500/20 hover:border-green-500/30" : "border-red-500/20 hover:border-red-500/30"} transition-colors`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{t.description}</span>
                          {cat && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white" style={{ background: cat.color }}>{cat.name}</span>}
                        </div>
                        <p className={`text-lg font-bold ${tab === "income" ? "text-green-500" : "text-red-500"}`}>{fmtBRL(t.amount)}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {fmtDate(t.reference_date)} · {PAYMENT_METHODS.find((p) => p.value === t.payment_method)?.label || t.payment_method}
                          {resp?.full_name ? ` · ${resp.full_name}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEditTx(t)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteTx(t.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ DÍZIMOS E OFERTAS ════════════════════════════════ */}
      {tab === "tithes" && (
        <div className="space-y-4">
          {tithes.filter((t) => t.status === "pending").length > 0 && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-sm text-amber-600 dark:text-amber-400">
              <strong>{tithes.filter((t) => t.status === "pending").length} contribuições aguardam revisão.</strong> Verifique o comprovante e confirme ou recuse.
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={tithesSearch} onChange={(e) => setTithesSearch(e.target.value)} placeholder="Buscar por nome..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input border border-border text-sm outline-none focus:border-gold transition-all" />
          </div>
          <div className="flex rounded-xl bg-muted p-1 gap-0.5">
            {(["pending","confirmed","cancelled","all"] as const).map((s) => {
              const cnt = s !== "all" ? tithes.filter((t) => t.status === s).length : undefined;
              return (
                <button key={s} onClick={() => setTithesStatus(s)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${tithesStatus === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {s === "pending" ? "Pendentes" : s === "confirmed" ? "Confirmados" : s === "cancelled" ? "Cancelados" : "Todos"}
                  {cnt !== undefined && cnt > 0 && <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${tithesStatus === s ? "bg-amber-500 text-black" : "bg-muted-foreground/30"}`}>{cnt}</span>}
                </button>
              );
            })}
          </div>
          {tithesLoading ? <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
            : filteredTithes.length === 0 ? <div className="text-center py-16 text-muted-foreground text-sm"><Heart className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />Nenhuma contribuição.</div>
            : (
            <div className="space-y-3">
              {filteredTithes.map((t) => {
                const cfg = { pending: { label: "Pendente", color: "text-amber-500", bg: "bg-amber-500/10", Icon: Clock }, confirmed: { label: "Confirmado", color: "text-green-500", bg: "bg-green-500/10", Icon: CheckCircle2 }, cancelled: { label: "Cancelado", color: "text-red-500", bg: "bg-red-500/10", Icon: XCircle } }[t.status];
                return (
                  <div key={t.id} className={`p-4 rounded-xl border bg-card ${t.status === "pending" ? "border-amber-500/30" : "border-border"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-sm truncate">{t.profiles?.full_name || "Membro"}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{TITHE_LABELS[t.type]}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}><cfg.Icon className="w-2.5 h-2.5" />{cfg.label}</span>
                        </div>
                        <p className="text-xl font-bold">{fmtBRL(t.amount)}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(t.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {t.receipt_url && <a href={t.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-foreground"><ExternalLink className="w-3 h-3" />Comprovante</a>}
                        {t.status === "pending" && <>
                          <button onClick={() => updateTitheStatus(t.id, "confirmed")} disabled={!!actionLoading} className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 font-medium disabled:opacity-50"><CheckCircle2 className="w-3 h-3" />{actionLoading === t.id + "confirmed" ? "..." : "Confirmar"}</button>
                          <button onClick={() => updateTitheStatus(t.id, "cancelled")} disabled={!!actionLoading} className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 font-medium disabled:opacity-50"><XCircle className="w-3 h-3" />{actionLoading === t.id + "cancelled" ? "..." : "Recusar"}</button>
                        </>}
                        {t.status !== "pending" && <button onClick={() => updateTitheStatus(t.id, "pending")} disabled={!!actionLoading} className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"><ChevronDown className="w-3 h-3" />Reabrir</button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ CATEGORIAS ═══════════════════════════════════════ */}
      {tab === "categories" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={openCreateCat} className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-sm font-semibold"><Plus className="w-4 h-4" />Nova Categoria</button>
          </div>
          {catLoading ? <div className="skeleton h-48 rounded-xl" /> : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[{ label: "Receitas", cats: incomeCats }, { label: "Despesas", cats: expenseCats }].map(({ label, cats }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{label}</p>
                  <div className="space-y-2">
                    {cats.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma categoria.</p>}
                    {cats.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
                        <span className="flex-1 text-sm font-medium">{c.name}</span>
                        {!c.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Inativo</span>}
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditCat(c)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => handleDeleteCat(c.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ RELATÓRIOS ═══════════════════════════════════════ */}
      {tab === "reports" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1"><Filter className="w-4 h-4 text-gold" /><h3 className="font-bold text-sm">Filtros</h3></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[["Data inicial","date","startDate"],["Data final","date","endDate"]].map(([label,type,key]) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input type={type} value={(reportFilters as any)[key]} onChange={(e) => setReportFilters((f) => ({ ...f, [key]: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors" />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <select value={reportFilters.type} onChange={(e) => setReportFilters((f) => ({ ...f, type: e.target.value as any }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold appearance-none">
                  <option value="all">Todos</option><option value="income">Entradas</option><option value="expense">Saídas</option><option value="tithes">Dízimos/Ofertas</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                <select value={reportFilters.categoryId} onChange={(e) => setReportFilters((f) => ({ ...f, categoryId: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold appearance-none">
                  <option value="">Todas</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Pagamento</label>
                <select value={reportFilters.paymentMethod} onChange={(e) => setReportFilters((f) => ({ ...f, paymentMethod: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold appearance-none">
                  <option value="">Todos</option>{PAYMENT_METHODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Responsável</label>
                <select value={reportFilters.responsibleId} onChange={(e) => setReportFilters((f) => ({ ...f, responsibleId: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold appearance-none">
                  <option value="">Todos</option>{members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
            </div>
            <button onClick={runReport} disabled={reportLoading} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">{reportLoading ? "Gerando..." : "Gerar Relatório"}</button>
          </div>

          {reportRun && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{reportData.length} resultado{reportData.length !== 1 ? "s" : ""}</p>
                {reportData.length > 0 && (
                  <div className="flex gap-2">
                    <button onClick={exportExcel} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 font-medium transition-colors"><FileSpreadsheet className="w-3.5 h-3.5" />Excel</button>
                    <button onClick={exportPDF} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 font-medium transition-colors"><FileText className="w-3.5 h-3.5" />PDF</button>
                  </div>
                )}
              </div>
              {reportData.length === 0
                ? <div className="text-center py-12 text-muted-foreground text-sm">Nenhum resultado para os filtros selecionados.</div>
                : (
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50">{["Data","Tipo","Descrição","Categoria","Valor","Pagamento","Responsável"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
                    <tbody>
                      {reportData.map((r, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-xs">{r.data}</td>
                          <td className="px-4 py-3"><span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${r.tipo === "Entrada" ? "bg-green-500/10 text-green-600" : r.tipo === "Saída" ? "bg-red-500/10 text-red-600" : "bg-pink-500/10 text-pink-600"}`}>{r.tipo}</span></td>
                          <td className="px-4 py-3 text-xs max-w-48 truncate">{r.descricao}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{r.categoria}</td>
                          <td className="px-4 py-3 text-xs font-semibold">{r.valor}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{r.pagamento}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{r.responsavel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ MODAL: TRANSACTION ═══════════════════════════════ */}
      {modal === "tx" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold">{editingTx ? "Editar Lançamento" : txForm.type === "income" ? "Nova Entrada" : "Nova Saída"}</h2>
              <button onClick={() => setModal("none")} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {formError && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{formError}</div>}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Descrição *</label>
                <input value={txForm.description} onChange={(e) => setTxForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors" placeholder="Ex: Conta de luz" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Valor (R$) *</label>
                  <input value={txForm.amount} onChange={(e) => setTxForm((f) => ({ ...f, amount: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors" placeholder="0,00" inputMode="decimal" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Data *</label>
                  <input type="date" value={txForm.reference_date} onChange={(e) => setTxForm((f) => ({ ...f, reference_date: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                  <select value={txForm.category_id} onChange={(e) => setTxForm((f) => ({ ...f, category_id: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold appearance-none">
                    <option value="">Sem categoria</option>{currentTabCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Pagamento</label>
                  <select value={txForm.payment_method} onChange={(e) => setTxForm((f) => ({ ...f, payment_method: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold appearance-none">
                    {PAYMENT_METHODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Responsável</label>
                <select value={txForm.responsible_id} onChange={(e) => setTxForm((f) => ({ ...f, responsible_id: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold appearance-none">
                  <option value="">Sem responsável</option>{members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Observações</label>
                <textarea value={txForm.notes} onChange={(e) => setTxForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal("none")} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleSaveTx} disabled={saving} className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-semibold disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: CATEGORY ══════════════════════════════════ */}
      {modal === "cat" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold">{editingCat ? "Editar Categoria" : "Nova Categoria"}</h2>
              <button onClick={() => setModal("none")} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {formError && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{formError}</div>}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nome *</label>
                <input value={catForm.name} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors" placeholder="Ex: Aluguel" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                  <select value={catForm.type} onChange={(e) => setCatForm((f) => ({ ...f, type: e.target.value as any }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold appearance-none">
                    <option value="income">Receita</option><option value="expense">Despesa</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Cor</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={catForm.color} onChange={(e) => setCatForm((f) => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-background" />
                    <input value={catForm.color} onChange={(e) => setCatForm((f) => ({ ...f, color: e.target.value }))} className="flex-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold font-mono" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal("none")} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleSaveCat} disabled={saving} className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-semibold disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
