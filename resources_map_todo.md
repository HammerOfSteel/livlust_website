# Resurskarta – Implementeringsplan

> Skapad: 2026-07-17  
> Senast uppdaterad: 2026-07-17  
> Status: Planering

---

## Översikt

Interaktiv karta över Sverige med stödresurser per kommun/ort. Användaren kan klicka på ett
län eller en ort, se den zooma in, och få upp animerade nålar för resurser i området. Filter
per kategori och ett informationskort vid klick på nål.

### Teknisk stack (frontend)
- **Kartbibliotek:** `react-simple-maps` + `topojson-client` (SVG-baserad, lättviktig)  
- **GeoJSON-data:** Svenska kommuner och län via Statistikmyndigheten SCB (public domain)  
- **Animationer:** CSS-keyframe animations + React state för zoom/highlight  
- **Koordinater för nålar:** Lat/lng per resurs (se `resources_info.md`)  
- **State management:** React hooks (useState, useRef) – inget externt bibliotek behövs  
- **Inga nya backend-ändringar** i initiala faser – resurser är statisk data i TypeScript

---

## Status per fas

| Fas | Titel | Status |
|-----|-------|--------|
| 0 | Databeredning & beroenden | ⬜ Ej påbörjad |
| 1 | Grundkarta – Sverige med kommuner | ⬜ Ej påbörjad |
| 2 | Klick-zoom & municipalitet-highlight | ⬜ Ej påbörjad |
| 3 | Animerade resursnålar | ⬜ Ej påbörjad |
| 4 | Kategorifiler & filterpanel | ⬜ Ej påbörjad |
| 5 | Informationskort (pin popup) | ⬜ Ej påbörjad |
| 6 | Sidintegration & navigering | ⬜ Ej påbörjad |
| 7 | Tillgänglighet, polish & deploy | ⬜ Ej påbörjad |

---

## Fas 0 – Databeredning & beroenden

**Mål:** Alla nödvändiga paket är installerade och resursdata finns som TypeScript-fil.

### Steg

- [ ] **0.1** Installera npm-paket i `frontend/`:
  ```
  npm install react-simple-maps topojson-client
  npm install --save-dev @types/topojson-client
  ```

- [ ] **0.2** Ladda ner GeoJSON/TopoJSON för svenska kommuner:
  - Källa: SCB-data (NUTS-gränser) eller `naturvårdsverket` öppen geodata
  - Alternativt npm-paket: sök `sweden-municipalities-geojson` eller `swedish-municipalities`
  - Spara som `frontend/public/sweden-municipalities.json` (TopoJSON, kommuner)
  - Spara som `frontend/public/sweden-counties.json` (TopoJSON, län) – för initial vy

- [ ] **0.3** Skapa resursdatafil:
  - Fil: `frontend/src/data/resources.ts`
  - TypeScript-interface `Resource` med fälten:
    ```typescript
    interface Resource {
      id: string;
      name: string;
      category: ResourceCategory;
      isNational: boolean;          // true = visas som nationell (ingen nål)
      city: string | null;
      county: string | null;        // länsnamn, matchar GeoJSON-data
      municipality: string | null;  // kommunnamn
      lat: number | null;
      lng: number | null;
      phone: string | null;
      website: string;
      hours: string | null;
      description: string;
      tags: string[];
    }
    ```
  - Populera med alla resurser från `resources_info.md`

- [ ] **0.4** Skapa `ResourceCategory` enum/type:
  ```typescript
  type ResourceCategory =
    | 'krislinje'
    | 'efterlevande'
    | 'psykisk_halsa'
    | 'stodgrupp'
    | 'ungdom'
    | 'hbtqi'
    | 'kyrka'
    | 'aldre'
    | 'online'
    | 'suicidprevention';
  ```

- [ ] **0.5** Verifiera att TypeScript kompilerar utan fel: `npm run build`

- [ ] **0.6** Uppdatera `resources_map_todo.md` – markera fas 0 klar

---

## Fas 1 – Grundkarta: Sverige med kommuner

**Mål:** En SVG-karta över Sverige renderas i en ny React-komponent. Kommuner är synliga och
hovrar korrekt med stilsättning som matchar sidans tema.

### Steg

- [ ] **1.1** Skapa `frontend/src/components/ResourcesMap.tsx` (tom skeleton)

- [ ] **1.2** Skapa `frontend/src/components/ResourcesMap.css`

- [ ] **1.3** Läs in GeoJSON i komponenten med `fetch` eller Vite-import:
  ```tsx
  import swedenData from '../../public/sweden-municipalities.json';
  ```

- [ ] **1.4** Rendera `<ComposableMap>` + `<Geographies>` + `<Geography>` via `react-simple-maps`:
  - Projicering: `geoMercator` centrerad på Sverige (~62°N, 15°E)
  - Skala: ~700–900 beroende på viewport
  - Varje `<Geography>` renderas som en SVG-path (kommun)

