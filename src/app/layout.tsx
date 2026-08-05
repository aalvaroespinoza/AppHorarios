import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomTabBar from "@/components/layout/BottomTabBar";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen antialiased`}>
        {/* pb-24 asegura que la BottomTabBar no tape el contenido del final */}
        <main className="pb-24">
          {children}
        </main>
        <BottomTabBar />
      </body>
    </html>
  );
}
