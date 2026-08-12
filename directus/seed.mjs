/**
 * Directus bootstrap script.
 * Creates collections, sets public permissions, and seeds initial content.
 * Runs once as a one-shot Docker service after Directus is up.
 * Idempotent — safe to re-run.
 */

const BASE = process.env.DIRECTUS_URL ?? 'http://directus:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForDirectus() {
  console.log('⏳ Waiting for Directus…');
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`${BASE}/server/health`);
      if (res.ok) {
        const body = await res.json();
        if (body.status === 'ok') { console.log('✓ Directus is ready.'); return; }
      }
    } catch {}
    await sleep(3000);
  }
  throw new Error('Directus did not become ready within 4 minutes.');
}

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const data = await res.json();
  if (!data.data?.access_token) throw new Error(`Login failed: ${JSON.stringify(data)}`);
  console.log('✓ Logged in.');
  return data.data.access_token;
}

async function api(token, method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function collectionExists(token, name) {
  const data = await api(token, 'GET', `/collections/${name}`);
  return !data.errors;
}

async function fieldExists(token, collection, field) {
  const data = await api(token, 'GET', `/fields/${collection}/${field}`);
  return !data.errors;
}

async function relationExists(token, collection, field) {
  const data = await api(token, 'GET', `/relations/${collection}/${field}`);
  return !data.errors;
}

async function createCollection(token, name, icon, note) {
  if (await collectionExists(token, name)) {
    console.log(`  ↩ Collection '${name}' already exists.`);
    return;
  }
  const data = await api(token, 'POST', '/collections', {
    collection: name,
    meta: { icon, note, singleton: false },
    schema: {},
    fields: [
      {
        field: 'id',
        type: 'integer',
        meta: { hidden: true, interface: 'input', readonly: true },
        schema: { is_primary_key: true, has_auto_increment: true },
      },
    ],
  });
  console.log(`  ✓ Created collection '${name}'.`, data.errors ?? '');
}

async function flowExists(token, name) {
  const data = await api(token, 'GET', `/flows?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`);
  return (data.data?.length ?? 0) > 0;
}

// Creates a Flow that emails the org whenever a contact form submission is created.
// The recipient is fixed (never taken from the submitted payload) to avoid the
// flow being abused to relay mail to an attacker-chosen address.
async function ensureContactNotificationFlow(token) {
  const FLOW_NAME = 'Kontaktformulär — e-postnotis';
  if (await flowExists(token, FLOW_NAME)) {
    console.log(`  ↩ Flow '${FLOW_NAME}' already exists.`);
    return;
  }

  const notifyTo = process.env.CONTACT_NOTIFICATION_EMAIL || 'info@livslusths.se';

  const flow = await api(token, 'POST', '/flows', {
    name: FLOW_NAME,
    icon: 'mail',
    status: 'active',
    trigger: 'event',
    accountability: 'all',
    options: {
      type: 'action',
      scope: ['items.create'],
      collections: ['contact_submissions'],
    },
  });
  if (flow.errors || !flow.data?.id) {
    console.log(`  ✗ Failed to create flow '${FLOW_NAME}'.`, flow.errors ?? flow);
    return;
  }

  const operation = await api(token, 'POST', '/operations', {
    flow: flow.data.id,
    key: 'send_notification_email',
    type: 'mail',
    position_x: 19,
    position_y: 1,
    options: {
      to: notifyTo,
      type: 'wysiwyg',
      subject: 'Nytt meddelande via kontaktformuläret – {{$trigger.payload.name}}',
      replyTo: '{{$trigger.payload.email}}',
      body:
        '<p>Ett nytt meddelande har skickats via kontaktformuläret på webbplatsen.</p>' +
        '<p><strong>Namn:</strong> {{$trigger.payload.name}}<br>' +
        '<strong>E-post:</strong> {{$trigger.payload.email}}</p>' +
        '<p><strong>Meddelande:</strong><br>{{$trigger.payload.message}}</p>',
    },
  });
  if (operation.errors || !operation.data?.id) {
    console.log(`  ✗ Failed to create mail operation for flow '${FLOW_NAME}'.`, operation.errors ?? operation);
    return;
  }

  await api(token, 'PATCH', `/flows/${flow.data.id}`, { operation: operation.data.id });
  console.log(`  ✓ Created flow '${FLOW_NAME}' → emails ${notifyTo} on new contact submissions.`);
}

async function ensureField(token, collection, fieldDef) {
  if (await fieldExists(token, collection, fieldDef.field)) {
    console.log(`  ↩ Field '${collection}.${fieldDef.field}' already exists.`);
    return;
  }
  const data = await api(token, 'POST', `/fields/${collection}`, fieldDef);
  console.log(`  ✓ Created field '${collection}.${fieldDef.field}'.`, data.errors ?? '');
}

async function ensureRelation(token, collection, field, relatedCollection) {
  if (await relationExists(token, collection, field)) {
    console.log(`  ↩ Relation '${collection}.${field}' already exists.`);
    return;
  }
  const data = await api(token, 'POST', '/relations', {
    collection,
    field,
    related_collection: relatedCollection,
  });
  console.log(`  ✓ Created relation '${collection}.${field}' → '${relatedCollection}'.`, data.errors ?? '');
}

async function ensurePublicPermission(token, collection, action) {
  const qs = `filter[role][_null]=true&filter[collection][_eq]=${collection}&filter[action][_eq]=${action}`;
  const data = await api(token, 'GET', `/permissions?${qs}`);
  if (data.data?.length > 0) {
    console.log(`  ↩ Public ${action} on '${collection}' already set.`);
    return;
  }
  const result = await api(token, 'POST', '/permissions', {
    role: null,
    collection,
    action,
    fields: '*',
  });
  console.log(`  ✓ Public ${action} on '${collection}'.`, result.errors ?? '');
}

const CONTENT_ITEMS = [
  { section: 'hero_title',    language: 'sv', body: 'Du är inte ensam i din sorg' },
  { section: 'hero_subtitle', language: 'sv', body: 'Vi är en ideell förening som stödjer efterlevande efter självmord — anhöriga, vänner och närstående som förlorat någon de älskade.' },
  { section: 'about_heading', language: 'sv', body: 'Om oss' },
  { section: 'about_body',    language: 'sv', body: 'Livslust och hållbart stöd grundades av efterlevande, för efterlevande. Vi vet av erfarenhet hur överväldigande sorgen kan kännas, och hur viktigt det är att möta människor som verkligen förstår. Vår förening erbjuder en trygg plats att dela, läka och hitta vägen vidare — i din egen takt, utan krav.' },
  { section: 'offer_heading', language: 'sv', body: 'Vad vi erbjuder' },
  { section: 'offer_groups',  language: 'sv', body: 'Vi håller regelbundna stödgrupper i Stockholm och online, där du kan möta andra i liknande situation.' },
  { section: 'offer_talk',    language: 'sv', body: 'Enskilda samtal med en frivilligstödjare som lyssnar utan att döma och förstår förlusten.' },
  { section: 'offer_resources', language: 'sv', body: 'Boktips, artiklar och guider om sorgbearbetning och självmordsförlust — på svenska och engelska.' },
  { section: 'contact_intro', language: 'sv', body: 'Hör av dig till oss — vi svarar så snart vi kan. Du behöver inte ha alla ord redo. Vi lyssnar.' },

  { section: 'hero_title',    language: 'en', body: 'You are not alone in your grief' },
  { section: 'hero_subtitle', language: 'en', body: 'We are a non-profit organisation supporting suicide loss survivors — family members, friends and loved ones who have lost someone to suicide.' },
  { section: 'about_heading', language: 'en', body: 'About us' },
  { section: 'about_body',    language: 'en', body: 'Livslust och hållbart stöd was founded by survivors for survivors. We know from experience how overwhelming grief can feel, and how important it is to meet people who truly understand. Our organisation offers a safe place to share, heal and find a way forward — at your own pace, without expectations.' },
  { section: 'offer_heading', language: 'en', body: 'What we offer' },
  { section: 'offer_groups',  language: 'en', body: 'We hold regular support groups in Stockholm and online, where you can meet others in similar situations.' },
  { section: 'offer_talk',    language: 'en', body: 'One-on-one conversations with a volunteer supporter who listens without judgement and understands the loss.' },
  { section: 'offer_resources', language: 'en', body: 'Book recommendations, articles and guides on grief and suicide loss — in Swedish and English.' },
  { section: 'contact_intro', language: 'en', body: 'Reach out to us — we will reply as soon as we can. You do not need to have all the words ready. We listen.' },
];

async function seedContent(token) {
  for (const item of CONTENT_ITEMS) {
    const qs = `filter[section][_eq]=${item.section}&filter[language][_eq]=${item.language}&limit=1`;
    const existing = await api(token, 'GET', `/items/page_content?${qs}`);
    if (existing.data?.length > 0) {
      console.log(`  ↩ Content '${item.section}' (${item.language}) already exists.`);
      continue;
    }
    const result = await api(token, 'POST', '/items/page_content', item);
    console.log(`  ✓ Seeded '${item.section}' (${item.language}).`, result.errors ?? '');
  }
}

const EVENT_URL_KNATA = 'https://www.medborgarskolan.se/arrangemang-sok/knata-prata-for-efterlevande-till-suicid-med-livslust-hallbart-stod-1504163/';

const SEED_EVENTS = [
  {
    status: 'published',
    language: 'sv',
    title: 'Knata och Prata',
    tagline: 'För efterlevande till suicid',
    event_date: '2026-04-09',
    time_label: 'kl 18:00-19:00',
    location: 'Hotell Östersund, Kyrkgatan 70, Östersund',
    organizers: 'Micke Eklund & Sune Mets',
    description: 'En promenad och samtal för dig som mist någon i suicid. Micke och Sune, båda grundare av Livslust och själva efterlevande, leder träffen. Gå i din takt och dela så mycket eller lite du vill. Varmt välkommen!',
    external_url: EVENT_URL_KNATA,
    badge: 'Gratis',
    partner: 'Medborgarskolan',
  },
  {
    status: 'published',
    language: 'en',
    title: 'Knata och Prata',
    tagline: 'For survivors of suicide loss',
    event_date: '2026-04-09',
    time_label: '18:00-19:00',
    location: 'Hotell Östersund, Kyrkgatan 70, Östersund',
    organizers: 'Micke Eklund & Sune Mets',
    description: 'A walk and talk session for those who have lost someone to suicide. Micke and Sune, both founders of Livslust and suicide loss survivors themselves, lead the session. Walk at your own pace and share as much or as little as you like. Warmly welcome!',
    external_url: EVENT_URL_KNATA,
    badge: 'Free',
    partner: 'Medborgarskolan',
  },
  {
    status: 'published',
    language: 'sv',
    title: 'Samtalsträff och Knata & Prata',
    tagline: 'För efterlevande till suicid',
    event_date: '2026-05-07',
    time_label: 'kl 18:00-19:00',
    location: 'Hotell Östersund, Kyrkgatan 70, Östersund',
    organizers: 'Micke Eklund & Sune Mets',
    description: 'En kväll med samtalsträff och promenad för dig som mist någon i suicid. Vi börjar med en stunds samtal i en trygg och öppen miljö, följt av en promenad för de som vill. Micke och Sune, båda grundare av Livslust och själva efterlevande, leder träffen. Dela så mycket eller lite du vill. Varmt välkommen!',
    external_url: EVENT_URL_KNATA,
    badge: 'Gratis',
    partner: 'Medborgarskolan',
  },
  {
    status: 'published',
    language: 'en',
    title: 'Support Gathering and Walk & Talk',
    tagline: 'For survivors of suicide loss',
    event_date: '2026-05-07',
    time_label: '18:00-19:00',
    location: 'Hotell Östersund, Kyrkgatan 70, Östersund',
    organizers: 'Micke Eklund & Sune Mets',
    description: 'An evening with a support gathering and walk for those who have lost someone to suicide. We begin with a conversation in a safe and open setting, followed by a walk for those who wish. Micke and Sune, both founders of Livslust and suicide loss survivors themselves, lead the session. Share as much or as little as you like. Warmly welcome!',
    external_url: EVENT_URL_KNATA,
    badge: 'Free',
    partner: 'Medborgarskolan',
  },
  {
    status: 'published',
    language: 'sv',
    title: 'Samtalsträff och Knata & Prata',
    tagline: 'För efterlevande till suicid',
    event_date: '2026-06-18',
    time_label: 'kl 18:00-19:00',
    location: 'Gevåg',
    organizers: 'Micke Eklund & Sune Mets',
    description: 'En kväll med samtalsträff och promenad för dig som mist någon i suicid. Vi börjar med en stunds samtal i en trygg och öppen miljö, följt av en promenad för de som vill. Micke och Sune, båda grundare av Livslust och själva efterlevande, leder träffen. Dela så mycket eller lite du vill. Varmt välkommen!',
    external_url: EVENT_URL_KNATA,
    badge: 'Gratis',
    partner: 'Medborgarskolan',
  },
  {
    status: 'published',
    language: 'en',
    title: 'Support Gathering and Walk & Talk',
    tagline: 'For survivors of suicide loss',
    event_date: '2026-06-18',
    time_label: '18:00-19:00',
    location: 'Gevåg',
    organizers: 'Micke Eklund & Sune Mets',
    description: 'An evening with a support gathering and walk for those who have lost someone to suicide. We begin with a conversation in a safe and open setting, followed by a walk for those who wish. Micke and Sune, both founders of Livslust and suicide loss survivors themselves, lead the session. Share as much or as little as you like. Warmly welcome!',
    external_url: EVENT_URL_KNATA,
    badge: 'Free',
    partner: 'Medborgarskolan',
  },
];

async function seedEvents(token) {
  for (const ev of SEED_EVENTS) {
    const qs = `filter[title][_eq]=${encodeURIComponent(ev.title)}&filter[event_date][_eq]=${ev.event_date}&filter[language][_eq]=${ev.language}&limit=1`;
    const existing = await api(token, 'GET', `/items/events?${qs}`);
    if (existing.data?.length > 0) {
      console.log(`  ↩ Event '${ev.title}' (${ev.language}) already exists.`);
      continue;
    }
    const result = await api(token, 'POST', '/items/events', ev);
    console.log(`  ✓ Seeded event '${ev.title}' (${ev.language}).`, result.errors ?? '');
  }
}

const SEED_POSTS = [
  {
    status: 'published',
    language: 'sv',
    slug: 'vi-startar-livslust',
    published_at: '2026-04-01',
    title: 'Vi startar Livslust och hållbart stöd',
    excerpt: 'Sorgen över att förlora någon till suicid är en av de tyngsta en människa kan bära. Det var ur den erfarenheten Livslust och hållbart stöd skapades.',
    body: `<p>Sorgen över att förlora någon till suicid är en av de tyngsta en människa kan bära. Den är ofta ensam. Den är ofta tyst. Och den omges av en skam och ett stigma som gör att många som drabbas drar sig för att tala om vad de bär på.</p>

<p>Det var ur den erfarenheten som Livslust och hållbart stöd skapades. Vi som grundat föreningen är själva efterlevande. Vi vet hur det känns att stå vid sidan av ett liv som fortsätter, medan man inuti bär på något som saknar ord. Vi vet hur viktigt det är att möta andra som förstår, inte för att de lärt sig om sorg, utan för att de levt den.</p>

<h3>Varför en förening?</h3>

<p>Det professionella stödet är viktigt och vi hänvisar alltid till det. Men vi tror på något utöver det: på mötets kraft. På att sitta i ett rum med andra som inte behöver förklara vad suicidförlust innebär. På att gå sida vid sida i naturen och prata litet eller mycket. På att höra att man inte är ensam och faktiskt känna det.</p>

<p>Livslust och hållbart stöd erbjuder samtalsträffar, Knata och Prata-grupper, digitala möten och föreläsningar. Allt ideellt. Allt av och för efterlevande.</p>

<h3>En plats att komma till</h3>

<p>Vår förhoppning är att föreningen ska vara en plats, både fysisk och digital, dit du kan komma som du är. Utan krav på att ha det bra. Utan krav på att ha ord. Bara en plats där du är välkommen, och där du vet att de som finns där förstår.</p>

<p>Vi är i startgroparna. Mycket är nytt. Men det viktigaste är på plats: viljan att finnas för varandra.</p>`,
    image_key: 'dawn_article.jpg',
    image_alt: 'Gryning över havet, ett nytt ljus bryter fram vid horisonten',
  },
  {
    status: 'published',
    language: 'en',
    slug: 'vi-startar-livslust',
    published_at: '2026-04-01',
    title: 'Starting Livslust och hållbart stöd',
    excerpt: 'The grief of losing someone to suicide is one of the heaviest a person can carry. It was from that experience that Livslust och hållbart stöd was created.',
    body: `<p>The grief of losing someone to suicide is one of the heaviest a person can carry. It is often lonely. It is often silent. And it is surrounded by a shame and stigma that makes many who are affected reluctant to speak about what they are carrying.</p>

<p>It was from that experience that Livslust och hållbart stöd was created. Those of us who founded the organisation are survivors ourselves. We know what it feels like to stand beside a life that keeps moving, while inside you carry something that has no words. We know how important it is to meet others who understand, not because they have studied grief, but because they have lived it.</p>

<h3>Why an organisation?</h3>

<p>Professional support is important and we always point people towards it. But we believe in something beyond that: the power of meeting. Of sitting in a room with others who do not need to have suicide loss explained to them. Of walking side by side in nature and talking a little or a lot. Of hearing that you are not alone and actually feeling it.</p>

<p>Livslust och hållbart stöd offers support gatherings, walk-and-talk groups, online meetings and lectures. All voluntary. All by and for survivors.</p>

<h3>A place to come to</h3>

<p>Our hope is that the organisation will be a place, both physical and digital, where you can come as you are. With no expectation that you are doing well. With no expectation that you have words. Just a place where you are welcome, and where you know that the people there understand.</p>

<p>We are just getting started. Much is new. But the most important thing is in place: the will to be there for one another.</p>`,
    image_key: 'dawn_article.jpg',
    image_alt: 'Dawn over the sea, a new light breaking through at the horizon',
  },
  {
    status: 'published',
    language: 'sv',
    slug: 'var-webbplats-ar-har',
    published_at: '2026-04-10',
    title: 'Vår webbplats är här, och vår Discord öppnar snart',
    excerpt: 'Idag lanserar vi livslusths.se. Det är en plats för information, kontakt och gemenskap, och det är bara början.',
    body: `<p>Idag lanserar vi vår webbplats. Den är enkel och ärlig, precis som vi vill att vår förening ska vara. Du hittar information om vilka vi är, vad vi gör och hur du kan komma i kontakt med oss. Du kan se kommande evenemang och spara dem i din kalender. Och du kan höra av dig, oavsett om du bär på ord eller inte.</p>

<h3>Vad vi hoppas att webbplatsen blir</h3>

<p>Vi ser webbplatsen som en dörr. En plats att börja, att känna sig trygg nog att ta ett första steg. Inte ett mål i sig, utan en väg in. Med tiden vill vi fortsätta fylla den med berättelser, resurser och möjligheter att hitta varandra.</p>

<h3>Discord, ett digitalt rum att träffas i</h3>

<p>Parallellt med lanseringen av webbplatsen håller vi på att starta en Discord-server. Discord är en chattplattform, lite som en digital mötesplats, där du kan finnas utan att behöva boka tid eller kliva in i ett fysiskt rum.</p>

<p>Tanken är enkel: ett ställe att vara. Att skriva när det känns tungt klockan tre på natten. Att fråga om du är den enda som reagerar på ett visst sätt, och höra ett "nej, jag känner igen det". Att följa med i vad föreningen gör, när du vill och i din takt.</p>

<p>Vi kommer att dela inbjudningslänken så snart servern är öppen. Följ oss på Instagram och Facebook för att inte missa det.</p>

<h3>Du är välkommen</h3>

<p>Oavsett om du precis förlorat någon eller om det hände för länge sedan. Oavsett om du är redo att dela eller bara vill lyssna. Det finns plats för dig här.</p>`,
    image_key: 'website_article.jpg',
    image_alt: 'Närbild på händer som håller en mobiltelefon med webbplatsen',
  },
  {
    status: 'published',
    language: 'en',
    slug: 'var-webbplats-ar-har',
    published_at: '2026-04-10',
    title: 'Our website is here, and our Discord opens soon',
    excerpt: 'Today we launch livslusths.se. It is a place for information, contact and community, and it is just the beginning.',
    body: `<p>Today we launch our website. It is simple and honest, just as we want our organisation to be. You will find information about who we are, what we do and how to get in touch. You can see upcoming events and save them to your calendar. And you can reach out, whether or not you have words ready.</p>

<h3>What we hope the website will become</h3>

<p>We see the website as a door. A place to start, to feel safe enough to take a first step. Not a destination in itself, but a way in. Over time we want to keep filling it with stories, resources and opportunities to find one another.</p>

<h3>Discord, a digital space to meet in</h3>

<p>Alongside the website launch, we are setting up a Discord server. Discord is a chat platform, a bit like a digital meeting place, where you can be present without needing to book an appointment or step into a physical room.</p>

<p>The idea is simple: a place to be. To write when it feels heavy at three in the morning. To ask whether you are the only one who reacts a certain way, and to hear "no, I recognise that". To follow what the organisation is doing, when you want and at your own pace.</p>

<p>We will share the invite link as soon as the server is open. Follow us on Instagram and Facebook so you do not miss it.</p>

<h3>You are welcome</h3>

<p>Whether you have just lost someone or it happened a long time ago. Whether you are ready to share or just want to listen. There is a place for you here.</p>`,
    image_key: 'website_article.jpg',
    image_alt: 'Close-up of hands holding a phone showing the website',
  },
  {
    status: 'published',
    language: 'sv',
    slug: 'internationella-dagen-forlorat-barn',
    published_at: '2026-07-03',
    title: 'Internationella dagen för föräldrar som förlorat barn – 3 juli',
    excerpt: 'Idag uppmärksammas Internationella dagen för föräldrar som förlorat barn – en dag som ägnas åt alla föräldrar som mist ett barn. Det är en dag för att se sorgen, för att hålla minnet levande, och för att påminna oss om att ingen förälder ska behöva gå igenom denna smärta ensam.',
    body: `<p>Idag, den 3 juli, uppmärksammas <strong>Internationella dagen för föräldrar som förlorat barn</strong> – en dag som ägnas åt alla föräldrar som mist ett barn. Oavsett hur länge sedan förlusten inträffade, oavsett barnets ålder, oavsett omständigheterna. Det är en dag för att se sorgen, för att hålla minnet levande, och för att påminna oss om att ingen förälder ska behöva gå igenom denna smärta ensam.</p>
<h2>En förlust som förändrar allt</h2>
<p>Att förlora ett barn beskrivs ofta som det värsta en människa kan genomgå. Det är en förlust som vänder upp och ner på hela ens existens, som utmanar allt vi trodde vi visste om världen och livet. Förväntningarna, drömmarna, framtiden, allt förändras.</p>
<p>Utöver den ofattbara sorgen finns ofta frågorna som aldrig får svar: <em>Varför? Kunde jag ha gjort något annorlunda? Varför såg jag det inte?</em> Skulden och skammen kan bli överväldigande. Många av oss bär en tystnad kring hur vårat barn dog, rädslan för andras domar, för att bli missförstådd bland oändligt mycket mer.</p>
<h2>Att leva med sorgen</h2>
<p>Sorg efter ett barn är ingen resa med ett tydligt slut. Det är inte något som "läker" eller "blir färdigt". Det är snarare något vi lär oss att bära, dag för dag. Vissa dagar känns lättare än andra. Vissa dagar är sorgen lika rå och överväldigande som den första dagen.</p>
<p>Det är viktigt att veta att det inte finns något rätt sätt att sörja. Ingen tidtabell, ingen instruktionsbok. Din sorg är din egen, och den får ta den tid den behöver. Kanske märker du att du behöver prata om ditt barn varje dag. Kanske behöver du perioder av tystnad. Kanske hittar du tröst i minnesstunder, fotografier och berättelser. Kanske behöver du ibland ta avstånd för att orka.</p>
<p>Allt detta är okej. Du gör så gott du kan, och det räcker.</p>
<h2>Sorgens många ansikten</h2>
<p>För många föräldrar kommer sorgen i vågor. Det kan vara utlösare som får allt att rasa – en doft, en sång, ett datum i kalendern. Födelsedagar, högtidsdagar, årsdagar av dödsfall. Men också oväntade stunder: att se ett barn i samma ålder som ditt skulle ha varit, att höra någon skratta på samma sätt.</p>
<p>Vissa dagar känns sorgen fysisk. En tyngd i bröstet, en knöl i magen, trötthet som inte går att vila bort. Kroppen minns, även när vi försöker glömma.</p>
<p>Och så finns ilskan. Ilska mot världen som inte stannade upp. Ilska mot människor som säger fel saker eller tiger när vi behöver att de säger något. Ilska mot oss själva, mot livet, kanske till och med mot vårt barn som lämnade oss.</p>
<p>Alla dessa känslor är giltiga. De är en del av sorgen, en del av kärleken vi bär.</p>
<p>Suicid är fortfarande tabu i de flesta sammanhang. Människor vet inte vad de ska säga, så de säger ingenting. Eller så säger de saker som gör ont, även om de menar väl.</p>
<p>Sanningen är att psykisk ohälsa och suicidtankar ofta är osynliga, även för de som står oss närmast. Många som tar sitt liv visar inga tydliga varningstecken. Många kämpar i det tysta. Och även när vi såg att något inte stod rätt till, kunde vi inte alltid förstå hur allvarligt det var.</p>
<h2>Mening och sammanhang</h2>
<p>I sorgen finns också en stark längtan efter sammanhang. Vi vill förstå. Vi vill hitta en mening i det meningslösa. För många av oss blir det viktigt att göra något av vår sorg, att omvandla smärtan till något som kan hjälpa andra.</p>
<p>Kanske blir det ett engagemang i föreningar. Kanske blir det att dela sin berättelse, att bryta tystnaden kring suicid och psykisk ohälsa. Kanske blir det att stötta andra sörjande, att finnas där på det sätt vi själva önskat att någon funnits för oss.</p>
<p>Det finns ingen skyldighet att göra sorgen till något "användbart". Men för många blir det en väg framåt.</p>
<h2>Du är inte ensam</h2>
<p>Det är lätt att känna sig ensam i sorgen. Särskilt när samhället förväntar sig att vi ska "gå vidare" efter en viss tid. När vännerna slutar ringa, när kollegor inte längre frågar hur det går, när livet för alla andra verkar ha återgått till det normala.</p>
<p>Men du är inte ensam. Det finns många av oss som bär samma sorg, samma saknad. Och även om ingen kan ta bort smärtan, kan gemenskap göra den lite lättare att bära.</p>
<p>Livslust och hållbart stöd erbjuder samtalsträffar, Knata och Prata-grupper och digitala möten för efterlevande till suicid. Här kan du träffa andra som förstår, som inte kräver förklaringar, som vet hur det känns. Vi delar våra berättelser, våra tårar, vår ilska och vår saknad. Och ibland, med tiden, också våra leenden och minnen.</p>
<p>Vi har samtalsträffar i Östersund, Skellefteå, Strömsund, Gevåg och Ystad. Vi finns digitalt för dig som inte kan ta dig till en fysisk träff. Allt är gratis, allt är ideellt, allt drivs av och för efterlevande.</p>
<p>Andra stödresurser</p>
<p>Utöver Livslust finns andra organisationer som erbjuder stöd till sörjande föräldrar:</p>
<ul>
<li><strong>SPES – Riksförbundet för suicidprevention och efterlevandes stöd</strong> erbjuder stödlinjer och lokala stödgrupper över hela landet.</li>
<li><strong>Spädbarnsfonden</strong> ger stöd till föräldrar som förlorat barn tidigt i livet.</li>
<li><strong>RSMH – Riksförbundet för social och mental hälsa</strong> har grupper och nätverk för anhöriga.</li>
<li><strong>Mind</strong> erbjuder stödsamtal för både efterlevande och anhöriga till personer med psykisk ohälsa.</li>
<li><strong>1177 Vårdguiden</strong> kan ge information om sorgestöd och var du kan söka professionell hjälp.</li>
</ul>
<p>Du behöver inte gå igenom detta ensam. Det finns händer att hålla i, axlar att gråta på, människor som ser dig.</p>
<h2>Ett minne att bära framåt</h2>
<p>Internationella dagen för föräldrar som förlorat barn är inte en dag för att "komma över" sorgen. Det är en dag för att känna den, för att ge den rum, för att hedra våra barn och den kärlek vi bär.</p>
<p>Ditt barn levde. Och den kärleken försvinner aldrig.</p>
<p>Idag tänder vi ljus. Vi säger deras namn. Vi delar deras berättelser. Vi påminner världen och oss själva om att de fanns, att de betydde något, att de fortfarande betyder allt.</p>
<p>Och vi påminner varandra att vi bär detta tillsammans.</p>
<hr>
<p>Om du är efterlevande till suicid och behöver stöd, tveka inte att höra av dig till oss på Livslust och hållbart stöd. Du når oss på info@livslusths.se. Våra samtalsträffar och grupper är öppna för alla som förlorat någon i suicid. Ingen ska behöva gå igenom detta ensam.</p>
<p>I akut kris, kontakta Självmordslinjen: 90101 (öppet kl. 17-24 varje dag) eller Mind Självmordsupplysningen: 020-18 18 00.</p>`,
    image_key: 'hero7.jpg',
    image_alt: 'Solljus som filtrerar genom trädgrenar',
  },
  {
    status: 'published',
    language: 'en',
    slug: 'internationella-dagen-forlorat-barn',
    published_at: '2026-07-03',
    title: 'International Bereaved Parents Day – July 3rd',
    excerpt: 'Today marks International Bereaved Parents Day – a day dedicated to all parents who have lost a child. It is a day to acknowledge grief, to keep memories alive, and to remind ourselves that no parent should have to go through this pain alone.',
    body: `<p>Today, July 3rd, marks <strong>International Bereaved Parents Day</strong> – a day dedicated to all parents who have lost a child. Regardless of how long ago the loss occurred, regardless of the child's age, regardless of the circumstances. It is a day to acknowledge grief, to keep memories alive, and to remind ourselves that no parent should have to go through this pain alone.</p>
<h2>A loss that changes everything</h2>
<p>Losing a child is often described as the worst thing a person can experience. It is a loss that turns your entire existence upside down, challenging everything we thought we knew about the world and life. Expectations, dreams, the future – everything changes.</p>
<p>Beyond the unfathomable grief, there are often questions that never get answered: <em>Why? Could I have done something differently? Why didn't I see it?</em> Guilt and shame can become overwhelming. Many of us carry a silence about how our child died, the fear of others' judgments, of being misunderstood, among infinitely more.</p>
<h2>Living with grief</h2>
<p>Grief after losing a child is not a journey with a clear end. It is not something that "heals" or "gets finished". Rather, it is something we learn to carry, day by day. Some days feel easier than others. Some days the grief is as raw and overwhelming as the first day.</p>
<p>It is important to know that there is no right way to grieve. No timeline, no instruction manual. Your grief is your own, and it may take the time it needs. Perhaps you find that you need to talk about your child every day. Perhaps you need periods of silence. Perhaps you find comfort in memories, photographs and stories. Perhaps you sometimes need to take distance to cope.</p>
<p>All of this is okay. You are doing the best you can, and that is enough.</p>
<h2>The many faces of grief</h2>
<p>For many parents, grief comes in waves. There can be triggers that make everything collapse – a scent, a song, a date on the calendar. Birthdays, holidays, death anniversaries. But also unexpected moments: seeing a child the same age your child would have been, hearing someone laugh in the same way.</p>
<p>Some days grief feels physical. A weight in the chest, a knot in the stomach, tiredness that cannot be rested away. The body remembers, even when we try to forget.</p>
<p>And then there is anger. Anger at the world that did not stop. Anger at people who say the wrong things or stay silent when we need them to say something. Anger at ourselves, at life, perhaps even at our child who left us.</p>
<p>All these feelings are valid. They are part of grief, part of the love we carry.</p>
<p>Suicide is still taboo in most contexts. People do not know what to say, so they say nothing. Or they say things that hurt, even though they mean well.</p>
<p>The truth is that mental illness and suicidal thoughts are often invisible, even to those closest to us. Many who take their own lives show no clear warning signs. Many struggle in silence. And even when we saw that something was not right, we could not always understand how serious it was.</p>
<h2>Meaning and context</h2>
<p>In grief there is also a strong longing for context. We want to understand. We want to find meaning in the meaningless. For many of us, it becomes important to do something with our grief, to transform the pain into something that can help others.</p>
<p>Perhaps it becomes an engagement in associations. Perhaps it becomes sharing one's story, breaking the silence around suicide and mental illness. Perhaps it becomes supporting other grieving people, being there in the way we ourselves wished someone had been for us.</p>
<p>There is no obligation to make grief "useful". But for many, it becomes a way forward.</p>
<h2>You are not alone</h2>
<p>It is easy to feel alone in grief. Especially when society expects us to "move on" after a certain time. When friends stop calling, when colleagues no longer ask how things are going, when life for everyone else seems to have returned to normal.</p>
<p>But you are not alone. There are many of us who carry the same grief, the same longing. And even though no one can take away the pain, community can make it a little easier to bear.</p>
<p>Livslust och hållbart stöd offers support gatherings, Walk &amp; Talk groups and digital meetings for suicide loss survivors. Here you can meet others who understand, who do not require explanations, who know how it feels. We share our stories, our tears, our anger and our longing. And sometimes, with time, also our smiles and memories.</p>
<p>We have support gatherings in Östersund, Skellefteå, Strömsund, Gevåg and Ystad. We are available digitally for those who cannot attend a physical meeting. Everything is free, everything is voluntary, everything is run by and for survivors.</p>
<p>Other support resources</p>
<p>In addition to Livslust, there are other organisations that offer support to bereaved parents:</p>
<ul>
<li><strong>SPES – The National Association for Suicide Prevention and Support for the Bereaved</strong> offers support lines and local support groups throughout the country.</li>
<li><strong>Spädbarnsfonden (The Infant Fund)</strong> provides support to parents who have lost children early in life.</li>
<li><strong>RSMH – The Swedish National Association for Social and Mental Health</strong> has groups and networks for relatives.</li>
<li><strong>Mind</strong> offers support calls for both survivors and relatives of people with mental illness.</li>
<li><strong>1177 Healthcare Guide</strong> can provide information about grief support and where you can seek professional help.</li>
</ul>
<p>You do not have to go through this alone. There are hands to hold, shoulders to cry on, people who see you.</p>
<h2>A memory to carry forward</h2>
<p>International Bereaved Parents Day is not a day to "get over" grief. It is a day to feel it, to give it space, to honour our children and the love we carry.</p>
<p>Your child lived. And that love never disappears.</p>
<p>Today we light candles. We say their names. We share their stories. We remind the world and ourselves that they existed, that they mattered, that they still mean everything.</p>
<p>And we remind each other that we carry this together.</p>
<hr>
<p>If you are a suicide loss survivor and need support, please do not hesitate to contact us at Livslust och hållbart stöd. You can reach us at info@livslusths.se. Our support gatherings and groups are open to everyone who has lost someone to suicide. No one should have to go through this alone.</p>
<p>In an acute crisis, contact the Suicide Hotline: 90101 (open 5pm-midnight every day) or Mind Suicide Information: 020-18 18 00.</p>`,
    image_key: 'hero7.jpg',
    image_alt: 'Sunlight filtering through tree branches',
  },
];

async function seedPosts(token) {
  for (const post of SEED_POSTS) {
    const qs = `filter[title][_eq]=${encodeURIComponent(post.title)}&filter[language][_eq]=${post.language}&limit=1`;
    const existing = await api(token, 'GET', `/items/posts?${qs}`);
    if (existing.data?.length > 0) {
      console.log(`  ↩ Post '${post.title}' (${post.language}) already exists.`);
      continue;
    }
    const result = await api(token, 'POST', '/items/posts', post);
    console.log(`  ✓ Seeded post '${post.title}' (${post.language}).`, result.errors ?? '');
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Posts created before the `slug` field existed (e.g. via the admin UI) have no slug,
// which breaks their /blog/:slug links. Backfill a unique slug for any post missing one.
async function backfillPostSlugs(token) {
  const data = await api(token, 'GET', '/items/posts?fields=id,slug,title&limit=-1');
  const posts = data.data ?? [];
  const missing = posts.filter(p => !p.slug);
  if (missing.length === 0) {
    console.log('  ↩ All posts already have a slug.');
    return;
  }
  const usedSlugs = new Set(posts.map(p => p.slug).filter(Boolean));
  for (const post of missing) {
    const base = slugify(post.title) || `post-${post.id}`;
    let slug = base;
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${base}-${n++}`;
    }
    usedSlugs.add(slug);
    const result = await api(token, 'PATCH', `/items/posts/${post.id}`, { slug });
    console.log(`  ✓ Backfilled slug '${slug}' for post '${post.title}'.`, result.errors ?? '');
  }
}

async function main() {
  await waitForDirectus();
  const token = await login();

  console.log('\n📁 Collections…');
  await createCollection(token, 'page_content', 'article', 'Website content by section and language');
  await createCollection(token, 'contact_submissions', 'mail', 'Contact form submissions from the website');
  await createCollection(token, 'events', 'event', 'Upcoming events shown on the website');
  await createCollection(token, 'posts', 'post', 'News and blog articles shown on the website');

  console.log('\n🔧 Fields — page_content…');
  await ensureField(token, 'page_content', {
    field: 'section', type: 'string',
    meta: { interface: 'input', width: 'half', required: true, note: 'e.g. hero_title, about_body' },
    schema: { is_nullable: false, max_length: 255 },
  });
  await ensureField(token, 'page_content', {
    field: 'language', type: 'string',
    meta: {
      interface: 'select-dropdown', width: 'half', required: true,
      options: { choices: [{ text: 'Svenska', value: 'sv' }, { text: 'English', value: 'en' }] },
    },
    schema: { is_nullable: false, max_length: 10, default_value: 'sv' },
  });
  await ensureField(token, 'page_content', {
    field: 'body', type: 'text',
    meta: { interface: 'input-multiline', width: 'full' },
    schema: { is_nullable: true },
  });
  await ensureField(token, 'page_content', {
    field: 'updated_at', type: 'timestamp',
    meta: { interface: 'datetime', width: 'half', readonly: true, special: ['date-updated'] },
    schema: { is_nullable: true },
  });

  console.log('\n🔧 Fields — contact_submissions…');
  await ensureField(token, 'contact_submissions', {
    field: 'name', type: 'string',
    meta: { interface: 'input', width: 'half', required: true },
    schema: { is_nullable: false, max_length: 255 },
  });
  await ensureField(token, 'contact_submissions', {
    field: 'email', type: 'string',
    meta: { interface: 'input', width: 'half', required: true },
    schema: { is_nullable: false, max_length: 255 },
  });
  await ensureField(token, 'contact_submissions', {
    field: 'message', type: 'text',
    meta: { interface: 'input-multiline', width: 'full', required: true },
    schema: { is_nullable: false },
  });
  await ensureField(token, 'contact_submissions', {
    field: 'created_at', type: 'timestamp',
    meta: { interface: 'datetime', width: 'half', readonly: true, special: ['date-created'] },
    schema: { is_nullable: true },
  });

  console.log('\n� Fields — events…');
  await ensureField(token, 'events', {
    field: 'status', type: 'string',
    meta: {
      interface: 'select-dropdown', width: 'half', required: true,
      options: { choices: [{ text: 'Publicerad', value: 'published' }, { text: 'Utkast', value: 'draft' }] },
      note: 'Välj "Publicerad" för att visa eventet på webbplatsen.',
    },
    schema: { is_nullable: false, default_value: 'published' },
  });
  await ensureField(token, 'events', {
    field: 'language', type: 'string',
    meta: {
      interface: 'select-dropdown', width: 'half', required: true,
      options: { choices: [{ text: 'Svenska', value: 'sv' }, { text: 'English', value: 'en' }] },
    },
    schema: { is_nullable: false, max_length: 10, default_value: 'sv' },
  });
  await ensureField(token, 'events', {
    field: 'title', type: 'string',
    meta: { interface: 'input', width: 'full', required: true, note: 'Namn på eventet, t.ex. "Knata och Prata"' },
    schema: { is_nullable: false, max_length: 255 },
  });
  await ensureField(token, 'events', {
    field: 'tagline', type: 'string',
    meta: { interface: 'input', width: 'full', note: 'Kort beskrivning under titeln, t.ex. "För efterlevande till suicid"' },
    schema: { is_nullable: true, max_length: 255 },
  });
  await ensureField(token, 'events', {
    field: 'event_date', type: 'date',
    meta: { interface: 'datetime', width: 'half', required: true, note: 'Datum för eventet (används för sortering)' },
    schema: { is_nullable: false },
  });
  await ensureField(token, 'events', {
    field: 'time_label', type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Tidsetikett, t.ex. "kl 18:00-19:00"' },
    schema: { is_nullable: true, max_length: 100 },
  });
  await ensureField(token, 'events', {
    field: 'location', type: 'string',
    meta: { interface: 'input', width: 'full', note: 'Venue och adress, t.ex. "Hotell Östersund, Kyrkgatan 70, Östersund"' },
    schema: { is_nullable: true, max_length: 500 },
  });
  await ensureField(token, 'events', {
    field: 'organizers', type: 'string',
    meta: { interface: 'input', width: 'full', note: 'Namn på arrangörer, t.ex. "Micke Eklund & Sune Mets"' },
    schema: { is_nullable: true, max_length: 255 },
  });
  await ensureField(token, 'events', {
    field: 'description', type: 'text',
    meta: { interface: 'input-multiline', width: 'full', note: 'Längre beskrivning av eventet' },
    schema: { is_nullable: true },
  });
  await ensureField(token, 'events', {
    field: 'external_url', type: 'string',
    meta: { interface: 'input', width: 'full', note: 'Länk till anmälan eller mer info (t.ex. Medborgarskolan)' },
    schema: { is_nullable: true, max_length: 2048 },
  });
  await ensureField(token, 'events', {
    field: 'badge', type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Liten etikett, t.ex. "Gratis"' },
    schema: { is_nullable: true, max_length: 100 },
  });
  await ensureField(token, 'events', {
    field: 'partner', type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Samarbetspartner, t.ex. "Medborgarskolan"' },
    schema: { is_nullable: true, max_length: 255 },
  });

  console.log('\n🔐 Public permissions…');
  await ensurePublicPermission(token, 'page_content', 'read');
  await ensurePublicPermission(token, 'contact_submissions', 'create');
  await ensurePublicPermission(token, 'events', 'read');
  await ensurePublicPermission(token, 'posts', 'read');
  await ensurePublicPermission(token, 'directus_files', 'read');

  console.log('\n🔧 Fields — posts…');
  await ensureField(token, 'posts', {
    field: 'status', type: 'string',
    meta: {
      interface: 'select-dropdown', width: 'half', required: true,
      options: { choices: [{ text: 'Publicerad', value: 'published' }, { text: 'Utkast', value: 'draft' }] },
      note: 'Välj "Publicerad" för att visa artikeln på webbplatsen.',
    },
    schema: { is_nullable: false, default_value: 'published' },
  });
  await ensureField(token, 'posts', {
    field: 'language', type: 'string',
    meta: {
      interface: 'select-dropdown', width: 'half', required: true,
      options: { choices: [{ text: 'Svenska', value: 'sv' }, { text: 'English', value: 'en' }] },
    },
    schema: { is_nullable: false, max_length: 10, default_value: 'sv' },
  });
  await ensureField(token, 'posts', {
    field: 'published_at', type: 'date',
    meta: { interface: 'datetime', width: 'half', required: true, note: 'Publiceringsdatum (används för sortering)' },
    schema: { is_nullable: false },
  });
  await ensureField(token, 'posts', {
    field: 'title', type: 'string',
    meta: { interface: 'input', width: 'full', required: true },
    schema: { is_nullable: false, max_length: 255 },
  });
  await ensureField(token, 'posts', {
    field: 'slug', type: 'string',
    meta: {
      interface: 'input', width: 'half', required: true,
      note: 'URL-vänlig identifierare, t.ex. "vi-startar-livslust". Använd SAMMA slug för både den svenska och engelska versionen av samma inlägg, så att länken fungerar oavsett språk.',
    },
    schema: { is_nullable: false, max_length: 255 },
  });
  await ensureField(token, 'posts', {
    field: 'excerpt', type: 'string',
    meta: { interface: 'input', width: 'full', note: 'Kort sammanfattning som visas på kortet (1-2 meningar)' },
    schema: { is_nullable: true, max_length: 500 },
  });
  await ensureField(token, 'posts', {
    field: 'body', type: 'text',
    meta: { interface: 'input-rich-text-html', width: 'full', note: 'Artikelns fullständiga text' },
    schema: { is_nullable: true },
  });
  await ensureField(token, 'posts', {
    field: 'image_key', type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Filnamn på bilden i images/-mappen, t.ex. "dawn_article.jpg"' },
    schema: { is_nullable: true, max_length: 255 },
  });
  await ensureField(token, 'posts', {
    field: 'image_alt', type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Beskrivning av bilden för skärmläsare (alt-text)' },
    schema: { is_nullable: true, max_length: 255 },
  });
  await ensureField(token, 'posts', {
    field: 'image', type: 'uuid',
    meta: {
      interface: 'file-image', width: 'half', special: ['file'],
      note: 'Ladda upp en bild för artikeln. Ersätter "image_key" för nya inlägg — äldre inlägg kan fortsätta använda image_key.',
    },
    schema: {
      is_nullable: true,
      foreign_key_table: 'directus_files',
      foreign_key_column: 'id',
    },
  });
  await ensureRelation(token, 'posts', 'image', 'directus_files');

  console.log('\n🌱 Seeding content…');
  await seedContent(token);
  await seedEvents(token);
  await seedPosts(token);
  await backfillPostSlugs(token);

  console.log('\n🔔 Flows…');
  await ensureContactNotificationFlow(token);

  console.log('\n✅ Directus setup complete.\n');
}

main().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
