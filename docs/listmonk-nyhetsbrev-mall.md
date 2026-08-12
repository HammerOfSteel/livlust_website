# Listmonk – nyhetsbrev-stilmall-v1.0

Detta är innehållet för Listmonks kampanjmall ("Templates" i admin-UI:t), byggt
för att matcha sajtens "ocean"-tema (`--color-primary: #2e6b6e` m.fl. i
[frontend/src/index.css](../frontend/src/index.css)).

## 1. Själva mallen (klistra in under Campaigns → Templates → nyhetsbrev-stilmall-v1.0)

Ersätt hela default-mallen med detta. Behåll alla `{{ ... }}`-taggar
(`Campaign.Subject`, `template "content" .`, `UnsubscribeURL`, `MessageURL`,
`TrackView`, `L.T ...`) – de är Listmonks egna funktioner och måste finnas kvar.

```html
<!doctype html>
<html>
    <head>
        <title>{{ .Campaign.Subject }}</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">
        <base target="_blank">
        <style>
            body {
                background-color: #f0f8f8;
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                font-size: 15px;
                line-height: 26px;
                margin: 0;
                color: #2c2c2c;
            }

            table {
                width: 100%;
                border: 1px solid #d8e4e4;
            }
            table td {
                border-color: #d8e4e4;
                padding: 5px;
            }

            /* ── Lugn, luddig bakgrund (mjuka "blobbar" i temats färger) ── */
            .email-canvas {
                background-color: #f0f8f8;
                background-image:
                    radial-gradient(circle at 15% 20%, rgba(168,201,165,0.55) 0%, rgba(168,201,165,0) 60%),
                    radial-gradient(circle at 85% 15%, rgba(46,107,110,0.35) 0%, rgba(46,107,110,0) 55%),
                    radial-gradient(circle at 20% 85%, rgba(216,228,228,0.65) 0%, rgba(216,228,228,0) 55%),
                    radial-gradient(circle at 80% 80%, rgba(31,79,82,0.28) 0%, rgba(31,79,82,0) 55%);
                background-repeat: no-repeat;
                background-size: 140% 140%;
                background-position: 0% 0%, 100% 0%, 0% 100%, 100% 100%;
                animation: softDrift 26s ease-in-out infinite alternate;
            }
            @keyframes softDrift {
                0%   { background-position: 0% 0%, 100% 0%, 0% 100%, 100% 100%; }
                50%  { background-position: 8% 10%, 90% 8%, 10% 90%, 88% 92%; }
                100% { background-position: 0% 0%, 100% 0%, 0% 100%, 100% 100%; }
            }

            .header-band {
                background-color: #fff;
                padding: 0;
                line-height: 0;
                border-radius: 10px 10px 0 0;
                overflow: hidden;
            }
            .header-banner {
                display: block;
                width: 100%;
                height: auto;
            }

            .wrap {
                background-color: #fff;
                padding: 0 0 30px 0;
                max-width: 560px;
                margin: 0 auto;
                border-radius: 10px;
                overflow: hidden;
            }
            .gutter-inner {
                padding: 30px 30px 0 30px;
            }

            .button {
                background: #2e6b6e;
                border-radius: 4px;
                text-decoration: none !important;
                color: #fff !important;
                font-weight: bold;
                padding: 10px 26px;
                display: inline-block;
            }
            .button:hover {
                background: #1f4f52;
            }

            /* ── Nyhetsbrevssektioner ─────────────────────────── */
            .nl-section {
                margin: 0 0 28px 0;
            }
            .nl-section-title {
                font-size: 17px;
                font-weight: 700;
                color: #1f4f52;
                border-bottom: 2px solid #a8c9a5;
                padding-bottom: 8px;
                margin-bottom: 16px;
            }
            .nl-item {
                background-color: #e8f5f5;
                border-radius: 8px;
                padding: 14px 16px;
                margin-bottom: 12px;
            }
            .nl-item-title {
                font-size: 15px;
                font-weight: 700;
                color: #2c2c2c;
                margin: 0 0 4px 0;
            }
            .nl-item-meta {
                font-size: 13px;
                color: #5e6e6e;
                margin: 0 0 6px 0;
            }
            .nl-item-body {
                font-size: 14px;
                color: #444;
                margin: 0;
            }
            .nl-item-link {
                display: inline-block;
                margin-top: 8px;
                font-size: 14px;
                font-weight: 600;
                color: #2e6b6e;
                text-decoration: none;
            }

            .footer {
                text-align: center;
                font-size: 12px;
                color: #888;
                padding: 20px 30px 0 30px;
            }
            .footer a {
                color: #888;
                margin-right: 5px;
            }
            .footer-org {
                color: #aaa;
                margin-top: 4px;
            }

            .gutter {
                padding: 30px;
            }

            img {
                max-width: 100%;
                height: auto;
            }

            a {
                color: #2e6b6e;
            }
            a:hover {
                color: #1f4f52;
            }

            @media screen and (max-width: 600px) {
                .wrap {
                    max-width: auto;
                }
                .gutter-inner {
                    padding: 20px 20px 0 20px;
                }
            }
        </style>
    </head>
<body style="background-color: #f0f8f8;font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size: 15px;line-height: 26px;margin: 0;color: #2c2c2c;">
    <div class="email-canvas" style="background-color: #f0f8f8;">
        <div class="gutter" style="padding: 30px;">&nbsp;</div>
        <div class="wrap" style="background-color: #fff;max-width: 560px;margin: 0 auto;border-radius: 10px;overflow: hidden;">
            <div class="header-band" style="background-color: #fff;padding: 0;line-height: 0;">
                <img src="https://newsletter.livslusths.se/uploads/banner.png" alt="Livslust &amp; Hållbart Stöd" class="header-banner" style="display:block;width:100%;height:auto;">
            </div>
            <div class="gutter-inner" style="padding: 30px 30px 0 30px;">
                {{ template "content" . }}
            </div>
        </div>

        <div class="footer" style="text-align: center;font-size: 12px;color: #888;padding: 20px 30px 0 30px;">
            <p>
                <a href="{{ UnsubscribeURL }}" style="color: #888;">{{ L.T "email.unsub" }}</a>
                &nbsp;&nbsp;
                <a href="{{ MessageURL }}" style="color: #888;">{{ L.T "email.viewInBrowser" }}</a>
            </p>
            <p class="footer-org" style="color: #aaa;margin-top: 4px;">
                Livslust och hållbart stöd &middot; Org.nr 802556-0601 &middot; Kamvägen 3, 93731 Burträsk
            </p>
        </div>
        <div class="gutter" style="padding: 30px;">&nbsp;{{ TrackView }}</div>
    </div>
</body>
</html>
```

