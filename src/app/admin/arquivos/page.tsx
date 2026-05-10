"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FolderOpen, Plus, Trash2, Loader2, Upload } from "lucide-react";
import { fileSize } from "@/lib/utils";
import type { FileResource } from "@/lib/types/database";

export default function AdminArquivosPage() {
  const [files, setFiles] = useState<FileResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("files").select("*").order("created_at", { ascending: false });
    setFiles(data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !file) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${Date.now()}-${file.name}`;

    const { error: upErr } = await supabase.storage.from("files").upload(fileName, file, { cacheControl: "3600" });
    if (upErr) { setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("files").getPublicUrl(fileName);

    await supabase.from("files").insert({
      title, file_url: publicUrl, file_type: ext, file_size: file.size,
      category, uploaded_by: user?.id,
    });
    setTitle(""); setCategory("general"); setFile(null);
    setUploading(false);
    load();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("files").delete().eq("id", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  const catLabels: Record<string, string> = { sermon: "Pregação", devotional: "Devocional", cell: "Célula", general: "Geral" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><FolderOpen className="w-6 h-6 text-gold" /> Arquivos</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie materiais para download.</p>
      </div>

      <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-gold" /> Upload de Arquivo</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do arquivo" required
          className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-gold transition-colors appearance-none">
          <option value="general">Geral</option>
          <option value="sermon">Pregação</option>
          <option value="devotional">Devocional</option>
          <option value="cell">Célula</option>
        </select>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required
          className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20" />
        <button type="submit" disabled={uploading} className="btn-gold px-6 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Enviar
        </button>
      </form>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum arquivo enviado.</div>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{f.title}</p>
                <p className="text-[10px] text-muted-foreground">{catLabels[f.category]} · {f.file_type?.toUpperCase()} · {fileSize(f.file_size)}</p>
              </div>
              <button onClick={() => handleDelete(f.id)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
