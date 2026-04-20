# Wireframes - Tipspromenaden i Kinnared

> ASCII-wireframes för MVP. Mobilfirst (375px). Använd tillsammans med `design-system.md` och `components.md`.

---

## 1. Landing / Login

```
╔══════════════════════════════════╗
║                                  ║
║         🌲                       ║
║   Tipspromenaden                 ║
║       i Kinnared                 ║
║                                  ║
║   Välkommen! Logga in med        ║
║   din e-post för att börja.      ║
║                                  ║
║   ┌────────────────────────┐     ║
║   │ din@epost.se           │     ║
║   └────────────────────────┘     ║
║                                  ║
║   ┌────────────────────────┐     ║
║   │  Skicka magisk länk    │     ║
║   └────────────────────────┘     ║
║                                  ║
║   Vi skickar en länk till din    ║
║   e-post. Inget lösenord behövs. ║
║                                  ║
╚══════════════════════════════════╝
```

**Komponenter:** Header (logo + titel), Input (email), Button (primary), Hjälptext.
**Beteende:** Vid submit → spinner i knappen → byter till "Kolla din e-post"-vy.

---

## 2. Check Email

```
╔══════════════════════════════════╗
║         📬                       ║
║                                  ║
║   Kolla din inkorg!              ║
║                                  ║
║   Vi har skickat en länk till    ║
║   din@epost.se                   ║
║                                  ║
║   Öppna mejlet och klicka på     ║
║   länken för att fortsätta.      ║
║                                  ║
║   ┌────────────────────────┐     ║
║   │  Skicka igen           │     ║
║   └────────────────────────┘     ║
║                                  ║
╚══════════════════════════════════╝
```

---

## 3. Play - Översikt (efter login)

```
╔══════════════════════════════════╗
║  🌲 Tipspromenaden    [Avatar]   ║
╠══════════════════════════════════╣
║                                  ║
║   Hej Anna! 👋                   ║
║                                  ║
║   Sommarrundan 2026              ║
║   ████████░░░░░░░░  6/10         ║
║                                  ║
║   Skanna nästa QR-kod för        ║
║   att fortsätta promenaden.      ║
║                                  ║
║   ┌────────────────────────┐     ║
║   │  📷 Öppna kamera       │     ║
║   └────────────────────────┘     ║
║                                  ║
║   Stationer du klarat:           ║
║   ✓ 1. Kyrkan                    ║
║   ✓ 2. Bruket                    ║
║   ✓ 3. Stationen                 ║
║   ✓ 4. Skolan                    ║
║   ✓ 5. Hembygdsgården            ║
║   ✓ 6. Idrottsplatsen            ║
║   ○ 7. (kommer snart)            ║
║                                  ║
║   [Se resultat så här långt →]   ║
║                                  ║
╚══════════════════════════════════╝
```

**Komponenter:** Header med avatar, ProgressBar, Button (primary), List med checkmarks, Länk till leaderboard.

---

## 4. Station - Fråga

```
╔══════════════════════════════════╗
║  ← 🌲 Tipspromenaden             ║
╠══════════════════════════════════╣
║                                  ║
║   Station 4 av 10                ║
║   ████░░░░░░░░░░░░               ║
║                                  ║
║   📍 Skolan                      ║
║                                  ║
║   ┌──────────────────────────┐   ║
║   │ Vilket år byggdes        │   ║
║   │ Kinnareds skola?         │   ║
║   └──────────────────────────┘   ║
║                                  ║
║   ┌──────────────────────────┐   ║
║   │ ○  1898                  │   ║
║   └──────────────────────────┘   ║
║   ┌──────────────────────────┐   ║
║   │ ○  1912                  │   ║
║   └──────────────────────────┘   ║
║   ┌──────────────────────────┐   ║
║   │ ○  1925                  │   ║
║   └──────────────────────────┘   ║
║   ┌──────────────────────────┐   ║
║   │ ○  1947                  │   ║
║   └──────────────────────────┘   ║
║                                  ║
║   ┌──────────────────────────┐   ║
║   │      Svara               │   ║
║   └──────────────────────────┘   ║
║                                  ║
╚══════════════════════════════════╝
```

**Komponenter:** ProgressBar, StationLabel, QuestionCard, AnswerOption (4 st), Button (primary, disabled tills val gjorts).

