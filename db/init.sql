-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CMS content table
CREATE TABLE IF NOT EXISTS content (
  id          SERIAL PRIMARY KEY,
  section     TEXT NOT NULL,
  language    TEXT NOT NULL CHECK (language IN ('sv', 'en')),
  body        TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section, language)
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default content stubs (Swedish)
INSERT INTO content (section, language, body) VALUES
  ('hero_title',    'sv', 'Livslust och hållbart stöd'),
  ('hero_subtitle', 'sv', 'Vi är här för dig som förlorat en närstående i självmord.'),
  ('about',         'sv', 'Vi är en ideell förening som erbjuder stöd, gemenskap och resurser till efterlevande efter självmord.'),
  ('offer',         'sv', 'Vi erbjuder stödgrupper, samtalsstöd och information för dig som sörjer.'),
  ('contact_intro', 'sv', 'Hör av dig till oss – vi finns här för dig.'),
  ('hero_title',    'en', 'Livslust och hållbart stöd'),
  ('hero_subtitle', 'en', 'We are here for you who have lost a loved one to suicide.'),
  ('about',         'en', 'We are a non-profit organisation offering support, community and resources to suicide loss survivors.'),
  ('offer',         'en', 'We offer support groups, counselling, and information for those who are grieving.'),
  ('contact_intro', 'en', 'Reach out to us – we are here for you.')
ON CONFLICT (section, language) DO NOTHING;
