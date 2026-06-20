"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users, Search, X, Edit2, Trash2, UserCheck, UserX,
  ChevronDown, Save, AlertTriangle, Phone, MapPin, Tag,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { adminUpdateMember, adminToggleMemberActive, adminDeleteMember } from "@/lib/actions/members";
import type { Profile, UserRole } from "@/lib/types/database";

const roleLabels: Record<UserRole, { label: string; color: string }> = {
  admin:   { label: "Admin",  color: "bg-gold/20 text-gold" },
  pastor:  { label: "Pastor", color: "bg-blue-500/20 text-blue-500" },
  leader:  { label: "Líder",  color: "bg-green-500/20 text-green-500" },
  member:  { label: "Membro", color: "bg-muted text-muted-foreground" },
};

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "member",  label: "Membro" },
  { value: "leader",  label: "Líder" },
  { value: "pastor",  label: "Pastor" },
  { value: "admin",   label: "Admin" },
];

type ModalState =
  | { type: "none" }
  | { type: "edit"; member: Profile }
  | { type: "delete"; member: Profile };

export default function MembrosPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    role: "member" as UserRole,
    ministries: "",
    city: "",
    state: "",
    is_active: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("*").order("full_name");
    setMembers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = members.filter((m) =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search) ||
    m.ministries?.some((min) => min.toLowerCase().includes(search.toLowerCase()))
  );

  function openEdit(m: Profile) {
    setEditForm({
      full_name: m.full_name || "",
      phone: m.phone || "",
      role: m.role,
      ministries: m.ministries?.join(", ") || "",
      city: m.city || "",
      state: m.state || "",
      is_active: m.is_active,
    });
    setError(null);
    setModal({ type: "edit", member: m });
  }

  async function handleSaveEdit() {
    if (modal.type !== "edit") return;
    setSaving(true);
    setError(null);
    const result = await adminUpdateMember(modal.member.id, {
      full_name: editForm.full_name,
      phone: editForm.phone || null,
      role: editForm.role,
      ministries: editForm.ministries.split(",").map((s) => s.trim()).filter(Boolean),
      city: editForm.city || null,
      state: editForm.state || null,
      is_active: editForm.is_active,
    });
    if (result.error) {
      setError(result.error);
    } else {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === modal.member.id
            ? {
                ...m,
                full_name: editForm.full_name,
                phone: editForm.phone || null,
                role: editForm.role,
                ministries: editForm.ministries.split(",").map((s) => s.trim()).filter(Boolean),
                city: editForm.city || null,
                state: editForm.state || null,
                is_active: editForm.is_active,
              }
            : m
        )
      );
      setModal({ type: "none" });
    }
    setSaving(false);
  }

  async function handleToggleActive(m: Profile) {
    const result = await adminToggleMemberActive(m.id, !m.is_active);
    if (!result.error) {
      setMembers((prev) => prev.map((p) => p.id === m.id ? { ...p, is_active: !m.is_active } : p));
    }
  }

  async function handleDelete() {
    if (modal.type !== "delete") return;
    setSaving(true);
    setError(null);
    const result = await adminDeleteMember(modal.member.id);
    if (result.error) {
      setError(result.error);
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== modal.member.id));
      setModal({ type: "none" });
    }
    setSaving(false);
  }

  const activeCount = members.filter((m) => m.is_active).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-gold" /> Membros
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {members.length} cadastrados · {activeCount} ativos
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone ou ministério..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm outline-none focus:border-gold transition-colors"
        />
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <Users className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
          Nenhum membro encontrado.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 p-3 rounded-xl border bg-card transition-colors ${
                m.is_active ? "border-border hover:border-gold/20" : "border-border opacity-60"
              }`}
            >
              {/* Avatar */}
              <div className="shrink-0 w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center overflow-hidden">
                {m.avatar_url
                  ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xs font-bold text-gold">{getInitials(m.full_name)}</span>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-semibold text-sm truncate">{m.full_name || "Sem nome"}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleLabels[m.role]?.color}`}>
                    {roleLabels[m.role]?.label}
                  </span>
                  {!m.is_active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">
                      Inativo
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {m.phone || "Sem telefone"}
                  {m.city ? ` · ${m.city}${m.state ? `/${m.state}` : ""}` : ""}
                  {m.ministries && m.ministries.length > 0 ? ` · ${m.ministries.join(", ")}` : ""}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggleActive(m)}
                  title={m.is_active ? "Desativar membro" : "Reativar membro"}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    m.is_active
                      ? "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                      : "text-green-500 hover:bg-green-500/10"
                  }`}
                >
                  {m.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => openEdit(m)}
                  title="Editar membro"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setError(null); setModal({ type: "delete", member: m }); }}
                  title="Excluir membro"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {modal.type === "edit" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-bold text-foreground">Editar Membro</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{modal.member.full_name}</p>
              </div>
              <button onClick={() => setModal({ type: "none" })} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nome completo</label>
                <input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />Telefone</label>
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Cargo</label>
                  <div className="relative">
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                      className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors appearance-none"
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />Cidade</label>
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Estado</label>
                  <input
                    value={editForm.state}
                    onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                    placeholder="SP"
                    maxLength={2}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Tag className="w-3 h-3" />Ministérios (separados por vírgula)</label>
                <input
                  value={editForm.ministries}
                  onChange={(e) => setEditForm((f) => ({ ...f, ministries: e.target.value }))}
                  placeholder="Louvor, Intercessão..."
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-gold transition-colors"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Membro ativo</p>
                  <p className="text-xs text-muted-foreground">Membros inativos não aparecem nas listas do app</p>
                </div>
                <button
                  onClick={() => setEditForm((f) => ({ ...f, is_active: !f.is_active }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${editForm.is_active ? "bg-green-500" : "bg-muted"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${editForm.is_active ? "translate-x-5" : "translate-x-1"}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModal({ type: "none" })}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modal.type === "delete" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
              </div>
              <h2 className="font-bold text-foreground mb-1">Excluir membro?</h2>
              <p className="text-sm text-muted-foreground mb-1">
                <strong className="text-foreground">{modal.member.full_name}</strong> será removido permanentemente.
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                Todos os dados, orações, contribuições e histórico serão excluídos. Essa ação não pode ser desfeita.
              </p>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500 mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setModal({ type: "none" })}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
