# Spotify Playlist Quiz

Ett realtids-multiplayer-quiz där värden spelar snuttar från en Spotify-spellista och spelarna gissar låttiteln från sina egna enheter. Bygger på Next.js 14, PartyKit för realtidssynk och Spotify Web Playback SDK.

## Funktioner (MVP)

- **Värd** loggar in med Spotify, väljer spellista och hostar ett rum med 4-tecken-kod.
- **Spelare** ansluter med rumkoden från sin telefon — inget Spotify-konto krävs.
- **Lag eller solo** — ange ett lagnamn vid join, eller hoppa över för individuell tävling.
- **Realtidssynk** via PartyKit: gissningar, poäng och rundor uppdateras direkt på alla skärmar.
- **Värden styr tempot**: spela nästa låt, visa svar, dela ut 0/1/2 poäng per gissning.
- **Auto-paus** efter 15 sekunders snutt.

## Setup

### 1. Skapa Spotify-app

Gå till [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) och skapa en ny app:

- **Redirect URI**: `http://localhost:3000/auth/callback`
- Spara ditt **Client ID**.

### 2. Konfigurera miljövariabler

```bash
cp .env.example .env.local
```

Fyll i `.env.local`:

```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=...
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_PARTYKIT_HOST=127.0.0.1:1999
NEXT_PUBLIC_DEFAULT_PLAYLIST_ID=1x6HoQHp7B6jUIqA3zSzgC
```

### 3. Installera och starta

```bash
npm install
npm run dev:all   # startar både Next.js (3000) och PartyKit (1999)
```

Eller starta dem separat i två terminaler:

```bash
npm run dev:party   # PartyKit på port 1999
npm run dev         # Next.js på port 3000
```

Öppna `http://localhost:3000`.

## Spelflöde

1. **Värd** klickar *Starta nytt rum* → loggar in med Spotify Premium → laddar spellistan.
2. Värd delar **rumkoden** (visas i stort i UI) med spelarna.
3. **Spelare** öppnar `/play/<KOD>` på sina telefoner, anger namn och eventuellt lagnamn.
4. Värd klickar *Spela nästa låt* → 15-sekunders snutt spelas på värdens enhet.
5. Spelare skriver in sin gissning → syns direkt i värdens vy.
6. Värd klickar *Visa svar* → låttitel + artist avslöjas på alla skärmar.
7. Värd dispatchar 0/1/2 poäng till varje gissning. Lagmedlemmar delar poäng.
8. *Nästa runda* → upprepa.

## Krav

- **Spotify Premium** på värdens enhet (Web Playback SDK krävs).
- Modern webbläsare (Chrome, Edge, Firefox, Safari) som stödjer Encrypted Media Extensions.

## Tech stack

- Next.js 14 App Router · TypeScript · Tailwind CSS
- PartyKit (Cloudflare Workers) för realtidsrum
- Spotify Web API (PKCE-flöde) + Web Playback SDK
- Vercel-redo deployment

## Deploy

- **Webbappen**: `vercel --prod`
- **PartyKit-server**: `npx partykit deploy`
- Uppdatera `NEXT_PUBLIC_PARTYKIT_HOST` till din partykit.dev-URL i Vercel-miljövariablerna och `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` till din produktions-URL.

## Begränsningar i MVP

- Värden bedömer gissningar manuellt (ingen automatisk fuzzy-matchning än).
- Ingen timer på rundorna — värden styr tempot.
- Ingen autentisering på rum-koderna (vem som helst kan joina med koden).
- PartyKit-state är in-memory — om servern dör nollställs rummet.

## Vidare idéer

- Auto-bedömning av gissningar via Levenshtein/fuzzy match.
- Timer per runda + auto-reveal.
- Persistens via Durable Objects.
- Fler quiz-format: gissa artist, gissa år, intro-quiz med buzz-in.
- Lobby-musik mellan rundor.
