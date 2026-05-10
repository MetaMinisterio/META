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
    <main className="min-h-dvh flex items-center justify-center px-4 py-12 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gold/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-gold/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
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
            <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
            <p className="text-sm text-muted-foreground">
              Acesse sua conta na Igreja META
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 border border-border">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === "password"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Email & Senha
            </button>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === "magic"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Status messages */}
          {state.error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
              {state.success}
            </div>
          )}

          {mode === "password" ? (
            <form action={passwordAction} className="space-y-4">
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
                    autoComplete="current-password"
                    placeholder="••••••"
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
                  "Entrar"
                )}
              </button>
            </form>
          ) : (
            <form action={magicAction} className="space-y-4">
              <div>
                <label
                  htmlFor="magic-email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Email
                </label>
                <input
                  id="magic-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold/50 transition-colors text-sm outline-none"
                />
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
                    <Mail className="w-4 h-4" />
                    Enviar Link de Acesso
                  </>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Enviaremos um link mágico para seu email. Sem necessidade de
                senha!
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="text-gold font-semibold hover:text-gold-light transition-colors"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