- [ ] **1.5** Baskarta-styling:
  - Default-fyllning: `var(--color-card-bg)` med kant `var(--color-border)`
  - Hover-fyllning: `var(--color-accent)` med lätt skugga
  - CSS-transition på fill

- [ ] **1.6** Kartan ska vara responsiv:
  - Wrappar sig i en `aspect-ratio: 0.6` container
  - `width: 100%`, `max-width: 900px` på kartsektionen

- [ ] **1.7** Placera `ResourcesMap` tillfälligt i `Home.tsx` och verifiera att det renderas

- [ ] **1.8** Uppdatera `resources_map_todo.md` – markera fas 1 klar

---

## Fas 2 – Klick-zoom & kommunhighlight

**Mål:** Klick på en kommun zoomar in kartan mot den kommunen, skalar upp den visuellt och
markerar den med annan färg. En tillbaka-knapp återställer vyn.

### Steg

- [ ] **2.1** Lägg till state i `ResourcesMap`:
  ```tsx
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [zoomCenter, setZoomCenter] = useState<[number, number]>([15, 62]);
  const [zoomScale, setZoomScale] = useState(1);
  ```

- [ ] **2.2** Implementera klick-handler på `<Geography>`:
  - Beräkna kommunens centroid med `geoCentroid` från `d3-geo` (installeras med `react-simple-maps`)
  - Sätt `zoomCenter` till centroiden och `zoomScale` till 4–6 beroende på kommunstorlek
  - Sätt `selectedMunicipality` till kommunens id/namn

- [ ] **2.3** Använd `<ZoomableGroup>` från `react-simple-maps`:
  ```tsx
  <ZoomableGroup
    center={zoomCenter}
    zoom={zoomScale}
    onMoveEnd={({ coordinates, zoom }) => { /* uppdatera state */ }}
  >
  ```

- [ ] **2.4** Kommunhighlight-styling:
  - Vald kommun: `fill: var(--color-primary)`, `stroke: var(--color-primary-d)`, `strokeWidth: 1.5`
  - Omgivande kommuner: lätt nedtonade (`opacity: 0.6`) när en är vald

- [ ] **2.5** Zoom-animering:
  - CSS: `transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)` på SVG-elementet
  - Alternativt: `react-spring` för smooth spring-animation (valfritt)

- [ ] **2.6** "Återgå"-knapp:
  - Visas när `selectedMunicipality !== null`
  - Återställer zoom och rensa val
  - Placeras ovanför kartan, styled som `btn`-klassen

- [ ] **2.7** Visa kommunnamn som tooltip/label vid hover i zoomat läge

- [ ] **2.8** Uppdatera `resources_map_todo.md` – markera fas 2 klar

---

## Fas 3 – Animerade resursnålar

**Mål:** Nålar/pins renderas på kartan för varje resurs med lat/lng. Nationella resurser
visas separat i en lista, inte som nålar. Nålarna har en CSS bounce/drop-animation när de
dyker upp.

### Steg

- [ ] **3.1** Skapa `<Marker>` från `react-simple-maps` för varje resurs med koordinater:
  ```tsx
  <Marker coordinates={[resource.lng, resource.lat]}>
    <circle r={6} className={`pin pin--${resource.category}`} />
  </Marker>
  ```

- [ ] **3.2** CSS-animation för nålar – bounce/drop-in:
  ```css
  @keyframes pinDrop {
    0%   { transform: translateY(-20px); opacity: 0; }
    60%  { transform: translateY(4px); opacity: 1; }
    80%  { transform: translateY(-2px); }
    100% { transform: translateY(0); }
  }
  .pin { animation: pinDrop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  ```

- [ ] **3.3** Nål-färger per kategori (CSS-klasser):
  | Kategori | Färg |
  |----------|------|
  | `krislinje` | `#e53935` (röd) |
  | `efterlevande` | `var(--color-primary)` (teal) |
  | `psykisk_halsa` | `#5c6bc0` (blå-lila) |
  | `stodgrupp` | `#43a047` (grön) |
  | `ungdom` | `#fb8c00` (orange) |
  | `hbtqi` | `#ab47bc` (lila) |
  | `kyrka` | `#8d6e63` (brun) |
  | `aldre` | `#0097a7` (cyan) |
  | `suicidprevention` | `#546e7a` (blå-grå) |

- [ ] **3.4** Nålar ska ha `staggered` animation om flera visas samtidigt (delay per index)

- [ ] **3.5** I zoomed-in läge – visa bara nålar för den valda kommunen/regionen

- [ ] **3.6** Om inga nålar finns i vald kommun – visa "Inga lokala resurser. Se nationella resurser nedan."

