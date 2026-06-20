"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/lib/types/database";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "pastor"].includes(profile.role)) throw new Error("Sem permissão");
  return supabase;
}

export async function adminUpdateMember(
  memberId: string,
  data: {
    full_name?: string;
    phone?: string | null;
    role?: UserRole;
    ministries?: string[];
    city?: string | null;
    state?: string | null;
    is_active?: boolean;
  }
): Promise<{ error?: string }> {
  try {
    const supabase = await assertAdmin();
    const { error } = await supabase.from("profiles").update(data).eq("id", memberId);
    if (error) return { error: "Erro ao atualizar membro." };
    revalidatePath("/admin/membros");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function adminToggleMemberActive(
  memberId: string,
  isActive: boolean
): Promise<{ error?: string }> {
  try {
    const supabase = await assertAdmin();
    const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", memberId);
    if (error) return { error: "Erro ao atualizar status." };
    revalidatePath("/admin/membros");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function adminDeleteMember(memberId: string): Promise<{ error?: string }> {
  try {
    await assertAdmin();
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(memberId);
    if (error) return { error: "Erro ao excluir membro." };
    revalidatePath("/admin/membros");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
