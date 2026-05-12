"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormValues } from "@/lib/validations/profileSchema";
import { Save, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Profile } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";

// Utility functions for formatting masks
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
};

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
};

const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
};

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      cpf: profile?.cpf ? formatCPF(profile.cpf) : "",
      phone: profile?.phone ? formatPhone(profile.phone) : "",
      cep: profile?.zip_code ? formatCEP(profile.zip_code) : "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Não autorizado");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          cpf: data.cpf,
          phone: data.phone,
          zip_code: data.cep,
        })
        .eq("id", user.id);

      if (error) throw error;
      
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Erro ao atualizar perfil. Verifique os dados." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nome completo</label>
        <input 
          {...register("full_name")}
          className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-foreground focus:border-gold outline-none transition-colors" 
        />
        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">CPF</label>
          <input 
            {...register("cpf")}
            onChange={(e) => {
              const formatted = formatCPF(e.target.value);
              setValue("cpf", formatted, { shouldValidate: true });
            }}
            placeholder="000.000.000-00"
            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-foreground focus:border-gold outline-none transition-colors" 
          />
          {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Telefone/Celular</label>
          <input 
            {...register("phone")}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              setValue("phone", formatted, { shouldValidate: true });
            }}
            placeholder="(00) 00000-0000"
            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-foreground focus:border-gold outline-none transition-colors" 
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">CEP</label>
        <input 
          {...register("cep")}
          onChange={(e) => {
            const formatted = formatCEP(e.target.value);
            setValue("cep", formatted, { shouldValidate: true });
            // TODO: Integrar viaCEP aqui no futuro
          }}
          placeholder="00000-000"
          className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-foreground focus:border-gold outline-none transition-colors" 
        />
        {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep.message}</p>}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting} 
        className="btn-primary w-full py-3.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Salvar Alterações</>}
      </button>
    </form>
  );
}
