# Komponentbibliotek - Tipspromenaden i Kinnared

> Version 1.0 | Skapad 2026-04-19
> Alla klasser ar Tailwind. Farger defineras i design-system.md.
> Min touch-target: 48x48px pa alla interaktiva element.

---

## Button

Fyra varianter. Alla har identisk hodd (min-h-[56px]) for konsekvent touch-target.
Fokusstil: aldrig `outline: none` utan ersattning.

### Primary

```
Anvandning: Huvudaction pa varje skarm. Max en per skarm.
Exempel: "Svara", "Logga in", "Nasta station"

Klasser (normal):
  inline-flex items-center justify-center gap-2
  min-h-[56px] px-8 rounded-xl
  bg-forest-600 text-white
  text-lg font-semibold
  shadow-button
  transition-all duration-150
  hover:bg-forest-700 hover:shadow-button-hover
  active:scale-95 active:shadow-none
  focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2
  disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100

Bredfull (mobil, rekommenderas pa de flesta skarmar):
  + w-full

Aria-attribut:
  aria-label="[Beskrivande text pa svenska]"  (om knappen bara har ikon)
  aria-busy="true"  (under laddning)
  aria-disabled="true"  (disabled state)
```

### Secondary

```
Anvandning: Alternativ action, navigation.
Exempel: "Tillbaka", "Avbryt", "Hoppa over"

Klasser:
  inline-flex items-center justify-center gap-2
  min-h-[56px] px-8 rounded-xl
  bg-linen border-2 border-forest-600 text-forest-600
  text-lg font-semibold
  transition-all duration-150
  hover:bg-forest-pale hover:border-forest-700
  active:scale-95
  focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2
  disabled:opacity-40 disabled:cursor-not-allowed
```

### Ghost

```
Anvandning: Terstlare action, hjalp-lankar, "Visa mer"
Exempel: "Glom det, jag har redan svarat", "Hjalp"

Klasser:
  inline-flex items-center justify-center gap-2
  min-h-[48px] px-6 rounded-lg
  text-forest-600 text-base font-medium
  underline underline-offset-2
  transition-all duration-150
  hover:text-forest-700 hover:bg-forest-pale
  active:scale-95
  focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2
```

### Danger

```
Anvandning: Destruktiva actions. Alltid med bekraftelsedialog.
Exempel: "Ta bort fraga", "Radera omgang"

Klasser:
  inline-flex items-center justify-center gap-2
  min-h-[56px] px-8 rounded-xl
  bg-brick-600 text-white
  text-lg font-semibold
  transition-all duration-150
  hover:bg-brick-700
  active:scale-95
  focus-visible:ring-4 focus-visible:ring-brick-300 focus-visible:ring-offset-2
  disabled:opacity-40 disabled:cursor-not-allowed

Ikon: Trash2 (20px), aria-hidden="true"
```

### Icon Button

```
Anvandning: Ikon utan text. Alltid med synlig tooltip/aria-label.
Min storlek: 48x48px.

Klasser:
  inline-flex items-center justify-center
  w-12 h-12 rounded-xl
  text-bark
  transition-all duration-150
  hover:bg-linen-dark hover:text-soil
  active:scale-95
  focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2

Aria: aria-label="[Action pa svenska]" (obligatorisk!)
```

### Loading-state (delade bland alla varianter)

```jsx
// I Primary/Secondary, ersatt text med:
<Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
<span>Laddar...</span>
// + aria-busy="true" pa button-elementet
```

---

## Input

### Text / Email

```
Anvandning: E-postinmatning (magic link), namn, sokfalt.

Wrapper:
  flex flex-col gap-2

Label:
  text-base font-semibold text-soil
  (aldrig `display: none` - anvand sr-only vid behov)

Input-element:
  w-full min-h-[56px] px-4 rounded-xl
  bg-white border-2 border-sand text-soil text-lg
  placeholder:text-bark/60
  transition-colors duration-150
  hover:border-forest-300
  focus:outline-none focus:border-forest-600 focus:ring-4
    focus:ring-forest-200 focus:ring-offset-0
  disabled:bg-linen-dark disabled:cursor-not-allowed
  aria-invalid:border-brick-600 aria-invalid:ring-brick-200

Hjalp-/feltext under input:
  text-sm text-bark  (hjalp)
  text-sm text-brick-700 font-medium  (fel)
  id="[input-id]-description"  (kopplas med aria-describedby)

Fullstandigt exempel:
  <div className="flex flex-col gap-2">
    <label htmlFor="email" className="text-base font-semibold text-soil">
      Din e-postadress
    </label>
    <input
      id="email"
      type="email"
      autoComplete="email"
      aria-describedby="email-hint"
      className="w-full min-h-[56px] px-4 rounded-xl bg-white border-2
                 border-sand text-soil text-lg placeholder:text-bark/60
                 hover:border-forest-300 focus:outline-none
                 focus:border-forest-600 focus:ring-4 focus:ring-forest-200"
      placeholder="namn@exempel.se"
    />
    <p id="email-hint" className="text-sm text-bark">
      Vi skickar en inloggningslank till denna adress.
    </p>
  </div>
```

