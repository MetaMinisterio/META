"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUpWithEmail, type AuthState } from "@/lib/actions/auth";
import { ArrowLeft, Eye, EyeOff, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState<AuthState, FormData>(signUpWithEmail, {});

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 py-12 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-gold/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-gold/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center">
            <span className="text-black font-extrabold text-lg">M</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Criar Conta</h1>
            <p className="text-sm text-muted-foreground">
              Junte-se à família META
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 border border-border">
          {/* Status */}
          {state.error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="mb-4 p-4 rounded-lg bg-success/10 border border-success/20 text-success text-sm flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{state.success}</p>
                <Link
                  href="/login"
                  className="text-gold font-semibold mt-2 inline-block hover:text-gold-light transition-colors"
                >
                  Ir para o Login →
                </Link>
              </div>
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium mb-1.5"
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
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold/50 transition-colors text-sm outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold/50 transition-colors text-sm outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
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
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold/50 transition-colors text-sm outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="btn-gold w-full py-3.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Criar Minha Conta
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-gold font-semibold hover:text-gold-light transition-colors"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