## 2. Exempelinnehåll för en kampanj (klistra in i kampanjens HTML-källa)

Detta är *innehållet* (`{{ template "content" . }}`-delen), dvs. det du
skriver per utskick i kampanj-editorn (växla till "Raw HTML"-läge för att
klistra in det här direkt, annars bygger du samma struktur i editorn).
Byt ut exempeltexterna mot riktigt innehåll inför varje utskick.

```html
<h2 style="font-size:19px;color:#1f4f52;margin:0 0 20px 0;">Nyhetsbrev — {{ .Campaign.Subject }}</h2>

<p style="margin:0 0 24px 0;">Hej! Här kommer senaste nytt från Livslust och hållbart stöd.</p>

<div class="nl-section" style="margin:0 0 28px 0;">
    <div class="nl-section-title" style="font-size:17px;font-weight:700;color:#1f4f52;border-bottom:2px solid #a8c9a5;padding-bottom:8px;margin-bottom:16px;">
        📅 Aktiviteter och event
    </div>

    <div class="nl-item" style="background-color:#e8f5f5;border-radius:8px;padding:14px 16px;margin-bottom:12px;">
        <p class="nl-item-title" style="font-size:15px;font-weight:700;color:#2c2c2c;margin:0 0 4px 0;">Samtalsträff</p>
        <p class="nl-item-meta" style="font-size:13px;color:#5e6e6e;margin:0 0 6px 0;">Onsdag 3 september, kl 18:00 · Burträsk</p>
        <p class="nl-item-body" style="font-size:14px;color:#444;margin:0;">Kort beskrivning av träffen och vad som händer.</p>
        <a href="https://www.livslusths.se/#activities" class="nl-item-link" style="display:inline-block;margin-top:8px;font-size:14px;font-weight:600;color:#2e6b6e;text-decoration:none;">Läs mer →</a>
    </div>
</div>

<div class="nl-section" style="margin:0 0 28px 0;">
    <div class="nl-section-title" style="font-size:17px;font-weight:700;color:#1f4f52;border-bottom:2px solid #a8c9a5;padding-bottom:8px;margin-bottom:16px;">
        🏡 Föreningen
    </div>

    <div class="nl-item" style="background-color:#e8f5f5;border-radius:8px;padding:14px 16px;margin-bottom:12px;">
        <p class="nl-item-title" style="font-size:15px;font-weight:700;color:#2c2c2c;margin:0 0 4px 0;">Nyhet om föreningen</p>
        <p class="nl-item-body" style="font-size:14px;color:#444;margin:0;">Kort text om vad som är nytt, t.ex. årsmöte, nya medlemmar, ekonomi etc.</p>
    </div>
</div>

<div class="nl-section" style="margin:0 0 8px 0;">
    <div class="nl-section-title" style="font-size:17px;font-weight:700;color:#1f4f52;border-bottom:2px solid #a8c9a5;padding-bottom:8px;margin-bottom:16px;">
        📚 Resurser
    </div>

    <div class="nl-item" style="background-color:#e8f5f5;border-radius:8px;padding:14px 16px;margin-bottom:12px;">
        <p class="nl-item-title" style="font-size:15px;font-weight:700;color:#2c2c2c;margin:0 0 4px 0;">Boktips / Filmtips / Länk</p>
        <p class="nl-item-body" style="font-size:14px;color:#444;margin:0;">Kort tips och varför det kan passa.</p>
        <a href="#" class="nl-item-link" style="display:inline-block;margin-top:8px;font-size:14px;font-weight:600;color:#2e6b6e;text-decoration:none;">Läs mer →</a>
    </div>
</div>
```

