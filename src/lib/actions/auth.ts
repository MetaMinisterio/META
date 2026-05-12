"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  success?: string;
};

export async function signUpWithEmail(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    const supabase = await createClient();

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!fullName || !email || !password) {
      return { error: "Preencha todos os campos." };
    }

    if (password.length < 6) {
      return { error: "A senha deve ter pelo menos 6 caracteres." };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? process.env.NEXT_PUBLIC_SITE_URL 
      : process.env.NEXT_PUBLIC_VERCEL_URL 
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
        : "http://localhost:3000";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error("Supabase Auth Error:", error);
      if (error.message.includes("already registered")) {
        return { error: "Este email já está cadastrado." };
      }
      return { error: "Erro ao criar conta. Verifique os dados ou tente novamente." };
    }

    // Se "Confirm Email" está ativo, o Supabase não retorna erro para e-mails existentes,
    // mas retorna o usuário com o array identities vazio para evitar vazamento de dados.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: "Este e-mail já está em uso por outra conta." };
    }

    return {
      success:
        "Conta criada com sucesso! Verifique seu email para confirmar o cadastro.",
    };
  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return { error: `Erro interno: ${err.message}` };
  }
}

export async function signInWithEmail(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Preencha todos os campos." };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase Login Error:", error);
      return { error: "Email ou senha incorretos." };
    }
  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return { error: `Erro interno: ${err.message}` };
  }

  redirect("/dashboard");
}

export async function signInWithMagicLink(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    const supabase = await createClient();

    const email = formData.get("email") as string;

    if (!email) {
      return { error: "Informe seu email." };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? process.env.NEXT_PUBLIC_SITE_URL 
      : process.env.NEXT_PUBLIC_VERCEL_URL 
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
        : "http://localhost:3000";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error("Magic Link Error:", error);
      return { error: "Erro ao enviar link. Tente novamente." };
    }

    return {
      success: "Link de acesso enviado! Verifique sua caixa de entrada.",
    };
  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return { error: `Erro interno: ${err.message}` };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
