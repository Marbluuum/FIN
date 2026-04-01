import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "FIN - Gestión Financiera",
  description: "App de gestión financiera empresarial con integraciones Stripe, Mercury y Binance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full bg-grid">
        <Sidebar />
        <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
