import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Users,
  BookOpen,
  Sparkles,
  ArrowRight,
  Camera,
  Play,
  Mail,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-background overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <span className="text-black font-extrabold text-sm tracking-tight">
                M
              </span>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              META
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a
              href="#about"
              className="hover:text-gold transition-colors duration-200"
            >
              Sobre
            </a>
            <a
              href="#schedule"
              className="hover:text-gold transition-colors duration-200"
            >
              Cultos
            </a>
            <a
              href="#ministries"
              className="hover:text-gold transition-colors duration-200"
            >
              Ministérios
            </a>
          </div>

          <Link
            href="/login"
            className="btn-gold px-5 py-2.5 text-sm font-semibold rounded-full flex items-center gap-1.5"
          >
            Entrar
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-dvh flex items-center justify-center pt-16">
        {/* Gradient orb backgrounds */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gold/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gold/5 rounded-full blur-[128px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-[200px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(212,160,23,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,0.3) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs font-medium text-gold tracking-wide uppercase">
              Bem-vindo à Igreja META
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 animate-fade-in stagger-1">
            Sua vida tem um{" "}
            <span className="gold-text">propósito</span>
            <br />
            <span className="text-muted-foreground font-light text-3xl sm:text-4xl md:text-5xl">
              descubra ele aqui.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in stagger-2">
            Uma comunidade de fé que vive para transformar vidas. Venha fazer
            parte da família META e caminhe ao lado de pessoas que buscam o
            extraordinário.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in stagger-3">
            <Link
              href="/cadastro"
              className="btn-gold px-8 py-4 text-base font-bold rounded-full flex items-center gap-2 animate-pulse-gold"
            >
              Faça Parte da Família
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#schedule"
              className="px-8 py-4 text-base font-medium rounded-full border border-border text-foreground hover:border-gold/50 hover:text-gold transition-all duration-300"
            >
              Ver Horários de Culto
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex items-center justify-center gap-8 text-muted-foreground animate-fade-in stagger-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">500+</p>
              <p className="text-xs">Membros</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-xs">Ministérios</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-xs">Cultos/Semana</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-gold rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
              Nossa Essência
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Mais do que uma igreja,
              <br />
              <span className="text-muted-foreground">uma família.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "Amor Radical",
                description:
                  "Acreditamos no poder do amor que transforma. Aqui você é acolhido como você é.",
              },
              {
                icon: Users,
                title: "Comunidade Viva",
                description:
                  "Células, encontros e eventos que fortalecem laços e criam amizades para a vida.",
              },
              {
                icon: BookOpen,
                title: "Palavra Viva",
                description:
                  "Ensino bíblico relevante e aplicável ao dia a dia, com profundidade e simplicidade.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl border border-border bg-card hover:border-gold/30 transition-all duration-500"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                    <item.icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SCHEDULE ─── */}
      <section id="schedule" className="py-24 md:py-32 bg-card/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
              Programação
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Horários de{" "}
              <span className="gold-text">Cultos</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                day: "Domingo",
                time: "18h00",
                name: "Culto da Família",
                desc: "Momento de louvor, palavra e comunhão para toda a família.",
              },
              {
                day: "Quarta-feira",
                time: "19h30",
                name: "Culto de Ensino",
                desc: "Estudo aprofundado da Palavra para edificação e crescimento.",
              },
              {
                day: "Sexta-feira",
                time: "20h00",
                name: "Culto dos Jovens",
                desc: "Encontro vibrante com louvor, palavra e comunhão jovem.",
              },
            ].map((culto, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 hover:border-gold/30 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-1 gold-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-center gap-2 text-gold mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{culto.time}</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                  {culto.day}
                </p>
                <h3 className="text-xl font-bold mb-2">{culto.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {culto.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 text-gold" />
              <span>Rua da Igreja, 123 — Centro, Cidade/UF</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MINISTRIES ─── */}
      <section id="ministries" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
              Sirva com seus dons
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Nossos{" "}
              <span className="gold-text">Ministérios</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: "Louvor", emoji: "🎵" },
              { name: "Kids", emoji: "👶" },
              { name: "Jovens", emoji: "⚡" },
              { name: "Intercessão", emoji: "🙏" },
              { name: "Mídia", emoji: "🎬" },
            ].map((min, i) => (
              <div
                key={i}
                className="group text-center p-6 rounded-2xl border border-border bg-card hover:border-gold/30 hover:bg-gold/5 transition-all duration-300 cursor-default"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {min.emoji}
                </div>
                <p className="font-semibold text-sm">{min.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/10 rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Pronto para dar o{" "}
            <span className="gold-text">próximo passo?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Cadastre-se no app da META e tenha acesso a cultos, eventos, pedidos
            de oração e muito mais na palma da sua mão.
          </p>
          <Link
            href="/cadastro"
            className="btn-gold px-10 py-4 text-base font-bold rounded-full inline-flex items-center gap-2"
          >
            Criar Minha Conta
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                <span className="text-black font-extrabold text-xs">M</span>
              </div>
              <span className="font-bold text-foreground">Igreja META</span>
            </div>

            {/* Socials */}
            <div className="flex items-center justify-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/50 transition-colors"
                aria-label="Instagram"
              >
                <Camera className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/50 transition-colors"
                aria-label="YouTube"
              >
                <Play className="w-4 h-4" />
              </a>
              <a
                href="mailto:contato@igrejameta.com"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/50 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground text-center md:text-right">
              © {new Date().getFullYear()} Igreja META. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
