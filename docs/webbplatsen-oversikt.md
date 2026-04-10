# Webbplatsen — översikt och hosting

Den här guiden riktar sig till er i organisationen som vill förstå hur webbplatsen fungerar, utan att behöva vara tekniker.

---

## Vad är webbplatsen?

Webbplatsen på **https://livslusths.se** är Livslust och hållbart stöds digitala hem. Där kan besökare läsa om vilka vi är, se kommande evenemang, ta del av vad vi erbjuder och höra av sig via kontaktformuläret.

Webbplatsen är byggd på svenska som standardspråk med möjlighet att byta till engelska — något som gör den tillgänglig även för besökare som inte talar svenska.

---

## Vad är CMS-systemet?

CMS står för Content Management System — ett system för att hantera innehåll. Vi använder **Directus**, ett enkelt men kraftfullt verktyg.

Via Directus kan ni:

- Lägga till, ändra och ta bort evenemang
- Redigera texter som visas på webbplatsen
- Se inkommande meddelanden från kontaktformuläret
- Hantera vilka som har tillgång till systemet

Directus-adminpanelen nås på: **https://livslusths.se/cms/admin**

---

## Hur är webbplatsen uppbyggd?

```
Besökarens webbläsare
        |
   Nginx (webbserver på servern)
        |
  ┌─────────────────┐
  │  Frontend        │  — det besökaren ser (React/Vite)
  │  port 3005       │
  └─────────────────┘
        |
  ┌─────────────────┐
  │  Directus CMS   │  — admin och API
  │  port 8055       │
  └─────────────────┘
        |
  ┌─────────────────┐
  │  PostgreSQL      │  — databasen (lagrar allt)
  └─────────────────┘
```

Allt körs i **Docker** — tänk på Docker som separata lådor där varje del av systemet körs isolerat och säkert på servern.

---

## Var körs servern?

Webbplatsen körs på en virtuell server hos **Oracle Cloud** (gratis nivå).

- **IP:** 129.151.193.219
- **Domän:** livslusths.se (A-post i DNS hos simply.com)
- **HTTPS:** Krypterad trafik via ett Let's Encrypt-certifikat (förnyas automatiskt)
- **Operativsystem:** Ubuntu Linux

Servern delar resurser med andra webbplatser på samma maskin (t.ex. bifrost.dancingsalamanders.com, fauke.dancingsalamanders.com). Varje webbplats är isolerad och påverkar inte de andra.

---

## Hur driftsätts uppdateringar?

Koden förvaras på GitHub: **https://github.com/HammerOfSteel/livlust_website**

Varje gång en utvecklare pushar en ändring till kodbasen körs en automatisk process (GitHub Actions) som:

1. Loggar in på servern via SSH
2. Hämtar den senaste koden
3. Bygger om webbplatsen
4. Startar om tjänsterna

Detta tar ungefär 2-3 minuter. Webbplatsen är inte nere under den tiden.

---

## Vad händer om något krånglar?

- **Evenemang visas inte:** Kontrollera att status är "Publicerad" i Directus.
- **Kontaktformuläret fungerar inte:** Kolla att Directus-servicen är igång (logga in på adminpanelen).
- **Webbplatsen ej nåbar:** Kontakta den tekniska ansvarige.

---

## Kontaktpersoner (teknik)

Uppdatera detta avsnitt med namn och kontaktuppgifter till den eller de som ansvarar för den tekniska driften.