- [ ] **3.7** Nålar ska ha `cursor: pointer` och hover-effekt (skala upp lätt)

- [ ] **3.8** Uppdatera `resources_map_todo.md` – markera fas 3 klar

---

## Fas 4 – Kategorifiler & filterpanel

**Mål:** En filterpanel ovanför/bredvid kartan låter användaren filtrera nålar per kategori.
Filtret påverkar både nålarna på kartan och den nationella listan.

### Steg

- [ ] **4.1** Lägg till `activeCategories` state (Set av aktiva kategorier, default = alla)

- [ ] **4.2** Skapa `FilterPanel`-komponent (eller inline i `ResourcesMap`):
  - Visa alla kategorier som toggle-knappar/chips
  - Varje chip har kategorifärgen och en ikon (emoji eller enkel SVG)
  - Klick på chip: toggle på/av
  - "Visa alla" / "Rensa filter" knapp

- [ ] **4.3** Filterlogik:
  - Resurser filtreras i `useMemo` baserat på `activeCategories`
  - Filtrerade resurser renderas som nålar och i nationell lista

- [ ] **4.4** Filterpanelens design:
  - Horisontell scroll på mobil
  - Chips med `border-radius: 999px`, aktiv = fylld bakgrund, inaktiv = outline
  - Animering: `opacity` + `scale` transition på nålar när filter ändras

- [ ] **4.5** Kategori-etiketter på svenska och engelska i i18n-filerna:
  ```json
  "resources": {
    "filter_all": "Alla kategorier",
    "categories": {
      "krislinje": "Krislinje",
      "efterlevande": "Efterlevandestöd",
      ...
    }
  }
  ```

- [ ] **4.6** Uppdatera `resources_map_todo.md` – markera fas 4 klar

---

## Fas 5 – Informationskort (pin popup)

**Mål:** Klick på en nål öppnar ett informationskort med resursinformation. Kortet är
väldesignat och stängs när användaren klickar bort.

### Steg

- [ ] **5.1** Lägg till `selectedResource` state i `ResourcesMap`

- [ ] **5.2** Klick på `<Marker>` sätter `selectedResource` (och förhindrar event-bubbla till kartan)

- [ ] **5.3** Skapa `ResourceCard`-komponent (eller `ResourceInfoCard`):
  ```
  ┌──────────────────────────────┐
  │ [Kategori-chip]    [×]       │
  │                              │
  │  Resursnamn                  │
  │  📍 Ort / Nationell           │
  │  ☎  Telefon (klickbar)       │
  │  🕐  Öppettider               │
  │  📝 Beskrivning               │
  │                              │
  │  [→ Besök webbplats]         │
  └──────────────────────────────┘
  ```

- [ ] **5.4** Kortets position:
  - **Desktop:** Fast panel till höger om kartan, slide-in från höger
  - **Mobil:** Bottom sheet (slide-up från botten)
  - Animering: CSS `transform` + `transition` (ingen extern animationslib behövs)

- [ ] **5.5** Kortet stängs via:
  - "×"-knappen
  - `Escape`-tangenten
  - Klick utanför (backdrop-klick på mobil)

- [ ] **5.6** Länken "Besök webbplats" öppnar i ny flik med `rel="noopener noreferrer"`

- [ ] **5.7** Telefonnummer renderas som `<a href="tel:...">` för klick-till-ring

- [ ] **5.8** ARIA-attribut: `role="dialog"`, `aria-labelledby`, fokushantering

- [ ] **5.9** Uppdatera `resources_map_todo.md` – markera fas 5 klar

---

## Fas 6 – Sidintegration & navigering

**Mål:** Resurskartan är tillgänglig som en egen sida på `/resurser`, länkad från navigeringen.

### Steg

- [ ] **6.1** Skapa ny sidfil `frontend/src/pages/Resources.tsx`:
  ```tsx
  import Header from '../components/Header';
  import ResourcesMap from '../components/ResourcesMap';
  import Footer from '../components/Footer';
  
  export default function Resources() {
    return (
      <>
        <Header />
        <main>
          <section className="resources-hero">
            <h1>{t('resources.heading')}</h1>
            <p>{t('resources.intro')}</p>
          </section>
          <ResourcesMap />
          <NationalResourcesList /> {/* Lista under kartan */}
        </main>
        <Footer />
      </>
    );
  }
  ```

- [ ] **6.2** Skapa `NationalResourcesList`-komponent:
  - Visar alla resurser med `isNational: true`
  - Filtreras av samma `activeCategories` som kartan (lyft state upp till `Resources`)
  - Kort-lista med kategori-chip, namn, telefon, öppettider, länk

- [ ] **6.3** Lägg till route i `frontend/src/main.tsx` (eller App-komponent):
  ```tsx
  <Route path="/resurser" element={<Resources />} />
  ```

