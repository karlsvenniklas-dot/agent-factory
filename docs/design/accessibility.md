# Tillgänglighet (WCAG AA) - Tipspromenaden i Kinnared

> Tipspromenaden ska kunna användas av Elsa, 9 år, OCH Gunnar, 78 år. Ingen ska känna sig utestängd.

---

## Standard

Vi följer **WCAG 2.1 nivå AA** som minimum. Vissa krav (kontrast, touch-targets) går vi över för bredd publik.

---

## Färgkontrast

| Element | Krav | Vårt mål |
|---|---|---|
| Brödtext mot bakgrund | 4.5:1 | ≥ 7:1 (AAA) |
| Stor text (≥18px bold eller ≥24px regular) | 3:1 | ≥ 4.5:1 |
| UI-komponenter (knappar, ikoner) | 3:1 | ≥ 4.5:1 |
| Fokus-ringar | 3:1 mot bakgrund | ≥ 4.5:1 |

**Verifierat i designsystemet:**
- `soil` (#3D2B1A) på `linen` (#F5EFE6) = ~10:1 ✓
- `forest` (#2D5016) på vit = ~8.5:1 ✓
- `brick` (#A0412A) på `brick-pale` (#F8EAE7) = ~5.2:1 ✓

**Aldrig:** Information enbart via färg ("klicka på den röda knappen"). Använd alltid kombination av färg + ikon + text.

---

## Touch-targets

- **Minsta interaktiva yta:** 48×48 px (även för små ikoner som "tillbaka"-pil)
- **Mellanrum mellan touch-targets:** Minst 8px för att undvika feltryck
- **Knappar:** `min-h-[56px]` rekommenderas för primära CTA:er
- **AnswerOption:** `min-h-[64px]` (extra generös, frågor ska kännas lätta att svara på)

---

## Typografi

- **Bas-fontstorlek:** 16px (`text-base`)
- **Brödtext rekommenderat:** 18px (`text-lg`) - bredare publik tycker 16px är litet
- **Frågetext:** 20-24px (`text-xl` till `text-2xl`)
- **Knapptext:** 18px minimum
- **Line-height:** 1.5 för brödtext, 1.3 för rubriker
- **Font-family:** System-stack (snabb laddning, bekant): `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Stödja användarens textstorlek:** Använd `rem` istället för `px` för text. Ingen `font-size` med viewport-units.

---

## Tangentbordsnavigering

- **Alla interaktiva element ska vara nåbara med Tab**
- **Synlig fokus-ring** på allt fokuserbart: `focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2`
- **Aldrig** `outline: none` utan ersättning
- **Skip-länk** högst upp på sidan: "Hoppa till huvudinnehåll" (visas vid Tab)
- **Logisk tab-ordning:** Naturligt flöde top-to-bottom, left-to-right
- **Enter / Space** ska aktivera knappar
- **Escape** stänger modaler

---

## Skärmläsare

- **Lang-attribut:** `<html lang="sv">` på roten
- **Semantisk HTML:** `<button>`, `<nav>`, `<main>`, `<header>`, `<footer>` - inte bara `<div>`
- **aria-label på ikon-only-knappar:** `<button aria-label="Stäng">×</button>`
- **aria-live på toast-notifikationer:** `<div role="status" aria-live="polite">`
- **aria-current="page"** på aktuell länk i navigation
- **alt-texter:** Beskrivande för informativa bilder, `alt=""` för dekorativa
- **Form labels:** Alltid `<label>` kopplad till `<input>`, även om visuellt dolt med `sr-only`

**Specifikt för quiz-flödet:**
- Frågetexten ska vara en `<h1>` eller `<h2>` så skärmläsaren läser upp den först
- Svarsalternativen i en `<fieldset>` med `<legend>` ("Välj ett svar:")
- Varje alternativ är ett `<input type="radio">` med tydlig `<label>`
- Feedback ("Bra jobbat!") ska annonseras via `aria-live="assertive"` så skärmläsaren omedelbart läser upp

---

## Animationer & motion

- **Respektera `prefers-reduced-motion`:** Konfetti, skakning och andra animationer ska stängas av
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- **Inga blinkande element** mer än 3 gånger per sekund (epilepsirisk)
- **Animationer ska inte blockera interaktion** - användaren kan alltid fortsätta direkt

---

## Språk

- **All UI på svenska**
- **Enkel språknivå** - undvik akademisk eller teknisk jargong
- **Korta meningar** - max 20 ord per mening i UI
- **Aktivt språk** - "Skanna QR-koden" inte "QR-koden ska skannas"
- **Vänlig ton** - "Bra jobbat!" istället för "Korrekt svar"
- **Felmeddelanden ska hjälpa,** inte skylla:
  - ✅ "Hoppsan, e-postadressen ser inte ut att vara giltig. Kontrollera och försök igen."
  - ❌ "Invalid email format"

---

## Mobilspecifikt

- **Viewport-meta:** `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- **Tillåt zoom:** Använd ALDRIG `user-scalable=no` eller `maximum-scale=1`
- **Safe areas:** Respektera notch/hemknappar med `env(safe-area-inset-*)`
- **Inputs får inte zoomas in:** Sätt `font-size: 16px` på inputs (annars zoomar iOS in)
- **Tap-highlight:** Anpassa eller dölj `-webkit-tap-highlight-color` om standardgrå skuggan stör

---

## Felhantering

- **Visa fel inline,** kopplat till det fält som behöver rättas
- **aria-invalid="true"** på fält med fel
- **aria-describedby** kopplar fältet till felmeddelandet
- **Fokus flyttas till första felet** vid form submission
- **Bekräfta destruktiva åtgärder** (t.ex. "Ta bort station?")

---

## Test-checklist före release

- [ ] Alla sidor klarar Lighthouse Accessibility ≥ 95
- [ ] Tabba igenom hela appen utan mus - allt nåbart?
- [ ] VoiceOver (iOS) eller TalkBack (Android) - allt läses upp begripligt?
- [ ] Förstora text till 200% i webbläsaren - bryts layouten?
- [ ] Aktivera "reduced motion" i OS - inga animationer som stör?
- [ ] Färgkontrast verifierad med WebAIM Contrast Checker
- [ ] Testa på en gammal Android-telefon (CPU/RAM-begränsad)
- [ ] Testa på en iPad i landscape (admin-flödet)

---

## Vanliga fallgropar att undvika

- **Att glömma `<label>` på inputs** - skärmläsare blir vilse
- **Att använda `<div onClick>`** istället för `<button>` - inte tangentbordsnåbart
- **Modal som inte fångar fokus** - användaren kan tabba "ut" ur modalen
- **Toast som försvinner för snabbt** - skärmläsare hinner inte läsa
- **Fokus-ring som tas bort utan ersättning** - tangentbordsanvändare ser inte var de är
- **Färger som enda info** - rödgrönfärgblinda missar
