import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import PageTransitionWrapper from "@/components/layout/PageTransitionWrapper";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { EscenarioProvider } from "@/context/EscenarioContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { themeInitScript } from "@/lib/theme";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1020",
};

export const metadata: Metadata = {
  title: "LifeOS · Viajes y aulas",
  description: "Tus colectivos, clases y aulas. Todo a mano para moverte por Córdoba.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "LifeOS" },
  formatDetection: { telephone: false },
  icons: { icon: "/icon", apple: "/apple-icon" },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body className="min-h-[100dvh] antialiased">
        <ThemeProvider>
          <EscenarioProvider>
            <PageTransitionWrapper>{children}</PageTransitionWrapper>
            <Navbar />
            <ServiceWorkerRegister />
          </EscenarioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