- [ ] **6.4** Lägg till "Resurser" i navigeringen (`Header.tsx`):
  - Ny nav-länk: `<NavLink to="/resurser">`
  - i18n: `"nav.resources": "Resurser"` / `"Resources"`

- [ ] **6.5** Lägg till i18n-nycklar för sidan i `sv.json` och `en.json`:
  ```json
  "resources": {
    "heading": "Hitta stöd nära dig",
    "intro": "Klicka på en plats på kartan för att se resurser i din närheten.",
    "national_heading": "Nationella resurser (telefon & online)",
    "no_local": "Inga lokala resurser hittades i detta område.",
    "filter_all": "Alla kategorier",
    "back_button": "← Tillbaka till helkarta",
    "visit_website": "Besök webbplats →",
    "categories": { ... }
  }
  ```

- [ ] **6.6** Uppdatera `resources_map_todo.md` – markera fas 6 klar

---

## Fas 7 – Tillgänglighet, polish & deploy

**Mål:** Kartan är tillgänglig (WCAG AA), polishad och driftsatt.

### Steg

- [ ] **7.1** Tillgänglighet:
  - `<ComposableMap>` får `role="img"` och `aria-label`
  - Tangentbordsnavigation: `<Geography>` är fokuserbara med `tabIndex`, reagerar på Enter/Space
  - Reducerad rörelse: `@media (prefers-reduced-motion: reduce)` stänger av animationer
  - Kontrast: verifiera att alla pin-färger uppfyller WCAG AA mot bakgrunden

- [ ] **7.2** Laddningstillstånd:
  - Visa skelett/spinner medan GeoJSON laddas
  - Felhantering om GeoJSON misslyckas att laddas

- [ ] **7.3** Prestanda:
  - `React.memo` på `<Geography>` om nödvändigt (kartan är stor)
  - GeoJSON-fil ska vara komprimerad (minimera detaljeringsgrad via mapshaper.org om >500 KB)
  - Lazy-load sidan med `React.lazy` och `<Suspense>`

- [ ] **7.4** Mobil-polish:
  - Touch-zoom fungerar via `ZoomableGroup`
  - Bottom sheet (resurskort) animeras korrekt
  - Filterpanelen scrollar horisontellt utan layoutproblem

- [ ] **7.5** Korswebbläsartestning: Chrome, Firefox, Safari (iOS + macOS)

- [ ] **7.6** `npm run build` – inga TypeScript-fel

- [ ] **7.7** Commit + push → deploy action körs

- [ ] **7.8** Uppdatera `resources_map_todo.md` – markera fas 7 klar och sätt slutstatus

---

## Tekniska noteringar

### GeoJSON-datakälla för svenska kommuner

Rekommenderade alternativ (alla öppna data):
1. **SCB Geodata** – [scb.se/vara-tjanster/geodata](https://www.scb.se/vara-tjanster/geodata/) – Officiella NUTS-gränser
2. **Naturvårdsverkets Geodatakatalog** – GeoJSON för administrativa gränser
3. **OpenStreetMap/Geofabrik** – `sweden-latest.osm.pbf`, extrahera admin_level=7 (kommuner)
4. **GitHub repos** – sök `sweden municipalities geojson` på GitHub (flera finns med MIT-licens)

> Konvertera till TopoJSON med `geo2topo` för mindre filstorlek om källa ger GeoJSON.

### Filer som skapas under implementationen

```
frontend/
  public/
    sweden-municipalities.json    ← TopoJSON för kommuner
    sweden-counties.json          ← TopoJSON för län (initial vy)
  src/
    data/
      resources.ts                ← Alla resurser som TS-data
    components/
      ResourcesMap.tsx            ← Huvudkartkomponent
      ResourcesMap.css
      ResourceInfoCard.tsx        ← Informationskort vid pin-klick
      ResourceInfoCard.css
      NationalResourcesList.tsx   ← Lista för nationella resurser
      NationalResourcesList.css
    pages/
      Resources.tsx               ← Sida /resurser
      Resources.css
```

### Beroenden att installera

```bash
cd frontend
npm install react-simple-maps topojson-client
npm install --save-dev @types/topojson-client
```

> `d3-geo` ingår transitively via `react-simple-maps`.  
> Ingen Leaflet/Mapbox behövs – vi håller det SVG-baserat för att matcha sajtstilen.

---

## Framtida förbättringar (backlog)

- **Admin-gränssnitt** för att lägga till/redigera resurser via befintligt backend (CMS)
- **Sökning** efter ort eller resursnamn
- **Automatisk positionering** (geolocation API) för att visa närmaste resurser
- **1177-integration** – hämta psykiatriska mottagningar via 1177 öppet API
- **Flerspråkig data** – engelska resursbeskrivningar
- **Klustring** om många nålar överlappas (t.ex. Stockholm)
- **QR-kod** för att dela specifik resurs
