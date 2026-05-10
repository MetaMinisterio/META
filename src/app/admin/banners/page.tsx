"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Image as ImageIcon, Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import type { Banner } from "@/lib/types/database";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("banners").select("*").order("display_order");
    setBanners(data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !file) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from("banners").upload(fileName, file, { cacheControl: "3600" });
    if (upErr) { setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("banners").getPublicUrl(fileName);
    await supabase.from("banners").insert({
      title, image_url: publicUrl, link_url: link || null,
      display_order: banners.length, created_by: user?.id,
    });
    setTitle(""); setLink(""); setFile(null);
    setUploading(false);
    load();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("banners").delete().eq("id", id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  async function toggleActive(id: string, active: boolean) {
    const supabase = createClient();
    await supabase.from("banners").update({ is_active: !active }).eq("id", id);
    setBanners((prev) => prev.map((b) => b.id === id ? { ...b, is_active: !active } : b));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ImageIcon className="w-6 h-6 text-gold" /> Banners</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os banners do feed dos membros.</p>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-gold" /> Novo Banner</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do banner" required
          className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link (opcional)"
          className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required
          className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20" />
        <button type="submit" disabled={uploading} className="btn-gold px-6 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Criar Banner
        </button>
      </form>

      {/* List */}
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="skeleton h-20 rounded-xl"/>)}</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum banner criado.</div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
              <div className="shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-muted">
                <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{b.title}</p>
                <p className="text-[10px] text-muted-foreground">{b.is_active ? "Ativo" : "Inativo"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(b.id, b.is_active)} className={`text-[10px] px-2 py-1 rounded-lg font-medium transition-colors ${b.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {b.is_active ? "Ativo" : "Inativo"}
                </button>
                <button onClick={() => handleDelete(b.id)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
