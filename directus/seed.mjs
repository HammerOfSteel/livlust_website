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

async function ensureField(token, collection, fieldDef) {
  if (await fieldExists(token, collection, fieldDef.field)) {
    console.log(`  ↩ Field '${collection}.${fieldDef.field}' already exists.`);
    return;
  }
  const data = await api(token, 'POST', `/fields/${collection}`, fieldDef);
  console.log(`  ✓ Created field '${collection}.${fieldDef.field}'.`, data.errors ?? '');
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
    published_at: '2026-04-10',
    title: 'Vår webbplats är här, och vår Discord öppnar snart',
    excerpt: 'Idag lanserar vi livslust.dancingsalamanders.com. Det är en plats för information, kontakt och gemenskap, och det är bara början.',
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
    published_at: '2026-04-10',
    title: 'Our website is here, and our Discord opens soon',
    excerpt: 'Today we launch livslust.dancingsalamanders.com. It is a place for information, contact and community, and it is just the beginning.',
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

  console.log('\n🌱 Seeding content…');
  await seedContent(token);
  await seedEvents(token);
  await seedPosts(token);

  console.log('\n✅ Directus setup complete.\n');
}

main().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
