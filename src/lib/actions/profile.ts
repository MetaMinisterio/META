"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProfileState = {
  error?: string;
  success?: string;
};

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const birthDate = formData.get("birthDate") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zipCode = formData.get("zipCode") as string;
  const ministriesRaw = formData.get("ministries") as string;

  const ministries = ministriesRaw
    ? ministriesRaw
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean)
    : [];

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || undefined,
      phone: phone || null,
      birth_date: birthDate || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zip_code: zipCode || null,
      ministries,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Erro ao salvar perfil. Tente novamente." };
  }

  revalidatePath("/perfil");
  return { success: "Perfil atualizado com sucesso!" };
}

export async function updateAvatar(_prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada." };
  }

  const file = formData.get("avatar") as File;

  if (!file || file.size === 0) {
    return { error: "Selecione uma imagem." };
  }

  // Max 2MB for free tier performance
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Imagem muito grande. Máximo 2MB." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return { error: "Erro ao enviar imagem." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return { error: "Erro ao atualizar perfil." };
  }

  revalidatePath("/perfil");
  return { success: "Foto atualizada!" };
}
