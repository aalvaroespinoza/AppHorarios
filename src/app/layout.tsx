import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import PageTransitionWrapper from "@/components/layout/PageTransitionWrapper";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { EscenarioProvider } from "@/context/EscenarioContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A0A0C",
};

export const metadata: Metadata = {
  title: "App Horarios - Terminal de Cursado",
  description: "Terminal industrial de horarios, cursado y colectivos para FCEFYN / UTN",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Horarios",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth dark">
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
      <body className={`${inter.className} ${inter.variable} ${ibmPlexMono.variable} font-sans bg-[#0A0A0C] text-[#F4F4F6] min-h-[100dvh] antialiased selection:bg-[#FF5500] selection:text-black`}>
        <ThemeProvider>
          <EscenarioProvider>
            <PageTransitionWrapper>
              {children}
            </PageTransitionWrapper>
            <Navbar />
            <ServiceWorkerRegister />
          </EscenarioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
