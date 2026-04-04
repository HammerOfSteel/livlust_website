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

async function main() {
  await waitForDirectus();
  const token = await login();

  console.log('\n📁 Collections…');
  await createCollection(token, 'page_content', 'article', 'Website content by section and language');
  await createCollection(token, 'contact_submissions', 'mail', 'Contact form submissions from the website');

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

  console.log('\n🔐 Public permissions…');
  await ensurePublicPermission(token, 'page_content', 'read');
  await ensurePublicPermission(token, 'contact_submissions', 'create');

  console.log('\n🌱 Seeding content…');
  await seedContent(token);

  console.log('\n✅ Directus setup complete.\n');
}

main().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
