import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

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
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
