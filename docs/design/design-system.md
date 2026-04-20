# Designsystem - Tipspromenaden i Kinnared

> Version 1.0 | Skapad 2026-04-19
> Målgrupp: Sara (fullstack-dev) + framtida designarbete
> Princip: Kinnared ar huvudpersonen, inte bakgrunden.

---

## Fargpalett

Inspirerad av hallandskt landskap: djup barrskog, hostgula akrar, rott tegel fran brukets byggnader, och linnevit himmel over slatten.

### Primara farger

```
Forest (Skog)         #2D5016    Djup barrskog, primara actions
Forest-light          #4A7C2E    Ljusare skog, success-states
Forest-pale           #EBF2E5    Mycket ljus skog, hover-backgrounds

Field (Aker)          #D4A017    Hostgult, sekundara highlights
Field-light           #F2D97A    Ljus aker, badges, accent
Field-pale            #FBF5E0    Mycket ljus aker, backgrounds

Brick (Tegel)         #A0412A    Rott tegel, error/danger
Brick-light           #C4614A    Ljusare tegel, hover pa danger
Brick-pale            #F8EAE7    Mycket ljust tegel, error-backgrounds
```

### Neutrala farger

```
Linen                 #F5EFE6    Linne/smor - huvud-background
Linen-dark            #E8DDD0    Kortbakgrund, separatorer
Sand                  #C4B49E    Borders, disabled states
Bark                  #7A6552    Sekundar text, ikontext
Soil                  #3D2B1A    Primartextfarg (mojliggr hog kontrast)
```

### Semantiska farger

```
Success               #4A7C2E    Ratt svar, bekraftelse
Success-bg            #EBF2E5    Bakgrund vid success
Warning               #D4A017    Varningar, observera
Warning-bg            #FBF5E0    Bakgrund vid warning
Error                 #8B2635    Fel svar, validering
Error-bg              #F8EAE7    Bakgrund vid error
Info                  #2D5016    Informativa meddelanden
```

