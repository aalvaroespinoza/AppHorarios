import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomTabBar } from "@/components/BottomTabBar";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Optimización UI para parecer App Nativa
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "AppHorarios",
  description: "Tu recomendador de colectivos personal",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AppHorarios",
  },
  icons: {
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-black text-white">
        <main className="pb-24 min-h-screen">
          {children}
        </main>
        <BottomTabBar />
      </body>
    </html>
  );
}
