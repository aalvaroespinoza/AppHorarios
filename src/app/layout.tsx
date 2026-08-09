import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomTabBar from "@/components/layout/BottomTabBar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { EscenarioProvider } from "@/context/EscenarioContext";
import NotificationProvider from "@/components/NotificationProvider";

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
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-[100dvh] antialiased overflow-x-hidden`}>
        <EscenarioProvider>
          <main className="pb-[calc(5rem+env(safe-area-inset-bottom))] w-full max-w-[100vw] overflow-x-hidden">
            {children}
          </main>
          <BottomTabBar />
          <ServiceWorkerRegister />
          <NotificationProvider />
        </EscenarioProvider>
      </body>
    </html>
  );
}
