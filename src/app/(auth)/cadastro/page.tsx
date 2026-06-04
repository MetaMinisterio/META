import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function CadastroPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(245,158,11,0.06),transparent)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[400px]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-12 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Voltar
        </Link>

        <div className="rounded-2xl border border-border bg-card shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5 border border-border">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>

          <h1 className="text-xl font-bold text-foreground tracking-tight mb-2">
            Cadastro por convite
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-7">
            O cadastro direto está desativado. O acesso à plataforma é feito
            exclusivamente pelo Google, mediante convite da Igreja META.
          </p>

          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black text-sm font-bold flex items-center justify-center hover:opacity-90 transition-all shadow-[0_2px_12px_rgba(245,158,11,0.2)]"
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    </main>
  );
}