---

## 5. Svar-feedback (rätt)

```
╔══════════════════════════════════╗
║                                  ║
║         🎉                       ║
║      ✨ Bra jobbat! ✨           ║
║                                  ║
║   Rätt svar: 1912                ║
║                                  ║
║   Du har nu 4 av 4 rätt!         ║
║                                  ║
║   ┌──────────────────────────┐   ║
║   │  Fortsätt promenaden →   │   ║
║   └──────────────────────────┘   ║
║                                  ║
╚══════════════════════════════════╝
```

**Animation:** Konfetti faller ner i 1.5s. Stora ikoner och varm bakgrund (forest-pale).

## 6. Svar-feedback (fel)

```
╔══════════════════════════════════╗
║                                  ║
║         🍂                       ║
║   Nära - men inte riktigt!       ║
║                                  ║
║   Rätt svar: 1912                ║
║   Du svarade: 1925               ║
║                                  ║
║   Du har nu 3 av 4 rätt.         ║
║                                  ║
║   ┌──────────────────────────┐   ║
║   │  Fortsätt promenaden →   │   ║
║   └──────────────────────────┘   ║
║                                  ║
╚══════════════════════════════════╝
```

**Animation:** Mild skakning av kortet. Bakgrund: brick-pale.

---

## 7. Resultatsida (när alla 10 klara)

```
╔══════════════════════════════════╗
║  🌲 Tipspromenaden               ║
╠══════════════════════════════════╣
║                                  ║
║   🏆 Klart!                      ║
║                                  ║
║   Du fick 8 av 10 rätt!          ║
║                                  ║
║   Din placering: #4               ║
║                                  ║
║   ╔══════════════════════════╗   ║
║   ║   🥇 Gunnar      10/10  ║   ║
║   ║   🥈 Elsa         9/10  ║   ║
║   ║   🥉 Lars         9/10  ║   ║
║   ║   4. Anna (du)    8/10  ║   ║
║   ║   5. Margareta    7/10  ║   ║
║   ║   ...                    ║   ║
║   ╚══════════════════════════╝   ║
║                                  ║
║   [Visa hela ranking →]          ║
║                                  ║
║   Tack för att du gick!          ║
║   När en ny omgång publiceras    ║
║   kan du gå promenaden igen.     ║
║                                  ║
╚══════════════════════════════════╝
```

**Komponenter:** TrophyHeader, ScoreCard, RankingTable (highlight på egen rad), Footer-text.

---

## 8. Leaderboard (separat sida)

```
╔══════════════════════════════════╗
║  ← 🌲 Ranking                    ║
╠══════════════════════════════════╣
║                                  ║
║   Sommarrundan 2026              ║
║   28 deltagare                   ║
║                                  ║
║   ╔══════════════════════════╗   ║
║   ║ # | Namn       | Poäng  ║   ║
║   ╠══════════════════════════╣   ║
║   ║ 🥇 Gunnar      | 10/10  ║   ║
║   ║ 🥈 Elsa        |  9/10  ║   ║
║   ║ 🥉 Lars        |  9/10  ║   ║
║   ║ 4  Anna (du)   |  8/10  ║   ║
║   ║ 5  Margareta   |  7/10  ║   ║
║   ║ 6  Karl        |  7/10  ║   ║
║   ║ ...                       ║   ║
║   ╚══════════════════════════╝   ║
║                                  ║
╚══════════════════════════════════╝
```

---

## 9. Admin - Dashboard

```
╔══════════════════════════════════╗
║  🌲 Admin       [Logga ut]       ║
╠══════════════════════════════════╣
║                                  ║
║   Omgångar                       ║
║                                  ║
║   ┌──────────────────────────┐   ║
║   │ + Ny omgång              │   ║
║   └──────────────────────────┘   ║
║                                  ║
║   ╔══════════════════════════╗   ║
║   ║ Sommarrundan 2026        ║   ║
║   ║ ● Aktiv | 28 deltagare   ║   ║
║   ║ [Redigera] [QR-koder]    ║   ║
║   ╚══════════════════════════╝   ║
║                                  ║
║   ╔══════════════════════════╗   ║
║   ║ Vinterrundan 2025        ║   ║
║   ║ ○ Inaktiv | 42 deltagare ║   ║
║   ║ [Redigera] [QR-koder]    ║   ║
║   ╚══════════════════════════╝   ║
║                                  ║
╚══════════════════════════════════╝
```

