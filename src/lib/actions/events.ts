"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const event_date = formData.get("event_date") as string;
  const end_date = formData.get("end_date") as string;

  if (!title || !event_date) {
    return { error: "Título e data são obrigatórios" };
  }

  const { error } = await supabase.from("events").insert({
    title,
    description: description || null,
    location: location || null,
    event_date: new Date(event_date).toISOString(),
    end_date: end_date ? new Date(end_date).toISOString() : null,
    is_published: true, // Garante que seja publicado para os membros verem
    created_by: user.id,
  });

  if (error) {
    console.error(error);
    return { error: "Erro ao criar evento" };
  }

  // Revalida o cache para que o membro e o painel veja imediatamente
  revalidatePath("/dashboard");
  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  revalidatePath("/admin");

  return { success: true };
}
