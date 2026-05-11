import Link from "next/link";
import { ArrowRight, Smartphone, Heart, Users, Calendar, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col items-center">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground text-background flex items-center justify-center rounded-lg font-bold text-sm">
              M
            </div>
            <span className="font-semibold text-sm tracking-tight">META</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary px-4 py-2 text-sm rounded-md shadow-none hover:shadow-none bg-foreground text-background hover:bg-zinc-200">
              Criar Conta
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative w-full pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-medium text-zinc-300">Nova plataforma disponível</span>
            <ChevronRight className="w-3 h-3 text-zinc-500" strokeWidth={2} />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            A evolução da sua <br />
            <span className="text-gradient">jornada espiritual.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Um ecossistema completo para conectar, engajar e transformar a nossa comunidade. Descubra uma nova forma de viver a Igreja META.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro" className="btn-primary w-full sm:w-auto px-8 py-4 text-base rounded-full group">
              Começar Agora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </Link>
            <Link href="#features" className="btn-ghost w-full sm:w-auto px-8 py-4 text-base rounded-full border border-zinc-800 hover:border-zinc-700">
              Conhecer a plataforma
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BENTO GRID FEATURES ─── */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up delay-200">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Tudo em um só lugar.</h2>
          <p className="text-zinc-400">Design focado no que importa: as pessoas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {/* Card 1: PWA / App */}
          <div className="bento-card md:col-span-2 p-8 flex flex-col justify-between group">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50 mb-6">
              <Smartphone className="w-6 h-6 text-zinc-300" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">App Mobile-First</h3>
              <p className="text-zinc-400 max-w-md">
                Instale diretamente no seu celular. Sem passar pelas lojas de aplicativos. Experiência nativa, rápida e offline-ready.
              </p>
            </div>
          </div>

          {/* Card 2: Tithes */}
          <div className="bento-card p-8 flex flex-col justify-between group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-6">
              <Heart className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Contribuições</h3>
              <p className="text-zinc-400 text-sm">
                Devolva seus dízimos via PIX com conciliação automática e envie os comprovantes com 1 clique.
              </p>
            </div>
          </div>

          {/* Card 3: Groups */}
          <div className="bento-card p-8 flex flex-col justify-between group">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50 mb-6">
              <Users className="w-6 h-6 text-zinc-300" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Comunidade</h3>
              <p className="text-zinc-400 text-sm">
                Encontre células e grupos de conexão próximos a você. Relacionamento intencional.
              </p>
            </div>
          </div>

          {/* Card 4: Events */}
          <div className="bento-card md:col-span-2 p-8 flex flex-col justify-between group">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50 mb-6">
              <Calendar className="w-6 h-6 text-zinc-300" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Agenda Integrada</h3>
              <p className="text-zinc-400 max-w-md">
                Nunca mais perca um evento. Acompanhe os horários dos cultos, acampamentos e seminários de capacitação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="w-full border-t border-zinc-800/50 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-sm">
          <p>© {new Date().getFullYear()} Igreja META. Todos os direitos reservados.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-zinc-300 transition-colors">Termos</Link>
            <Link href="#" className="hover:text-zinc-300 transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
