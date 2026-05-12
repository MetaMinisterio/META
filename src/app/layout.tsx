import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "META — Igreja",
    template: "%s | META",
  },
  description:
    "Conecte-se com a Igreja META. Participe dos cultos, envie pedidos de oração, contribua e cresça na fé.",
  keywords: ["igreja", "META", "culto", "oração", "comunidade", "fé"],
  authors: [{ name: "Igreja META" }],
  openGraph: {
    title: "META — Igreja",
    description: "Conecte-se com a Igreja META.",
    type: "website",
    locale: "pt_BR",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "META",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable}`}>
      <body className="min-h-dvh flex flex-col bg-background text-foreground font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
