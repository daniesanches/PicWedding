import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nuestra Boda - Captura Momentos",
  description: "Comparte tus fotos favoritas de nuestra boda",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
