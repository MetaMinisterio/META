"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "pastor"].includes(profile.role)) throw new Error("Sem permissão");
  return { supabase, userId: user.id };
}

// ── Transactions ──────────────────────────────────────────────

export type TransactionInput = {
  type: "income" | "expense";
  category_id?: string | null;
  amount: number;
  description: string;
  payment_method: string;
  reference_date: string;
  responsible_id?: string | null;
  notes?: string | null;
};

export async function createTransaction(data: TransactionInput): Promise<{ error?: string }> {
  try {
    const { supabase, userId } = await assertAdmin();
    const { error } = await supabase.from("transactions").insert({ ...data, created_by: userId });
    if (error) return { error: "Erro ao criar lançamento." };
    revalidatePath("/admin/contribuicoes");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateTransaction(
  id: string,
  data: Partial<TransactionInput>
): Promise<{ error?: string }> {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("transactions").update(data).eq("id", id);
    if (error) return { error: "Erro ao atualizar lançamento." };
    revalidatePath("/admin/contribuicoes");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteTransaction(id: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) return { error: "Erro ao excluir lançamento." };
    revalidatePath("/admin/contribuicoes");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export type TransactionFilters = {
  startDate?: string;
  endDate?: string;
  type?: "income" | "expense" | "all";
  categoryId?: string;
  paymentMethod?: string;
  responsibleId?: string;
};

export async function getTransactions(filters: TransactionFilters = {}) {
  try {
    const { supabase } = await assertAdmin();
    let query = supabase
      .from("transactions")
      .select("*, financial_categories(name, color), responsible:responsible_id(full_name), creator:created_by(full_name)")
      .order("reference_date", { ascending: false });

    if (filters.startDate) query = query.gte("reference_date", filters.startDate);
    if (filters.endDate) query = query.lte("reference_date", filters.endDate);
    if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
    if (filters.paymentMethod) query = query.eq("payment_method", filters.paymentMethod);
    if (filters.responsibleId) query = query.eq("responsible_id", filters.responsibleId);

    const { data, error } = await query;
    if (error) return { data: [], error: error.message };
    return { data: data || [], error: null };
  } catch (e) {
    return { data: [], error: (e as Error).message };
  }
}

// Summary for dashboard / visão geral
export async function getFinancialSummary(months = 6) {
  try {
    const { supabase } = await assertAdmin();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    const startISO = startDate.toISOString().slice(0, 10);

    const [{ data: txs }, { data: tithes }] = await Promise.all([
      supabase.from("transactions").select("type, amount, reference_date").gte("reference_date", startISO),
      supabase.from("tithes").select("amount, status, created_at").gte("created_at", startISO),
    ]);

    // Current month boundaries
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthEnd = nextMonth.toISOString().slice(0, 10);

    const incomeMonth = (txs || [])
      .filter((t) => t.type === "income" && t.reference_date >= monthStart && t.reference_date < monthEnd)
      .reduce((s, t) => s + Number(t.amount), 0);

    const expenseMonth = (txs || [])
      .filter((t) => t.type === "expense" && t.reference_date >= monthStart && t.reference_date < monthEnd)
      .reduce((s, t) => s + Number(t.amount), 0);

    const tithesConfirmedMonth = (tithes || [])
      .filter((t) => t.status === "confirmed" && t.created_at >= monthStart && t.created_at < monthEnd)
      .reduce((s, t) => s + Number(t.amount), 0);

    const totalIncome = incomeMonth + tithesConfirmedMonth;
    const saldo = totalIncome - expenseMonth;

    // Build monthly series (last N months)
    const series: { month: string; income: number; expense: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().slice(0, 10);
      const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });

      const inc = (txs || [])
        .filter((t) => t.type === "income" && t.reference_date >= mStart && t.reference_date < mEnd)
        .reduce((s, t) => s + Number(t.amount), 0);

      const tInc = (tithes || [])
        .filter((t) => t.status === "confirmed" && t.created_at >= mStart && t.created_at < mEnd)
        .reduce((s, t) => s + Number(t.amount), 0);

      const exp = (txs || [])
        .filter((t) => t.type === "expense" && t.reference_date >= mStart && t.reference_date < mEnd)
        .reduce((s, t) => s + Number(t.amount), 0);

      series.push({ month: label, income: inc + tInc, expense: exp });
    }

    return { incomeMonth: totalIncome, expenseMonth, saldo, tithesConfirmedMonth, series };
  } catch {
    return { incomeMonth: 0, expenseMonth: 0, saldo: 0, tithesConfirmedMonth: 0, series: [] };
  }
}

// Category distribution for pie chart (current month)
export async function getCategoryDistribution() {
  try {
    const { supabase } = await assertAdmin();
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);

    const { data } = await supabase
      .from("transactions")
      .select("type, amount, financial_categories(name, color)")
      .gte("reference_date", monthStart)
      .lt("reference_date", monthEnd);

    const map = new Map<string, { name: string; color: string; value: number; type: string }>();
    for (const t of data || []) {
      const cat = (t as any).financial_categories;
      const key = cat?.name ?? "Sem categoria";
      const existing = map.get(key);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        map.set(key, { name: key, color: cat?.color ?? "#6B7280", value: Number(t.amount), type: t.type });
      }
    }
    return Array.from(map.values());
  } catch {
    return [];
  }
}

// ── Categories ────────────────────────────────────────────────

export type CategoryInput = {
  name: string;
  type: "income" | "expense";
  color?: string;
};

export async function createCategory(data: CategoryInput): Promise<{ error?: string }> {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("financial_categories").insert(data);
    if (error) return { error: "Erro ao criar categoria." };
    revalidatePath("/admin/contribuicoes");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateCategory(
  id: string,
  data: Partial<CategoryInput & { is_active: boolean }>
): Promise<{ error?: string }> {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("financial_categories").update(data).eq("id", id);
    if (error) return { error: "Erro ao atualizar categoria." };
    revalidatePath("/admin/contribuicoes");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("financial_categories").delete().eq("id", id);
    if (error) return { error: "Erro ao excluir categoria. Verifique se não há lançamentos vinculados." };
    revalidatePath("/admin/contribuicoes");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