---

## Card

```
Anvandning: Fragor, stationsinformation, resultatrutor.

Standard:
  bg-white rounded-2xl shadow-card p-6
  border border-linen-dark

Interaktivt kort (klickbart):
  + cursor-pointer
  + hover:shadow-card-hover hover:border-forest-200
  + transition-all duration-200
  + focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2

Celebration-kort (ratt svar):
  bg-forest-pale border-2 border-forest-400 rounded-2xl shadow-card p-6
  animate-pop

Error-kort (fel svar):
  bg-brick-pale border-2 border-brick-400 rounded-2xl shadow-card p-6
  animate-shake
```

---

## AnswerOption

Det viktigaste interaktiva elementet i hela appen. Stor touch-target, tydlig state-hantering.

### States

```
DEFAULT (ej vald):
  w-full min-h-[64px] px-5 py-4 rounded-2xl
  bg-white border-2 border-linen-dark text-soil text-lg font-medium
  text-left flex items-center gap-3
  shadow-answer
  transition-all duration-200
  hover:border-forest-400 hover:bg-forest-pale hover:shadow-answer-selected
  active:scale-[0.98]
  focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2
  cursor-pointer

SELECTED (vald av anvandaren, innan svar):
  + border-forest-600 bg-forest-pale shadow-answer-selected
  + ring-2 ring-forest-400

CORRECT (ratt svar, visas efter inlamma):
  + border-forest-600 bg-forest-pale
  + [Check-ikon i hojra kant, farg: forest-600]
  + animate-pop

INCORRECT (fel svar, anvandaren valde fel):
  + border-brick-600 bg-brick-pale
  + [X-ikon i hojra kant, farg: brick-600]
  + animate-shake

CORRECT-HIGHLIGHT (visar ratt svar nar anvandaren valde fel):
  + border-forest-400 bg-forest-pale/50
  + [Check-ikon, farg: forest-400, opacity-70]

DISABLED (efter inlamma, alla alternativ):
  + opacity-60 cursor-not-allowed pointer-events-none

Bokstav-prefix (A, B, C, D):
  w-8 h-8 rounded-full flex-shrink-0
  bg-linen-dark text-bark text-sm font-semibold
  flex items-center justify-center
  (Byts till check/X-ikon i correct/incorrect-state)
```

### JSX-mall

```jsx
<button
  role="radio"
  aria-checked={isSelected}
  onClick={() => onSelect(option)}
  disabled={hasAnswered}
  className={cn(
    "w-full min-h-[64px] px-5 py-4 rounded-2xl",
    "bg-white border-2 border-linen-dark text-soil text-lg font-medium",
    "text-left flex items-center gap-3 shadow-answer",
    "transition-all duration-200",
    "hover:border-forest-400 hover:bg-forest-pale",
    "active:scale-[0.98]",
    "focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2",
    isSelected && !hasAnswered && "border-forest-600 bg-forest-pale shadow-answer-selected",
    isCorrect && hasAnswered && "border-forest-600 bg-forest-pale animate-pop",
    isSelected && !isCorrect && hasAnswered && "border-brick-600 bg-brick-pale animate-shake",
    hasAnswered && "cursor-not-allowed"
  )}
>
  <span className={cn(
    "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
    "text-sm font-semibold",
    !hasAnswered && "bg-linen-dark text-bark",
    isCorrect && hasAnswered && "bg-forest-600 text-white",
    isSelected && !isCorrect && hasAnswered && "bg-brick-600 text-white",
  )}>
    {hasAnswered && isCorrect
      ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
      : hasAnswered && isSelected
      ? <XCircle className="w-5 h-5" aria-hidden="true" />
      : letter /* "A", "B", "C", "D" */
    }
  </span>
  <span>{option.text}</span>
</button>
```

