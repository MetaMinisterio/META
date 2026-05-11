"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signInWithEmail, signInWithMagicLink, type AuthState } from "@/lib/actions/auth";
import { ArrowLeft, Eye, EyeOff, Loader2, Mail, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [showPassword, setShowPassword] = useState(false);

  const [passwordState, passwordAction, passwordPending] = useActionState<AuthState, FormData>(
    signInWithEmail,
    {}
  );

  const [magicState, magicAction, magicPending] = useActionState<AuthState, FormData>(
    signInWithMagicLink,
    {}
  );

  const state = mode === "password" ? passwordState : magicState;
  const pending = mode === "password" ? passwordPending : magicPending;

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 py-12 relative overflow-hidden bg-black">
      {/* Background Image & Overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 grayscale mix-blend-luminosity"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=2000&auto=format&fit=crop")' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/95 to-black" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-gold transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para o início
        </Link>

        {/* Card */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/[0.05] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 gold-gradient opacity-80" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mb-5 shadow-lg shadow-gold/20">
              <span className="text-black font-extrabold text-2xl tracking-tighter">M</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Bem-vindo</h1>
            <p className="text-sm text-white/60">
              Acesse sua conta na Igreja META
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl bg-black/40 p-1 mb-8 border border-white/5">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`flex-1 py-3 text-xs font-semibold rounded-lg transition-all duration-300 ${
                mode === "password"
                  ? "bg-white/10 text-white shadow-md backdrop-blur-md"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              Email & Senha
            </button>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className={`flex-1 py-3 text-xs font-semibold rounded-lg transition-all duration-300 ${
                mode === "magic"
                  ? "bg-white/10 text-white shadow-md backdrop-blur-md"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              Link Mágico
            </button>
          </div>

          {/* Status messages */}
          {state.error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-fade-in">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium flex items-start gap-2 animate-fade-in">
              <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
              {state.success}
            </div>
          )}

          {mode === "password" ? (
            <form action={passwordAction} className="space-y-5 animate-fade-in">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="exemplo@email.com"
                  className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all text-sm outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all text-sm outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="btn-gold w-full py-4 mt-2 text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/10"
              >
                {pending ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  "Acessar Plataforma"
                )}
              </button>
            </form>
          ) : (
            <form action={magicAction} className="space-y-5 animate-fade-in">
              <div>
                <label
                  htmlFor="magic-email"
                  className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider"
                >
                  E-mail
                </label>
                <input
                  id="magic-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="exemplo@email.com"
                  className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="btn-gold w-full py-4 mt-2 text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/10"
              >
                {pending ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  <>
                    <Mail className="w-5 h-5 text-black" />
                    Receber Link de Acesso
                  </>
                )}
              </button>

              <p className="text-[13px] text-white/50 text-center leading-relaxed">
                Você receberá um link mágico no seu e-mail para entrar diretamente, sem precisar de senha.
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[13px] text-white/50 mt-8">
          Ainda não tem uma conta?{" "}
          <Link
            href="/cadastro"
            className="text-gold font-bold hover:text-gold-light transition-colors ml-1"
          >
            Criar minha conta
          </Link>
        </p>
      </div>
    </main>
  );
}