## Noter

- Headern är nu en enda bred banner-bild
  (`https://newsletter.livslusths.se/uploads/banner.png`, uppladdad via
  Listmonks mediahanterare, 808×326px) som fyller hela `.header-band` på
  bredden — bilden innehåller redan hela namnet ("Livslust & Hållbart Stöd")
  så ingen separat textrad eller bakgrundsfärg behövs. `<img class="header-banner">`
  har `width:100%;height:auto` så den skalar proportionerligt till kortets
  bredd (560px, eller smalare på mobil) utan att beskäras.
- Färger/typsnitt är hämtade från "ocean"-temat i
  [frontend/src/index.css](../frontend/src/index.css) (sajtens default-tema).
  Byt värdena i `<style>` om ni vill matcha ett annat tema.
- `.nl-item`, `.nl-section-title` osv. har både en CSS-klass och inline-style
  på samma element (samma mönster som Listmonks egen default-mall) eftersom
  vissa e-postklienter (t.ex. Outlook) ignorerar `<style>`-block.
- Bakgrunden bakom kortet (`.email-canvas`) är fyra mjuka, halvtransparenta
  radial-gradients i temats färger som bildar suddiga "blobbar", plus en
  `@keyframes softDrift`-animation som mycket långsamt förskjuter dem (26s,
  fram och tillbaka). E-postklienter som stödjer CSS-animationer i `<style>`
  (Apple Mail, iOS/macOS Mail, en del andra) visar den mjuka rörelsen; klienter
  som ignorerar `@keyframes` (Gmail, Outlook) visar bara den statiska
  blob-bakgrunden — ingen trasig layout i något fall, `background-color` är
  alltid satt som yttersta reservfärg.

## 3. Första nyhetsbrevet (utkast, Markdown)

Detta klistras in i kampanj-editorn i **Markdown-läge** (samma läge som
Listmonks default-exempeltext använder). `@TrackLink`-suffixet på länkarna
följer samma konvention som i Listmonks egen exempeltext — det gör länken
klickspårad i kampanjstatistiken.

Händelserna nedan är hämtade från de faktiska kommande evenemangen i Directus
(`/cms/items/events`) per 12 augusti 2026 — uppdatera datum/orter inför varje
utskick, och byt ut `{{ .Subscriber.FirstName }}` blir automatiskt ifyllt av
Listmonk per mottagare.

```markdown
### Hej {{ .Subscriber.FirstName }}!

Här kommer sensommarens nyheter från Livslust och hållbart stöd — kort och gott, som vanligt.

## 📅 Aktiviteter och event

Vi fortsätter att träffas runt om i landet, både digitalt och på plats. Några av de närmaste träffarna:

- **17 augusti, kl 18:00–19:30** — Digital samtalsträff (online)
- **19 augusti, kl 18:00–19:30** — Samtalsträff, Skellefteå
- **25 augusti, kl 18:00** — Knata och Prata, Ystad
- **31 augusti, kl 18:00–19:30** — Samtalsträff och Knata & Prata, Gevågs Byastuga

Se [hela kalendern med alla träffar](https://www.livslusths.se/#offer@TrackLink) för fler orter och datum, och anmäl dig via info@livslusths.se.

## 🏡 Föreningen

Vi är nu **19 medlemmar** och blir fler för varje månad — tack för att ni är med och bär det här tillsammans med oss. Ett av våra kommande fokusområden är vår Discord-community: vi vill göra den mer synlig och tillgänglig för alla som behöver ett rum att vara i, dygnet runt, oavsett var i landet man bor. [Gå med i vår Discord](https://discord.gg/ReXE6DTEuK@TrackLink) om du inte redan är med.

## 📚 Resurser

Ett tips den här månaden: **Efterlevandepodden**, som utforskar livet efter att ha mist någon i suicid genom ärliga samtal. Kanske något för dig, eller någon du känner. [Lyssna på Efterlevandepodden](https://poddtoppen.se/podcast/1729456270/efterlevandepodden@TrackLink).

Varma hälsningar,
Livslust och hållbart stöd
```