---

## ProgressBar (Kinnared-stil med trad-ikoner)

Visar framsteg som vaxtande tradar - en barrtrad per avklarad station.

```
Wrapper:
  flex flex-col gap-2 w-full

Label (sr-only):
  "Station [current] av [total] avklarad"

Tradbar:
  flex items-end gap-1 justify-center h-10

Varje trad (10 st totalt):
  flex flex-col items-center justify-end

Tradikon (SVG, 20x24px):
  - Avklarad:  farg forest-600, opacity-100, animate-tree-grow (nar ny station klaras)
  - Aktiv:     farg field-500, opacity-100, svagt pulserar
  - Kommande:  farg sand, opacity-50

Siffertext under baren:
  text-sm text-bark text-center
  "3 av 10 stationer"
```

### SVG-tradikon

```jsx
// TreeIcon.tsx - Enkel stiliserad barrtrad
function TreeIcon({ state }: { state: 'done' | 'active' | 'upcoming' }) {
  const colors = {
    done:     '#2D5016',
    active:   '#D4A017',
    upcoming: '#C4B49E',
  }
  return (
    <svg
      width="20" height="24" viewBox="0 0 20 24"
      aria-hidden="true"
      className={cn(
        state === 'done' && 'animate-tree-grow',
        state === 'upcoming' && 'opacity-50'
      )}
    >
      {/* Stam */}
      <rect x="8" y="18" width="4" height="6" fill={colors[state]} rx="1" />
      {/* Nedre lager */}
      <polygon points="10,4 2,18 18,18" fill={colors[state]} />
      {/* Mitten-lager */}
      <polygon points="10,1 3,13 17,13" fill={colors[state]} />
      {/* Topp */}
      <polygon points="10,0 5,8 15,8" fill={colors[state]} />
    </svg>
  )
}
```

---

## Toast / Notification

Visas overst pa skarmen (safe area-margin), auto-forsvinner efter 4s.
Aldrig mer an 1 toast atat gangen.

```
Container (fixed, full-width):
  fixed top-0 left-0 right-0 z-50
  px-4 pt-safe-top  (eller pt-4 om safe-area ej stods)
  pointer-events-none
  flex flex-col gap-2

Toast-kort:
  pointer-events-auto
  w-full max-w-sm mx-auto
  min-h-[56px] px-4 py-3 rounded-xl
  flex items-center gap-3
  shadow-toast
  animate-slide-up
  text-base font-medium

SUCCESS:   bg-forest-600 text-white
ERROR:     bg-brick-600 text-white
INFO:      bg-soil text-white
WARNING:   bg-field-500 text-soil

Ikon (vanstersida): 20px, aria-hidden
Stang-knapp (hogersida):
  min 44x44px touch-area (negativ margin)
  aria-label="Stang notis"
```

---

## Modal

```
Overlay:
  fixed inset-0 z-40
  bg-soil/60 backdrop-blur-sm
  flex items-end sm:items-center justify-center
  p-4 sm:p-8
  animate-fade-in

Panel:
  w-full max-w-md
  bg-white rounded-t-3xl sm:rounded-2xl
  shadow-modal
  animate-slide-up
  max-h-[90vh] overflow-y-auto
  p-6

Header:
  flex items-center justify-between mb-4
  Rubrik: text-2xl font-display font-bold text-soil
  Stang-knapp: Icon Button (X), aria-label="Stang dialog"

Body:
  text-base text-bark leading-relaxed

Footer:
  flex gap-3 mt-6
  (Primary + Secondary knapp, eller bara Primary)

Fokus-fanga:
  Anvand React focus-trap-library eller inbyggd dialog-element.
  Forsta fokuserbara element: stang-knappen.
  Sista fokuserbara element: bekraftelse-knappen.
  ESC stanger modalen.

Aria:
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"  (om tillampligt)
```

---

## Badge

