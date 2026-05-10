"use client";

import { useActionState, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, updateAvatar, type ProfileState } from "@/lib/actions/profile";
import { signOut } from "@/lib/actions/auth";
import { Camera, Loader2, LogOut, Save, User } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileState, profileAction, profilePending] = useActionState<ProfileState, FormData>(updateProfile, {});
  const [avatarState, avatarAction, avatarPending] = useActionState<ProfileState, FormData>(updateAvatar, {});

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="space-y-4 pb-4">
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <User className="w-6 h-6 text-gold" />
        Meu Perfil
      </h1>

      {/* Avatar */}
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center overflow-hidden border-2 border-gold/30">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-gold">{getInitials(profile?.full_name || "M")}</span>
            )}
          </div>
          <form action={avatarAction}>
            <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gold flex items-center justify-center cursor-pointer hover:bg-gold-light transition-colors">
              {avatarPending ? <Loader2 className="w-3.5 h-3.5 text-black animate-spin" /> : <Camera className="w-3.5 h-3.5 text-black" />}
              <input name="avatar" type="file" accept="image/*" className="sr-only" onChange={(e) => { if (e.target.files?.[0]) e.target.form?.requestSubmit(); }} />
            </label>
          </form>
        </div>
        <p className="font-bold">{profile?.full_name || "Membro"}</p>
        {avatarState.error && <p className="text-destructive text-xs mt-1">{avatarState.error}</p>}
        {avatarState.success && <p className="text-success text-xs mt-1">{avatarState.success}</p>}
      </div>

      {/* Profile form */}
      <div className="rounded-2xl border border-border bg-card p-5">
        {profileState.error && <div className="mb-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{profileState.error}</div>}
        {profileState.success && <div className="mb-3 p-3 rounded-lg bg-success/10 text-success text-sm">{profileState.success}</div>}

        <form action={profileAction} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Nome completo</label>
            <input name="fullName" defaultValue={profile?.full_name || ""} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Telefone</label>
              <input name="phone" defaultValue={profile?.phone || ""} placeholder="(00) 00000-0000" className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Nascimento</label>
              <input name="birthDate" type="date" defaultValue={profile?.birth_date || ""} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Endereço</label>
            <input name="address" defaultValue={profile?.address || ""} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Cidade</label>
              <input name="city" defaultValue={profile?.city || ""} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">UF</label>
              <input name="state" defaultValue={profile?.state || ""} maxLength={2} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">CEP</label>
              <input name="zipCode" defaultValue={profile?.zip_code || ""} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Ministérios <span className="text-muted-foreground font-normal">(separados por vírgula)</span></label>
            <input name="ministries" defaultValue={profile?.ministries?.join(", ") || ""} placeholder="Ex: Louvor, Jovens, Mídia" className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
          </div>
          <button type="submit" disabled={profilePending} className="btn-gold w-full py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {profilePending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
          </button>
        </form>
      </div>

      {/* Logout */}
      <form action={signOut}>
        <button type="submit" className="w-full py-3 text-sm font-medium rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Sair da Conta
        </button>
      </form>
    </div>
  );
}
