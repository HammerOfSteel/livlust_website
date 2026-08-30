# Lägga till evenemang på webbplatsen

Den här guiden förklarar hur du lägger till ett nytt evenemang så att det visas i avsnittet "Kommande aktiviteter" på webbplatsen.

Sedan 2026-08 hämtas alla evenemang direkt från vår **Google Kalender**
(`info@livslusths.se`) — inte från Directus längre. Du behöver bara skapa
eventet på ett ställe, i kalendern, så dyker det automatiskt upp som ett
kort på webbplatsen.

---

## Var loggar jag in?

Gå till [Google Kalender](https://calendar.google.com/) och logga in med
kontot för `info@livslusths.se`.

---

## Steg för steg

### 1. Skapa ett nytt event i kalendern

Klicka på en dag/tid, eller på **"Skapa"** uppe till vänster → **"Event"**.

### 2. Fyll i fälten

| Fält (i Google Kalender) | Vad du skriver | Exempel |
|---|---|---|
| **Titel** | Evenemangets namn | Knata och Prata i Ystad |
| **Datum & tid** | När eventet börjar och slutar. Kryssa i "Hela dagen" om det inte har en specifik tid | 2026-09-15, 18:00–19:00 |
| **Plats** | Adress, ort, eller en länk (t.ex. Discord-länk för digitala träffar) | Sandskogen, Ystad |
| **Beskrivning** | Fritext om eventet — skriv precis som ni redan gör idag (📍 plats, 👥 arrangörer, "Anmäl dig på info@livslusths.se") | Se befintliga events i kalendern som exempel |

Det finns inga separata fält för "tagline", "arrangörer" eller "märkning" —
skriv det i Beskrivning precis som vanligt, det visas som brödtext på kortet.

Anmälan sker alltid via mejl till **info@livslusths.se** — webbplatsen visar
alltid den knappen, oavsett vad du skriver i beskrivningen.

### 3. Klart

Eventet syns på webbplatsen inom någon minut (webbläsaren hämtar en färsk
lista varje gång sidan laddas, ingen cache att vänta på).

---

## Skapa den engelska versionen

Kalendern har bara ett fält per event, så för att visa en engelsk
översättning skriver du den i **samma** Beskrivning-fält, efter en rad som
bara innehåller:

```
--EN--
```

Allt ovanför den raden visas när besökaren har valt svenska, allt under
visas när besökaren valt engelska. Titeln (fältet "Titel") är alltid
densamma på båda språken. Exempel:

```
📍 Ystad, Sandskogen
👥 Anna och Oliver

En promenad och samtal för dig som mist någon i suicid...
Anmäl dig gärna via mail till info@livslusths.se

--EN--

📍 Ystad, Sandskogen
👥 Anna and Oliver

A walk and conversation for anyone who has lost someone to suicide...
Please sign up via email to info@livslusths.se
```

Om ingen `--EN--`-rad finns visas den svenska texten även för engelskspråkiga
besökare (bättre än ett tomt kort).

---

## Ändra eller ta bort ett evenemang

Ändra eller ta bort eventet direkt i Google Kalender — webbplatsen läser
alltid den senaste versionen, det finns ingen separat kopia att uppdatera.

---

## Vanliga frågor

**Hur lång tid tar det innan eventet syns på webbplatsen?**
Nästan direkt — webbplatsen hämtar evenemangen direkt från kalendern varje
gång sidan laddas.

**Kan jag lägga upp ett evenemang i förväg?**
Ja, skapa det i kalendern när som helst — det visas så fort det är sparat.

**Vad händer med återkommande event (t.ex. "sista tisdagen varje månad")?**
Om du gör eventet återkommande i Google Kalender (upprepningsinställningen)
dyker varje tillfälle automatiskt upp som ett eget kort på webbplatsen, upp
till ett år framåt.

**Varför visas inte mitt event?**
Kontrollera att det inte är markerat som "Privat" eller inställt att endast
synas för dig — kalendern måste vara publik för att webbplatsen ska kunna
läsa den (det är den redan, så det ska fungera automatiskt).
