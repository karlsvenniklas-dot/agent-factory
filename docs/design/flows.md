# Användarflöden - Tipspromenaden i Kinnared

> Beskriver användarresor i prosa. Wireframes finns i `wireframes.md`.

---

## Flöde 1: Första gången - från QR till första frågan

Anna är 34 år, står utanför Kinnareds kyrka med sin telefon. Hon ser en skylt: "Skanna QR-koden för att börja tipspromenaden!" Hon öppnar kameran och skannar.

1. **Kameran öppnar URL:en** `https://tipspromenad-kinnared.se/station/abc123`
2. **Servern kontrollerar:** Är token giltig? Ja → kontrollera om Anna är inloggad. Nej → redirect till `/login?next=/station/abc123`
3. **Login-skärm visas:** Anna skriver in sin e-post och trycker "Skicka magisk länk"
4. **Toast visas:** "Kolla din inkorg!"
5. **Anna byter till mejlappen,** klickar på länken
6. **Magic link callback:** Sätter session, redirect till `/station/abc123`
7. **Servern kontrollerar igen:** Token giltig + inloggad → hämta fråga via `questions_public`-vyn (utan correct_index)
8. **Frågan visas:** Anna läser, väljer ett alternativ, trycker "Svara"
9. **Servern processar svaret:** Hämtar correct_index server-side, jämför, sparar i `participant_answers` med `is_correct`
10. **Feedback-skärm:** "Bra jobbat!" eller "Nära - men inte riktigt"
11. **Anna trycker "Fortsätt"** → kommer till `/play` (översikt) som visar progress

**Edge case:** Om Anna stänger appen efter login men före hon svarar - när hon kommer tillbaka via QR-skanning eller `/play` ser hon att hon inte svarat på station X och kan fortsätta.

---

## Flöde 2: Promenaden - station till station

Anna har svarat på station 1. Hon trycker "Fortsätt" och kommer till `/play`.

1. **Play-sidan visar:** Progress 1/10, lista över avklarade stationer, instruktion att skanna nästa QR
2. **Anna går till station 2,** skannar QR
3. **Direkt till `/station/[token]`** eftersom hon är redan inloggad
4. **Frågan visas, hon svarar, ser feedback**
5. **Repeat tills 10/10**

**Subtilt UX-grepp:** Efter varje svar hamnar hon på `/play` med uppdaterad progress. Detta ger en känsla av framsteg utan att tvinga henne tillbaka till en specifik plats.

**Optimization:** Om Anna är inloggad och scannar en QR direkt, hoppar vi över `/play` och visar frågan direkt. Bara på resultatsidan eller om hon explicit går till `/play` ser hon översikten.

---

## Flöde 3: Avbryta och komma tillbaka

Anna har gått 6 av 10 stationer men måste hem. Dagen efter kommer hon tillbaka.

1. **Hon öppnar `tipspromenad-kinnared.se`** i sin webbläsare (eller skannar nästa QR)
2. **Sessionen är fortfarande giltig** (Supabase magic link sessions varar default 1 vecka)
3. **Hon hamnar på `/play`** med sin progress visad: 6/10
4. **"Skanna nästa QR-kod för att fortsätta"**
5. **Hon går ut, skannar station 7, fortsätter**

Om sessionen har gått ut: standard login-flöde, men `/play` visar fortfarande hennes progress eftersom det är knutet till hennes användar-id.

---

## Flöde 4: Slutförande

Anna har precis svarat på station 10.

1. **Servern processar sista svaret**
2. **Servern beräknar:** Totalt antal rätt + ranking via `get_ranking()` RPC
3. **Resultatsidan visas:** "Klart! Du fick 8 av 10 rätt. Din placering: #4"
4. **Top-3 visas + Annas rad highlightad**
5. **Länk till full leaderboard**
6. **Footer-text:** "När en ny omgång publiceras kan du gå promenaden igen."

**Re-run policy:** Anna kan inte gå om en pågående omgång. Men admin kan publicera en NY omgång (eller markera nuvarande som inaktiv och skapa en ny aktiv) - då nollställs allas progress.

---

## Flöde 5: Admin - Skapa ny omgång från start till QR-utskrift

Admin Birgitta (66 år, sitter med sin iPad) ska byta ut tipspromenaden inför sommaren.

1. **Birgitta loggar in** på `/admin` med samma magic link-flöde
2. **Hennes profil har `role: 'editor'` eller `'owner'`** → middleware släpper igenom henne
3. **Admin-dashboard visar** alla omgångar med status (aktiv/inaktiv)
4. **Hon klickar "+ Ny omgång"**
5. **Formulär:** Namn ("Sommarrundan 2026"), beskrivning. Hon sparar. Omgången skapas inaktiv.
6. **Birgitta klickar "Redigera"** på omgången
7. **Hon klickar "+ Lägg till station"** 10 gånger, fyller i för varje:
   - Stationsnamn (t.ex. "Kyrkan")
   - Frågetext
   - 4 alternativ
   - Markerar rätt svar
   - Poäng (default 1)
8. **När alla 10 är klara,** trycker hon "Skriv ut alla QR-koder"
9. **Print-vyn öppnas:** En A4 per station med stor QR-kod, stationsnamn, instruktion
10. **Hon trycker `Cmd+P`** (eller "Skriv ut") - skrivardialogen öppnas
11. **Skriver ut på riktig skrivare,** laminerar arken, sätter upp på stationerna
12. **Tillbaka till admin,** markerar omgången som "Aktiv"
13. **Den gamla omgången blir automatiskt inaktiv** (databasen enforced detta via partial unique index på `is_active`)
14. **Alla deltagare som loggar in nu** ser den nya omgången och kan gå om

---

## Flöde 6: Admin - Edit en pågående omgång

Birgitta upptäcker att station 4 har fel årtal. Hon vill rätta det.

1. **Hon går till admin → omgång → station 4**
2. **Ändrar correct_index till rätt alternativ**
3. **Sparar**
4. **Befintliga svar uppdateras INTE retroaktivt** (de behåller sin `is_correct`-status)
5. **Nya svar bedöms enligt det nya rätta alternativet**

**Alternativ implementation att överväga:** Bedöm alla svar mot aktuell `correct_index`. Detta är "rättvisare" men kan upplevas konstigt om någon ser sin score ändras. För MVP: behåll historiska bedömningar.

---

## Övergripande designprinciper för flödena

- **Friction-free start:** Max 3 skärmar från QR-skanning till första frågan
- **Persistens:** Användaren kan alltid komma tillbaka och fortsätta där hon slutade
- **Tydlig progress:** Användaren vet alltid hur långt hon har kvar
- **Celebration:** Varje svar belönas, korrekt eller inte
- **Inget straff för fel:** Vi visar rätt svar, ingen "förlust"-känsla
- **Admin är användare också:** Samma vänliga ton i admin som i deltagar-UI
