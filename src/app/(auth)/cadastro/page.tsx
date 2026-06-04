import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function CadastroPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4 py-12 relative overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 grayscale mix-blend-luminosity"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=2000&auto=format&fit=crop")' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/95 to-black" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-gold transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para o início
        </Link>

        <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/[0.05] shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0 h-1 gold-gradient opacity-80" />

          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-6 h-6 text-gold" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-3">
            Cadastro por convite
          </h1>
          <p className="text-sm text-white/60 leading-relaxed mb-8">
            O cadastro direto está desativado. O acesso à plataforma é feito
            exclusivamente pelo Google, mediante convite.
          </p>

          <Link
            href="/login"
            className="btn-gold w-full py-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-gold/10"
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    </main>
  );
}