---

## 10. Admin - Redigera omgång

```
╔══════════════════════════════════╗
║  ← Sommarrundan 2026             ║
╠══════════════════════════════════╣
║                                  ║
║   Namn:                          ║
║   ┌────────────────────────┐     ║
║   │ Sommarrundan 2026      │     ║
║   └────────────────────────┘     ║
║                                  ║
║   Beskrivning:                   ║
║   ┌────────────────────────┐     ║
║   │ ...                    │     ║
║   └────────────────────────┘     ║
║                                  ║
║   [✓] Aktiv omgång               ║
║                                  ║
║   ─────────────────────          ║
║                                  ║
║   Stationer (10)                 ║
║                                  ║
║   ╔════════════════════════╗     ║
║   ║ 1. Kyrkan              ║     ║
║   ║ "Vilket år byggdes..." ║     ║
║   ║ [Redigera] [Ta bort]   ║     ║
║   ╚════════════════════════╝     ║
║                                  ║
║   ╔════════════════════════╗     ║
║   ║ 2. Bruket              ║     ║
║   ║ "Vad tillverkades..."  ║     ║
║   ║ [Redigera] [Ta bort]   ║     ║
║   ╚════════════════════════╝     ║
║                                  ║
║   [+ Lägg till station]          ║
║                                  ║
║   [Skriv ut alla QR-koder]       ║
║                                  ║
╚══════════════════════════════════╝
```

---

## 11. Admin - Redigera fråga

```
╔══════════════════════════════════╗
║  ← Station 1: Kyrkan             ║
╠══════════════════════════════════╣
║                                  ║
║   Stationsnamn:                  ║
║   ┌────────────────────────┐     ║
║   │ Kyrkan                 │     ║
║   └────────────────────────┘     ║
║                                  ║
║   Frågetext:                     ║
║   ┌────────────────────────┐     ║
║   │ Vilket år byggdes      │     ║
║   │ Kinnareds kyrka?       │     ║
║   └────────────────────────┘     ║
║                                  ║
║   Alternativ (markera rätt):     ║
║   ┌────────────────────────┐     ║
║   │ ○ 1847                 │     ║
║   └────────────────────────┘     ║
║   ┌────────────────────────┐     ║
║   │ ● 1902  ✓ Rätt svar    │     ║
║   └────────────────────────┘     ║
║   ┌────────────────────────┐     ║
║   │ ○ 1925                 │     ║
║   └────────────────────────┘     ║
║   ┌────────────────────────┐     ║
║   │ ○ 1960                 │     ║
║   └────────────────────────┘     ║
║                                  ║
║   Poäng:  [ 1 ]                  ║
║                                  ║
║   [Spara]    [Avbryt]            ║
║                                  ║
╚══════════════════════════════════╝
```

---

## 12. Admin - QR-utskrift (A4-print view)

Print-vy. En A4 per station. Stora QR-koder centrerade.

```
┌──────────────────────────────────┐
│                                  │
│    🌲 Tipspromenaden             │
│       i Kinnared                 │
│                                  │
│    Station 1                     │
│    Kyrkan                        │
│                                  │
│                                  │
│      ┌──────────────────┐        │
│      │                  │        │
│      │    [QR-KOD]      │        │
│      │   ~ 200x200px    │        │
│      │                  │        │
│      └──────────────────┘        │
│                                  │
│                                  │
│    Skanna med kameran för        │
│    att svara på frågan!          │
│                                  │
│                                  │
│                                  │
└──────────────────────────────────┘
```

CSS: `@media print { @page { size: A4; margin: 2cm; } }`. En `page-break-after: always` mellan stationer.

---

## 13. Felmeddelanden / Edge cases

**QR-token ogiltig:**
```
"Hoppsan! Den här QR-koden verkar inte vara
giltig. Kontrollera att du skannat rätt
station, eller fråga arrangören."
```

**Redan svarat:**
```
"Du har redan svarat på den här frågan.
Gå vidare till nästa station!"
[Tillbaka till översikt]
```

**Inte inloggad:**
Redirect till `/login?next=/station/[token]` så användaren kommer tillbaka efter login.
