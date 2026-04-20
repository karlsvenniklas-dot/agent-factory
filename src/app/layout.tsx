import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tipspromenaden Kinnared",
  description:
    "Digital tipspromenad för Kinnared - svara på frågor vid varje station",
};

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
    <html lang="sv" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-linen font-sans antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#2D5016",
              color: "white",
              borderRadius: "0.75rem",
              fontSize: "1rem",
              fontWeight: "500",
              boxShadow: "0 8px 24px 0 rgba(61, 43, 26, 0.18)",
            },
          }}
        />
      </body>
    </html>
  );
}