### Tailwind config (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#2D5016',
          light:   '#4A7C2E',
          pale:    '#EBF2E5',
          50:      '#F0F5EB',
          100:     '#D8EBCA',
          200:     '#B3D494',
          300:     '#8DBE5E',
          400:     '#6AA83A',
          500:     '#4A7C2E',
          600:     '#2D5016',
          700:     '#1E3A0D',
          800:     '#102308',
          900:     '#060D03',
        },
        field: {
          DEFAULT: '#D4A017',
          light:   '#F2D97A',
          pale:    '#FBF5E0',
          50:      '#FEFBF0',
          100:     '#FBF5E0',
          200:     '#F5E9B8',
          300:     '#F2D97A',
          400:     '#ECC840',
          500:     '#D4A017',
          600:     '#A87C0F',
          700:     '#7A5A0A',
          800:     '#4E3906',
          900:     '#261C02',
        },
        brick: {
          DEFAULT: '#A0412A',
          light:   '#C4614A',
          pale:    '#F8EAE7',
          50:      '#FDF4F2',
          100:     '#F8EAE7',
          200:     '#F0C9C2',
          300:     '#E4A090',
          400:     '#D4735E',
          500:     '#C4614A',
          600:     '#A0412A',
          700:     '#7A2E1A',
          800:     '#521D0F',
          900:     '#2A0D06',
        },
        linen: {
          DEFAULT: '#F5EFE6',
          dark:    '#E8DDD0',
        },
        sand:  '#C4B49E',
        bark:  '#7A6552',
        soil:  '#3D2B1A',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'], // For headings with character
      },

      fontSize: {
        // Rem-baserad for systemets textstorlek
        'xs':   ['0.75rem',  { lineHeight: '1.125rem' }], // 12px
        'sm':   ['0.875rem', { lineHeight: '1.313rem' }], // 14px
        'base': ['1rem',     { lineHeight: '1.5rem'   }], // 16px
        'lg':   ['1.125rem', { lineHeight: '1.688rem' }], // 18px
        'xl':   ['1.25rem',  { lineHeight: '1.875rem' }], // 20px
        '2xl':  ['1.5rem',   { lineHeight: '2rem'     }], // 24px
        '3xl':  ['1.875rem', { lineHeight: '2.375rem' }], // 30px
        '4xl':  ['2.25rem',  { lineHeight: '2.75rem'  }], // 36px
      },

      borderRadius: {
        'sm':   '0.375rem',  //  6px - inputs, tags
        'md':   '0.625rem',  // 10px - cards, buttons
        'lg':   '1rem',      // 16px - modals, large cards
        'xl':   '1.5rem',    // 24px - answer options (mjuka)
        '2xl':  '2rem',      // 32px - celebration cards
        'full': '9999px',    // Pills, avatarer
      },

      boxShadow: {
        'card':        '0 2px 8px 0 rgba(61, 43, 26, 0.08)',
        'card-hover':  '0 4px 16px 0 rgba(61, 43, 26, 0.14)',
        'button':      '0 2px 4px 0 rgba(45, 80, 22, 0.20)',
        'button-hover':'0 4px 8px 0 rgba(45, 80, 22, 0.28)',
        'answer':      '0 2px 6px 0 rgba(61, 43, 26, 0.10)',
        'answer-selected': '0 0 0 3px #4A7C2E',
        'toast':       '0 8px 24px 0 rgba(61, 43, 26, 0.18)',
        'modal':       '0 16px 48px 0 rgba(61, 43, 26, 0.24)',
      },

      animation: {
        'confetti':     'confetti 0.8s ease-out',
        'leaf-fall':    'leaf-fall 1.2s ease-in-out',
        'shake':        'shake 0.4s ease-in-out',
        'pop':          'pop 0.25s ease-out',
        'fanfare':      'fanfare 0.6s ease-out',
        'draw-check':   'draw-check 0.5s ease-out forwards',
        'slide-up':     'slide-up 0.3s ease-out',
        'fade-in':      'fade-in 0.25s ease-out',
        'progress-fill':'progress-fill 0.5s ease-out',
        'tree-grow':    'tree-grow 0.4s ease-out forwards',
      },

      keyframes: {
        confetti: {
          '0%':   { opacity: '0', transform: 'scale(0.5) rotate(-10deg)' },
          '60%':  { opacity: '1', transform: 'scale(1.1) rotate(5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        'leaf-fall': {
          '0%':   { opacity: '0', transform: 'translateY(-20px) rotate(-30deg)' },
          '50%':  { opacity: '1', transform: 'translateY(10px) rotate(10deg)' },
          '100%': { opacity: '0', transform: 'translateY(40px) rotate(30deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
        pop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        fanfare: {
          '0%':   { opacity: '0', transform: 'scale(0.6) translateY(8px)' },
          '70%':  { opacity: '1', transform: 'scale(1.05) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'draw-check': {
          '0%':   { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'progress-fill': {
          '0%':   { width: 'var(--progress-from)' },
          '100%': { width: 'var(--progress-to)' },
        },
        'tree-grow': {
          '0%':   { transform: 'scaleY(0)', transformOrigin: 'bottom center' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom center' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Typografi

### Skala

```
Display / Titel (Fraunces, serif)
  display-lg   2.25rem / 700   Ranglistans vinnare, stora celebrations
  display-md   1.875rem / 700  Sidtitlar, fragesidor
  display-sm   1.5rem / 600    Kortrubriker, stationens namn

Body (Inter, sans-serif)
  body-lg      1.125rem / 400  Fragor, langre loptexer
  body-md      1rem / 400      Standard brodtext
  body-sm      0.875rem / 400  Forklaringstexter, timestamps

Label / UI (Inter, sans-serif)
  label-lg     1rem / 600      Knappar, viktiga labels
  label-md     0.875rem / 600  Navigering, flikar
  label-sm     0.75rem / 500   Badges, metadata

Mikrocopy (Inter, sans-serif)
  micro        0.75rem / 400   Hjalptexer, WCAG-notiser
```

### Typografiregler

- Aldrig under 0.75rem (12px) for laspara text
- Radavstand minimum 1.4x teckenstorleken
- Maximalt 70 tecken per rad pa mobil (undvik for lange rader)
- Bold (700) reserverat for fragor och namntitlar
- Kursiv (italic) for fragornas ledtradstexter
- Fraunces ger gammaldags karaktar utan att vara svarlast

---

## Spacing-skala

Baserat pa 4px-grid (0.25rem). Anvand dessa klasser konsekvent.

```
4px   / 0.25rem   space-1    Internt avstand i ikoner
8px   / 0.5rem    space-2    Avstand mellan ikon + text
12px  / 0.75rem   space-3    Kompakt padding, badges
16px  / 1rem      space-4    Standard padding i knappar
20px  / 1.25rem   space-5    Avstand mellan falt i formuler
24px  / 1.5rem    space-6    Sektionsavstand, padding i kort
32px  / 2rem      space-8    Avstand mellan huvudsektioner
40px  / 2.5rem    space-10   Stor luft over/under hander
48px  / 3rem      space-12   Min touch-target-hodd (tillganglighet)
64px  / 4rem      space-16   Sidmarginaler pa desktop
```

---

## Ikoner (Lucide React)

Standardstorlek: 24px (w-6 h-6). Storst pa knappar: 20px. Smast: 16px (aldrig under).
Alla ikoner ska ha `aria-hidden="true"` + syskontext i `sr-only` span.

### Ikonkarta

```
USE CASE                  LUCIDE-IKON           NOTERING
--------------------------------------------------------------
QR-skanniing             QrCode                 Triggar scannern
Station / plats           MapPin                 Stationsmarkering
Fraga / quiz             MessageCircleQuestion  Fragebubblor
Ratt svar                CheckCircle2           Success, gront
Fel svar                 XCircle                Error, rott
Tidtagning               Clock3                 Om timeout finns
Ranking / topplista      Trophy                 Podieskarm
Poang                    Star                   Badgepoang
Progression              TreePine               Vaxter med progress (se komponent)
Nasta station            ChevronRight           Navigering frama
Tillbaka                 ChevronLeft            Navigering bakat
Hem                      Home                   Till startskarm
Admin / inloggning       ShieldCheck            Admin-login
Hantera omgangar         CalendarDays           Omgangsvy
Lagg till               Plus                   Skapa ny
Redigera                Pencil                 Redigera befintlig
Ta bort                 Trash2                 Radera (danger-farg)
QR-utskrift             Printer                Utskriftsvy
Deltagarlista           Users                  Deltagare
E-post / magic link      Mail                   Inloggningsflode
Kopiera lank            Copy                   Kopiera URL
Logga ut                LogOut                 Utloggning
Meny                    Menu                   Hamburgarmeny
Stang                   X                      Stang modal
Info                    Info                   Hjalp-tooltip
Notis                   Bell                   Systemnotis
Laddning / spinner      Loader2                Med spin-klass
```

### Lokala designikoner (SVG, ej Lucide)

Dessa ritar Sara/illustrator som enkla SVG-komponenter:

```
KyrktornsQR   - Stiliserad kyrktornssilhuett inuti QR-rutmonster
                Anvands som app-logotyp och splash-ikon
                Storlek: 64x64px, farg: forest-600

TradsProgressikon - Liten barrtrad (tall/gran) som vaxter fran botten
                   Anvands i progressbaren (se ProgressBar-komponent)
                   10 trad = 10 stationer, en trad per avklarad station

HostlovAnimation - Tre-fyra ostlav-SVGs med olika rotation
                   Animeras med leaf-fall keyframe vid ratt svar
                   Farger: field-400, brick-400, forest-300
```

---

## Motion / Animationsprinciper

### Regler

1. **Syftesdriven** - Varje animation kommunicerar ett tillstand. Inget dekoration utan funktion.
2. **Kort** - Max 400ms for interaktionsfeedback. Celebrations max 1200ms.
3. **Avbrytbar** - Animationer stoppar om anvandaren interagerar.
4. **Respectful** - Folj `prefers-reduced-motion`. All animation wrappar i CSS-media query.

### prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animationskarta

```
TILLSTAND              ANIMATION          DURATION  EASING
--------------------------------------------------------------
Ratt svar              confetti + pop     800ms     ease-out
Fel svar               shake              400ms     ease-in-out
Ny topplacering        fanfare            600ms     ease-out
Station avklarad       draw-check         500ms     ease-out (SVG stroke)
Sida laddas            slide-up + fade-in 300ms     ease-out
Toast dyker upp        slide-up           250ms     ease-out
Modal oppnas           fade-in + slide-up 250ms     ease-out
Progress uppdateras    progress-fill      500ms     ease-out
Tradsikon vaxter       tree-grow          400ms     ease-out
Hostlov (celebration)  leaf-fall          1200ms    ease-in-out (staggered)
Knapp klick            active:scale-95    150ms     ease-out (CSS)
Hover pa svar          border-color       200ms     ease-out (CSS)
```

### Celebration-sekvens (ratt svar)

```
0ms     Svarsknapp byter farg -> success-bg + check-ikon
50ms    "Bra jobbat!"-text fade-in slide-up
100ms   3-4 hostlov star leaf-fall animation (staggered +80ms var)
200ms   Poangbadge pop-animation
800ms   "Nasta station"-knapp slide-up
```

### Error-sekvens (fel svar)

```
0ms     Svarsknapp byter farg -> error-bg + X-ikon
50ms    Korten shake-animation
150ms   "Nastan! Ratt svar: [svar]"-text fade-in
400ms   "Forsatt"-knapp slide-up
```

---

## Designprinciper sammanfattning

1. **Kinnared ar inte en bakgrund** - Lokala farger, lokala referenser, lokalt sprak
2. **Varje interaktion ska berona** - Liten vinst vid varje knapptryck
3. **Bred publik, inga kompromisser** - Elsa, 9 ar OCH Gunnar, 72 ar ska le
4. **Ingen friktion fore skojet** - QR till forsta fraga: max 3 skarmar
5. **Mobil forst** - Allt designat for 375px bredd, skalar uppat
