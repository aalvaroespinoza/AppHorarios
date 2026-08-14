import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import PageTransitionWrapper from "@/components/layout/PageTransitionWrapper";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { EscenarioProvider } from "@/context/EscenarioContext";
import NotificationProvider from "@/components/NotificationProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { CommandPalette } from "@/components/CommandPalette";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "App Horarios",
  description: "Horarios y recomendaciones de colectivos para FCEFYN",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Horarios",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('app_theme') || 'dark';
                  var isDark = true;
                  if (theme === 'light') {
                    isDark = false;
                  } else if (theme === 'auto') {
                    var cacheRaw = localStorage.getItem('weather_cache_cordoba');
                    if (cacheRaw) {
                      var w = JSON.parse(cacheRaw);
                      if (w && w.data && w.data.daily && w.data.daily.length > 0) {
                        var now = new Date();
                        var sunrise = new Date(w.data.daily[0].sunrise);
                        var sunset = new Date(w.data.daily[0].sunset);
                        isDark = now < sunrise || now >= sunset;
                      }
                    }
                  }
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 text-neutral-900 dark:bg-black dark:text-white min-h-[100dvh] antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <EscenarioProvider>
            <PageTransitionWrapper>
              {children}
            </PageTransitionWrapper>
            <Navbar />
            <ServiceWorkerRegister />
            <NotificationProvider />
            <CommandPalette />
          </EscenarioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