```
Standard (poang):
  inline-flex items-center gap-1
  px-3 py-1 rounded-full
  text-sm font-semibold
  bg-field-pale border border-field-500 text-field-700

Placering (#1, #2, #3):
  Guld:   bg-field-300 border-field-500 text-field-800
  Silver: bg-sand/30 border-sand text-bark
  Brons:  bg-brick-pale border-brick-300 text-brick-700

Station-nummer:
  w-8 h-8 rounded-full
  bg-forest-600 text-white text-sm font-bold
  flex items-center justify-center

Ny! (ny station tillganglig):
  inline-flex items-center gap-1
  px-2 py-0.5 rounded-full
  bg-brick-600 text-white text-xs font-bold
  animate-pop
```

---

## Avatar

Enkla SVG-symboler fran Kinnareds natur. Anvandaren valjer en vid registrering.

```
Alternativ:
  tall     - Stiliserad tall (forest-600)
  korp     - Korp i profil (soil)
  ekorre   - Ekorre med svans (brick-500)
  rav      - Rav framifran (field-500)
  elg      - Elgsilhuett (forest-700) [bonusalternativ]
  bla      - Bla blomma, blaklocka (forest-400 + field-300)

Avatar-cirkel:
  w-12 h-12 rounded-full  (liten, lista)
  w-16 h-16 rounded-full  (medium, ranglistekort)
  w-24 h-24 rounded-full  (stor, profilsida)
  bg-linen border-2 border-linen-dark
  flex items-center justify-center
  overflow-hidden

Platshallare (ej vald):
  bg-linen-dark
  Ikon: User fran Lucide (grautad)
```

---

## Header

```
App-header (deltagare):
  Sticky top-0 z-30
  bg-white/95 backdrop-blur-md
  border-b border-linen-dark
  safe-area-padding-top

  Innehall (h-14, flex items-center justify-between px-4):
    Vanster: KyrktornsQR-logotyp (32px) + "Tipspromenaden" text-sm font-semibold text-forest-700
    Hoger:   Avatar-liten (om inloggad) ELLER "Logga in"-ghost-knapp

Admin-header:
  Sticky top-0 z-30
  bg-forest-700 text-white
  safe-area-padding-top

  Innehall (h-16, flex items-center justify-between px-6):
    Vanster: ShieldCheck-ikon + "Admin" text-lg font-bold
    Hoger:   LogOut-knapp (Icon Button, aria-label="Logga ut")
```

---

## Footer (deltagare)

Används inte som traditionell tab-bar. Istället: kontextuell footer pa stationsskarmar.

```
Kontextuell footer:
  fixed bottom-0 left-0 right-0 z-20
  bg-white border-t border-linen-dark
  px-4 py-3 safe-area-padding-bottom

  Innehall: Primary Button (bred, "Nasta station" / "Se resultat")

Safe area (iPhone notch/dynamic island):
  padding-bottom: env(safe-area-inset-bottom)
  Tailwind: pb-[env(safe-area-inset-bottom)] (eller plugin)
```

---

## Rankinglista-komponent

```
Podium (topp 3):
  flex items-end justify-center gap-4 py-6

  Podium-pelare:
    flex flex-col items-center gap-2

    Avatar: w-16 h-16 rounded-full + placerings-badge
    Namn: text-sm font-semibold text-soil (max 12 tecken, truncate)
    Poang: text-xs text-bark

    Pelare-block:
      rounded-t-lg bg-gradient (forest-pale -> forest-100)
      #1: h-20 bg-field-300 border-2 border-field-500
      #2: h-14 bg-sand/40 border-2 border-sand
      #3: h-10 bg-brick-pale border-2 border-brick-200

Lista (plats 4+):
  flex flex-col gap-2

  Listrad:
    flex items-center gap-3 p-3 rounded-xl bg-white border border-linen-dark
    shadow-card

    Placeringssiffra: text-lg font-bold text-bark w-8 text-center
    Avatar: w-10 h-10 rounded-full
    Namn: text-base font-medium text-soil flex-1
    Poang: text-sm font-semibold text-forest-600

  Markerad (inloggad anvandare):
    border-forest-400 bg-forest-pale
    "Du" badge: text-xs bg-forest-600 text-white px-2 rounded-full
```

---

## Komponent-checklista for Sara

For varje komponent, verifiera:
- [ ] min touch-target: 48x48px (interaktiva element)
- [ ] Fokusstil synlig (ring-4 med offset)
- [ ] aria-label pa ikonknappar
- [ ] disabled-state hanterar pointer-events
- [ ] Animations respectar prefers-reduced-motion
- [ ] Kontrast godkand (se accessibility.md)
- [ ] Funkar pa 375px bredd utan horisontell scroll
