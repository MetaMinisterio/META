import { createClient } from "@/lib/supabase/server";
import { fileSize } from "@/lib/utils";
import type { Metadata } from "next";
import { FolderOpen, Download, FileText, BookOpen, Users, File } from "lucide-react";

export const metadata: Metadata = { title: "Arquivos" };

const categoryIcons: Record<string, typeof FileText> = {
  sermon: BookOpen,
  devotional: FileText,
  cell: Users,
  general: File,
};
const categoryLabels: Record<string, string> = {
  sermon: "Pregações",
  devotional: "Devocionais",
  cell: "Células",
  general: "Geral",
};

export default async function ArquivosPage() {
  const supabase = await createClient();
  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  type FileRow = NonNullable<typeof files>[number];
  const grouped = (files || []).reduce<Record<string, FileRow[]>>((acc, f) => {
    const cat = f.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-gold" />
          Arquivos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Materiais e recursos da igreja.</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum arquivo disponível.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catFiles]) => {
          const Icon = categoryIcons[cat] || File;
          return (
            <section key={cat}>
              <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-gold" />
                {categoryLabels[cat] || cat}
              </h2>
              <div className="space-y-2">
                {catFiles!.map((f) => (
                  <a
                    key={f.id}
                    href={f.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{f.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {f.file_type?.toUpperCase()} · {fileSize(f.file_size)}
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
