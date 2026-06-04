"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signInWithEmail, signInWithGoogle, type AuthState } from "@/lib/actions/auth";
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, ChevronDown } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const [googleState, googleAction, googlePending] = useActionState<AuthState, FormData>(
    signInWithGoogle,
    {}
  );
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signInWithEmail,
    {}
  );

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden">

      {/* Decorative background — works in both light and dark */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(245,158,11,0.06),transparent)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />

      <div className="relative z-10 w-full max-w-[400px]">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-12 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Voltar
        </Link>

        {/* Logo + título */}
        <div className="text-center mb-10">
          <div className="inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-5 bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <span className="text-black font-black text-lg tracking-tighter select-none">M</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1.5">
            Entrar na Igreja META
          </h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo de volta
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6">

          {/* Google — ação primária */}
          <form action={googleAction}>
            {googleState?.error && (
              <div className="flex items-start gap-2 mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {googleState.error}
              </div>
            )}
            <button
              type="submit"
              disabled={googlePending}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-zinc-50 active:bg-zinc-100 text-zinc-900 text-sm font-semibold border border-zinc-200 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googlePending ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              ) : (
                <>
                  <GoogleIcon />
                  Continuar com Google
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-[0.1em]">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* E-mail/senha — colapsado por padrão */}
          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 hover:bg-muted/50 transition-all"
            >
              Entrar com e-mail e senha
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="animate-fade-in-up">
              {state?.error && (
                <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {state.error}
                </div>
              )}

              <form action={action} className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Senha
                    </label>
                    <Link href="/esqueci-senha" className="text-[11px] text-muted-foreground hover:text-amber-500 transition-colors">
                      Esqueceu?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm outline-none pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full py-3 mt-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-all shadow-[0_2px_12px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Acesso exclusivo para membros da Igreja META
        </p>
      </div>
    </main>
  );
}
