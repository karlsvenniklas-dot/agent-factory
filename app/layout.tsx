import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spotify Playlist Quiz",
  description: "Tävla i lag eller ensam — gissa låten från en Spotify-spellista.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className="font-sans antialiased">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-8">
          <header className="mb-8 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="inline-block h-3 w-3 rounded-full bg-spotify-green" />
              Spotify Playlist Quiz
            </a>
            <span className="text-xs text-white/40">MVP · prototyp</span>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-12 text-center text-xs text-white/30">
            Byggt av Agent Factory · Värden behöver Spotify Premium
          </footer>
        </div>
      </body>
    </html>
  );
}
