# Tipspromenaden Kinnared

Digital tipspromenad med QR-koder och magic link-inloggning.

## Vad är det här?

Deltagare skannar QR-koder vid fysiska stationer och svarar på frågor via mobilen. Systemet räknar poäng och visar ranking i slutet. Arrangörer administrerar omgångar och stationer via en admin-panel och skriver ut QR-ark för A4-papper.

## Tech stack

| Verktyg | Syfte |
|---------|-------|
| Next.js 14 App Router | Frontend + API routes |
| Supabase | Auth (magic link), Postgres, RLS |
| TypeScript | Typning |
| Tailwind CSS | Styling |
| Vercel | Deploy |

## Kom igång

### 1. Klona och installera

```bash
npm install
```

### 2. Miljövariabler

```bash
cp .env.local.example .env.local
```

Fyll i värdena från Supabase Dashboard > Project Settings > API.

### 3. Sätt upp databasen

Kör migrationen i Supabase Dashboard (SQL Editor) eller via CLI:

```bash
npx supabase db push
```

Migrationsfilen: `supabase/migrations/001_initial_schema.sql`

### 4. Starta lokalt

```bash
npm run dev
```

Öppna http://localhost:3000

## Projektstruktur

```
src/
  app/
    layout.tsx              # Root layout
    page.tsx                # Redirect baserat på auth
    login/page.tsx          # Magic link-formulär
    auth/callback/route.ts  # OAuth callback
    play/page.tsx           # Deltagarflöde (Fas 2)
    station/[token]/        # QR-scanning entry (Fas 2)
    leaderboard/page.tsx    # Ranking (Fas 2)
    admin/                  # Admin-panel (Fas 2)
  lib/
    supabase/
      client.ts             # Browser-klient
      server.ts             # Server-klient + admin-klient
      middleware.ts         # Session-refresh
    types.ts                # Alla databastyper
  middleware.ts             # Next.js auth-middleware
supabase/
  migrations/
    001_initial_schema.sql  # Komplett schema med RLS
```

## Roller

| Roll | Kan |
|------|-----|
| `participant` | Besvara frågor, se ranking |
| `editor` | Allt ovan + skapa/redigera omgångar |
| `owner` | Allt ovan + se allas svar, ändra roller |

Rollen sätts direkt i databasen: `UPDATE profiles SET role = 'owner' WHERE id = '...'`

## Supabase-schema i korthet

- **profiles** - Utökar auth.users, trigger skapar profil vid registrering
- **rounds** - En omgång, bara en kan vara aktiv åt gången (unique index)
- **stations** - 10 per omgång, varje har unik qr_token
- **questions** - En per station, 4 alternativ i JSONB
- **participant_answers** - UNIQUE(user_id, round_id, station_id) = ett försök

## Säkerhet

- RLS aktiverat på alla tabeller
- `correct_index` exponeras aldrig till deltagare - de använder `questions_public`-vyn
- Admin-klienten (service role) används bara server-side
- Magic link skickas till e-post - ingen lösenordshantering

## Beslut och trade-offs

**Varför view istället för RPC för frågorna?**
Vyn `questions_public` är enklare att queya med joins. RPC används för ranking och progress där aggregering behövs.

**Varför partiellt index för aktiv omgång?**
`CREATE UNIQUE INDEX ... WHERE is_active = true` är en enkel databasgaranti mot att råka aktivera flera omgångar. Alternativet hade varit applikationslogik som är svårare att lita på.

**Färgpalett (placeholder)**
Skogsgrön + höstgul + tegelröd som start. Linnéa (UX/UI) levererar slutlig palett - ändra i `tailwind.config.ts`.

## Fas 2 - nästa steg

1. Station-sida: visa fråga, ta emot svar, spara med `is_correct`-beräkning
2. Play-sida: lista stationer, visa progress
3. Leaderboard: anropa `get_ranking()` RPC
4. Admin: RoundEditor, skapa stationer, redigera frågor
5. QR-utskrift: generera A4-ark med `qrcode.react`
