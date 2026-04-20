import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tipspromenaden Kinnared",
  description: "Digital tipspromenad för Kinnared - svara på frågor vid varje station",
};

// Separat viewport-export enligt Next.js 14-standarden
// Optimera för mobil - deltagare skannar QR med telefon
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
