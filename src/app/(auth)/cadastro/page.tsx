"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUpWithEmail, type AuthState } from "@/lib/actions/auth";
import { ArrowLeft, Eye, EyeOff, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState<AuthState, FormData>(signUpWithEmail, {});

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
        {/* Back */}
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
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mb-5 shadow-lg shadow-gold/20">
              <span className="text-black font-extrabold text-2xl tracking-tighter">M</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Criar Conta</h1>
            <p className="text-sm text-white/60">
              Junte-se à família META
            </p>
          </div>

          {/* Status */}
          {state.error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-fade-in">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-white">{state.success}</p>
                <Link
                  href="/login"
                  className="text-gold font-bold mt-3 inline-block hover:text-gold-light transition-colors"
                >
                  Ir para o Login →
                </Link>
              </div>
            </div>
          )}

          <form action={action} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider"
              >
                Nome completo
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="Seu nome completo"
                className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all text-sm outline-none"
              />
            </div>

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
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
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
                <>
                  <Sparkles className="w-5 h-5 text-black" />
                  Criar Minha Conta
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[13px] text-white/50 mt-8">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-gold font-bold hover:text-gold-light transition-colors ml-1"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
