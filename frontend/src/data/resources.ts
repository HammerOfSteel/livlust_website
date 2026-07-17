// ── Types ─────────────────────────────────────────────────────────────────

export type CategoryKey =
  | 'livslust'
  | 'efterlevande'
  | 'fontanhus'
  | 'psykisk'
  | 'ungdom'
  | 'hbtqi'
  | 'missbruk';

export interface CategoryMeta {
  label: string;
  color: string;
  bg: string;
  emoji?: string;
}

export interface Resource {
  id: string;
  name: string;
  cat: CategoryKey;
  lat: number;
  lng: number;
  city: string;
  phone: string | null;
  email?: string | null;
  web: string;
  desc: string;
  contacts?: string[];      // Livslust contact names
}

export interface NationalResource {
  id: string;
  name: string;
  phone: string | null;
  desc: string;
  web: string;
}

// ── Category metadata ─────────────────────────────────────────────────────

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  livslust:     { label: 'Livslust',       color: '#2e6b6e', bg: '#d4eded', emoji: '♥' },
  efterlevande: { label: 'Efterlevande',   color: '#c94040', bg: '#fde8e8' },
  fontanhus:    { label: 'Fontänhus',      color: '#2b7abf', bg: '#ddeeff' },
  psykisk:      { label: 'Psykisk hälsa', color: '#2e9455', bg: '#dff5e8' },
  ungdom:       { label: 'Barn & unga',   color: '#d46a1a', bg: '#fff0e0' },
  hbtqi:        { label: 'HBTQI',         color: '#7c3aac', bg: '#f0e6fa' },
  missbruk:     { label: 'Beroende',      color: '#9a6520', bg: '#fdf0dc' },
};

// ── Geo resources ─────────────────────────────────────────────────────────

export const RESOURCES: Resource[] = [

  // Livslust – egna regionala kontakter
  { id:'lv1', name:'Livslust – Västerbotten',
    cat:'livslust', lat:63.8218, lng:20.2630, city:'Umeå',
    phone:null, email:null, web:'https://livslust.se',
    desc:'Livslust har stödverksamhet i Region Västerbotten. Kontakta oss för stöd och mer information.',
    contacts:['Catrine'] },
  { id:'lv2', name:'Livslust – Norrbotten',
    cat:'livslust', lat:65.5842, lng:22.1567, city:'Luleå',
    phone:null, email:null, web:'https://livslust.se',
    desc:'Livslust har stödverksamhet i Region Norrbotten. Kontakta oss för stöd och mer information.',
    contacts:['Catrine'] },
  { id:'lv3', name:'Livslust – Jämtland',
    cat:'livslust', lat:63.1792, lng:14.6357, city:'Östersund',
    phone:null, email:null, web:'https://livslust.se',
    desc:'Livslust har stödverksamhet i Region Jämtland. Kontakta oss för stöd och mer information.',
    contacts:['Catrine','Sussi','Sune','Micke','Erik','Eva'] },
  { id:'lv4', name:'Livslust – Västmanland',
    cat:'livslust', lat:59.6099, lng:16.5448, city:'Västerås',
    phone:null, email:null, web:'https://livslust.se',
    desc:'Livslust har stödverksamhet i Region Västmanland. Kontakta oss för stöd och mer information.',
    contacts:['Sussi','Hanna'] },
  { id:'lv5', name:'Livslust – Skåne',
    cat:'livslust', lat:55.7147, lng:13.1910, city:'Malmö / Lund',
    phone:null, email:null, web:'https://livslust.se',
    desc:'Livslust har stödverksamhet i Region Skåne. Kontakta oss för stöd och mer information.',
    contacts:['Anna Hull'] },

  // SPES – stöd för efterlevande vid suicid
  { id:'s1',  name:'SPES Stockholm',      cat:'efterlevande', lat:59.3145, lng:18.0508, city:'Stockholm',  phone:'020-18 18 01', web:'https://spesistockholm.se', desc:'Stöd för efterlevande och anhöriga vid suicid. Stödgrupper och enskilda samtal.' },
  { id:'s2',  name:'SPES Uppsala',         cat:'efterlevande', lat:59.8566, lng:17.6300, city:'Uppsala',    phone:'020-18 18 01', web:'https://spes.se',           desc:'Stöd för efterlevande och anhöriga vid suicid i Uppsala.' },
  { id:'s3',  name:'SPES Blekinge',        cat:'efterlevande', lat:56.1619, lng:15.5737, city:'Karlskrona', phone:null,           web:'https://spes.se',           desc:'Stöd för efterlevande och anhöriga vid suicid i Blekinge.' },
  { id:'s4',  name:'SPES Västra krets',    cat:'efterlevande', lat:57.6925, lng:11.9576, city:'Göteborg',   phone:null,           web:'https://spes.se',           desc:'Täcker Västra Götaland och Halland. Stöd vid suicid.' },
  { id:'s5',  name:'SPES Östergötland',    cat:'efterlevande', lat:58.4008, lng:15.6114, city:'Linköping',  phone:'020-18 18 01', web:'https://spes.se',           desc:'Stöd för efterlevande och anhöriga vid suicid i Östergötland.' },
  { id:'s6',  name:'SPES Jönköping',       cat:'efterlevande', lat:57.7726, lng:14.1518, city:'Jönköping',  phone:'020-18 18 01', web:'https://spes.se',           desc:'Stöd för efterlevande och anhöriga vid suicid i Jönköpings län.' },
  { id:'s7',  name:'SPES Norrbotten',      cat:'efterlevande', lat:65.5742, lng:22.1467, city:'Luleå',      phone:'020-18 18 01', web:'https://spes.se',           desc:'Stöd för efterlevande och anhöriga vid suicid i Norrbotten.' },
  { id:'s8',  name:'SPES Södermanland',    cat:'efterlevande', lat:59.3615, lng:16.5009, city:'Eskilstuna', phone:'020-18 18 01', web:'https://spes.se',           desc:'Stöd för efterlevande och anhöriga vid suicid i Södermanland.' },
  { id:'s9',  name:'SPES Västerbotten',    cat:'efterlevande', lat:63.8158, lng:20.2530, city:'Umeå',       phone:'020-18 18 01', web:'https://spes.se',           desc:'Stöd för efterlevande och anhöriga vid suicid i Västerbotten.' },
  { id:'s10', name:'SPES Västmanland',     cat:'efterlevande', lat:59.5999, lng:16.5348, city:'Västerås',   phone:'020-18 18 01', web:'https://spes.se',           desc:'Stöd för efterlevande och anhöriga vid suicid i Västmanland.' },
  { id:'s11', name:'SPES Kalmar',          cat:'efterlevande', lat:56.6534, lng:16.3468, city:'Kalmar',     phone:'020-18 18 01', web:'https://spes.se',           desc:'Stöd för efterlevande och anhöriga vid suicid i Kalmar.' },
  { id:'s12', name:'SPES Gotland',         cat:'efterlevande', lat:57.6348, lng:18.2948, city:'Visby',      phone:'020-18 18 01', web:'https://spes.se',           desc:'Stöd för efterlevande och anhöriga vid suicid på Gotland.' },

  // Fontänhus
  { id:'f1',  name:'Fontänhus Båstad',     cat:'fontanhus', lat:56.4304, lng:12.8565, city:'Båstad',       phone:'0431-724 80',   web:'http://fhb.nu',                     desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f2',  name:'Fontänhus Falun',      cat:'fontanhus', lat:60.6065, lng:15.6355, city:'Falun',        phone:'0703-99 04 53', web:'https://fontanhusetfalun.se',        desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f3',  name:'Fontänhus Falkenberg', cat:'fontanhus', lat:56.9045, lng:12.4916, city:'Falkenberg',   phone:'0346-71 10 71', web:'http://www.falkenbergsfontanhus.se', desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f4',  name:'Göteborgsfontanen',    cat:'fontanhus', lat:57.6973, lng:11.9409, city:'Göteborg',     phone:'031-12 30 01',  web:'http://www.goteborgsfontanen.se',    desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f5',  name:'Fontänhus Helsingborg',cat:'fontanhus', lat:56.0465, lng:12.6945, city:'Helsingborg',  phone:'042-24 50 60',  web:'http://www.fontanhushbg.se',         desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f6',  name:'Fontänhus Jönköping',  cat:'fontanhus', lat:57.7826, lng:14.2618, city:'Jönköping',    phone:'076-161 93 41', web:'https://fontanhusjonkoping.se',      desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f7',  name:'Fontänhus Lund',       cat:'fontanhus', lat:55.7047, lng:13.1910, city:'Lund',         phone:'046-120 195',   web:'https://fontanhusetlund.se',         desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f8',  name:'Fontänhuset Malmö',    cat:'fontanhus', lat:55.6050, lng:13.0038, city:'Malmö',        phone:'040-12 00 13',  web:'http://www.fontanhuset.se',          desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f9',  name:'Fontänhus Motala',     cat:'fontanhus', lat:58.5372, lng:15.0363, city:'Motala',       phone:'0793-41 56 10', web:'http://www.motalafontanhus.se',      desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f10', name:'Fontänhuset Nyköping', cat:'fontanhus', lat:58.7529, lng:17.0073, city:'Nyköping',     phone:'0155-26 81 40', web:'http://www.fontan.se',               desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f11', name:'Fontänhus Sandviken',  cat:'fontanhus', lat:60.6196, lng:16.7778, city:'Sandviken',    phone:'073-301 38 01', web:'http://www.fontanhusetsandviken.se', desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f12', name:'Fountain House Sthlm', cat:'fontanhus', lat:59.3160, lng:18.0831, city:'Stockholm',    phone:'08-714 01 60',  web:'http://www.fountainhouse.se',        desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f13', name:'Fontänhus Sköndal',    cat:'fontanhus', lat:59.2577, lng:18.0971, city:'Sköndal',      phone:'072-968 66 24', web:'http://www.fhskondal.se',            desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f14', name:'Fontänhus Sundsvall',  cat:'fontanhus', lat:62.3908, lng:17.3069, city:'Sundsvall',    phone:'076-778 83 91', web:'https://www.sundsvallsfontanhus.se', desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f15', name:'Fontänhus Varberg',    cat:'fontanhus', lat:57.1062, lng:12.2503, city:'Varberg',      phone:'0704-65 89 79', web:'https://www.fontanhusetvarberg.se',  desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f16', name:'Fontänhuset Älmhult',  cat:'fontanhus', lat:56.5490, lng:14.1390, city:'Älmhult',      phone:'076-006 76 54', web:'https://fontanhuset.se',             desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f17', name:'Fontänhus Örebro',     cat:'fontanhus', lat:59.2753, lng:15.2134, city:'Örebro',       phone:'019-320 520',   web:'http://www.orebrofontanhus.se',      desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },
  { id:'f18', name:'Fontänhus Östersund',  cat:'fontanhus', lat:63.1792, lng:14.6357, city:'Östersund',    phone:'070-414 68 18', web:'https://fontanhusjh.se',             desc:'Gemenskap och stöd för psykisk ohälsa. Kostnadsfritt, ingen remiss.' },

  // BRIS
  { id:'b1', name:'BRIS Stockholm', cat:'ungdom', lat:59.3293, lng:18.0686, city:'Stockholm', phone:'116 111', web:'https://www.bris.se', desc:'Kostnadsfri stödlinje och kuratorssamtal för barn och unga.' },
  { id:'b2', name:'BRIS Göteborg',  cat:'ungdom', lat:57.7089, lng:11.9746, city:'Göteborg',  phone:'116 111', web:'https://www.bris.se', desc:'Kostnadsfri stödlinje och kuratorssamtal för barn och unga.' },
  { id:'b3', name:'BRIS Malmö',     cat:'ungdom', lat:55.5950, lng:12.9938, city:'Malmö',     phone:'116 111', web:'https://www.bris.se', desc:'Kostnadsfri stödlinje och kuratorssamtal för barn och unga.' },
  { id:'b4', name:'BRIS Linköping', cat:'ungdom', lat:58.4008, lng:15.6014, city:'Linköping', phone:'116 111', web:'https://www.bris.se', desc:'Kostnadsfri stödlinje och kuratorssamtal för barn och unga.' },
  { id:'b5', name:'BRIS Umeå',      cat:'ungdom', lat:63.8158, lng:20.2430, city:'Umeå',      phone:'116 111', web:'https://www.bris.se', desc:'Kostnadsfri stödlinje och kuratorssamtal för barn och unga.' },
  { id:'b6', name:'BRIS Luleå',     cat:'ungdom', lat:65.5742, lng:22.1267, city:'Luleå',     phone:'116 111', web:'https://www.bris.se', desc:'Kostnadsfri stödlinje och kuratorssamtal för barn och unga.' },

  // RSMH
  { id:'r1', name:'RSMH Dalarna',   cat:'psykisk', lat:60.4746, lng:15.4387, city:'Borlänge', phone:'0225-515 01',  web:'https://rsmh.se', desc:'Riksförbundet för Social och Mental Hälsa. Självhjälpsgrupper och stöd.' },
  { id:'r2', name:'RSMH Gävleborg', cat:'psykisk', lat:60.6745, lng:17.1417, city:'Gävle',    phone:'026-12 26 88', web:'https://rsmh.se', desc:'Riksförbundet för Social och Mental Hälsa. Självhjälpsgrupper och stöd.' },
  { id:'r3', name:'RSMH Halland',   cat:'psykisk', lat:56.6739, lng:12.8570, city:'Halmstad',  phone:null,          web:'https://rsmh.se', desc:'Riksförbundet för Social och Mental Hälsa. Självhjälpsgrupper och stöd.' },

  // Balans
  { id:'bl1', name:'Balans Stockholm', cat:'psykisk', lat:59.3245, lng:18.0408, city:'Stockholm', phone:null, web:'https://balansriks.se', desc:'Förening för bipolär sjukdom och depression. Stöd och gemenskap.' },
  { id:'bl2', name:'Balans Göteborg',  cat:'psykisk', lat:57.6925, lng:11.9376, city:'Göteborg',  phone:null, web:'https://balansriks.se', desc:'Förening för bipolär sjukdom och depression. Stöd och gemenskap.' },
  { id:'bl3', name:'Balans Malmö',     cat:'psykisk', lat:55.5850, lng:12.9838, city:'Malmö',     phone:null, web:'https://balansriks.se', desc:'Förening för bipolär sjukdom och depression. Stöd och gemenskap.' },
  { id:'bl4', name:'Balans Uppsala',   cat:'psykisk', lat:59.8666, lng:17.6500, city:'Uppsala',   phone:null, web:'https://balansriks.se', desc:'Förening för bipolär sjukdom och depression. Stöd och gemenskap.' },
  { id:'bl5', name:'Balans Örebro',    cat:'psykisk', lat:59.2853, lng:15.2234, city:'Örebro',    phone:null, web:'https://balansriks.se', desc:'Förening för bipolär sjukdom och depression. Stöd och gemenskap.' },
  { id:'bl6', name:'Balans Borås',     cat:'psykisk', lat:57.7211, lng:12.9299, city:'Borås',     phone:null, web:'https://balansriks.se', desc:'Förening för bipolär sjukdom och depression. Stöd och gemenskap.' },
  { id:'bl7', name:'Balans Värmland',  cat:'psykisk', lat:59.3793, lng:13.4937, city:'Karlstad',  phone:null, web:'https://balansriks.se', desc:'Förening för bipolär sjukdom och depression. Stöd och gemenskap.' },
  { id:'bl8', name:'Balans Västerås',  cat:'psykisk', lat:59.6099, lng:16.5348, city:'Västerås',  phone:null, web:'https://balansriks.se', desc:'Förening för bipolär sjukdom och depression. Stöd och gemenskap.' },
  { id:'bl9', name:'Balans Gotland',   cat:'psykisk', lat:57.6448, lng:18.3148, city:'Visby',     phone:null, web:'https://balansriks.se', desc:'Förening för bipolär sjukdom och depression. Stöd och gemenskap.' },

  // RFSL
  { id:'q1', name:'RFSL Stockholm', cat:'hbtqi', lat:59.3350, lng:18.0430, city:'Stockholm', phone:'08-501 629 00', web:'https://rfsl.se', desc:'Riksförbundet för homo-, bi- och transpersoner. Rådgivning och stöd.' },
  { id:'q2', name:'RFSL Göteborg',  cat:'hbtqi', lat:57.7010, lng:11.9480, city:'Göteborg',  phone:null,           web:'https://rfsl.se', desc:'HBTQI-stöd, rådgivning och gemenskap i Göteborg.' },
  { id:'q3', name:'RFSL Malmö',     cat:'hbtqi', lat:55.5950, lng:12.9838, city:'Malmö',     phone:null,           web:'https://rfsl.se', desc:'HBTQI-stöd, rådgivning och gemenskap i Malmö.' },
  { id:'q4', name:'RFSL Umeå',      cat:'hbtqi', lat:63.8058, lng:20.2430, city:'Umeå',      phone:null,           web:'https://rfsl.se', desc:'HBTQI-stöd, rådgivning och gemenskap i Umeå.' },
  { id:'q5', name:'RFSL Sundsvall', cat:'hbtqi', lat:62.3808, lng:17.2869, city:'Sundsvall', phone:null,           web:'https://rfsl.se', desc:'HBTQI-stöd, rådgivning och gemenskap i Sundsvall.' },
  { id:'q6', name:'RFSL Örebro',    cat:'hbtqi', lat:59.2753, lng:15.1934, city:'Örebro',    phone:null,           web:'https://rfsl.se', desc:'HBTQI-stöd, rådgivning och gemenskap i Örebro.' },

  // Missbruk / Beroende
  { id:'m1', name:'AA Servicekontor',      cat:'missbruk', lat:59.3010, lng:18.0700, city:'Stockholm', phone:'08-720 38 42',  web:'https://aa.se',      desc:'Anonyma Alkoholister. Telejour alla dagar 11–20. Hitta möten på aa.se' },
  { id:'m2', name:'Al-Anon Servicekontor', cat:'missbruk', lat:59.4170, lng:17.8350, city:'Järfälla',  phone:'070-610 96 61', web:'https://al-anon.se', desc:'Stöd för anhöriga och vänner till alkoholister. Inkl. Alateen för tonåringar.' },
];

// ── National / digital resources ──────────────────────────────────────────

export const NATIONAL: NationalResource[] = [
  { id:'n1', name:'Mind självmordslinjen', phone:'90101',        desc:'Dygnet runt',           web:'https://mind.se' },
  { id:'n2', name:'BRIS – barnens linje',  phone:'116 111',      desc:'Dygnet runt',           web:'https://bris.se' },
  { id:'n3', name:'SPES rikslinje',        phone:'020-18 18 01', desc:'Mån–tor 10–14',         web:'https://spes.se' },
  { id:'n4', name:'Ätstörningslinjen',     phone:'08-20 59 00',  desc:'Mån–fre 9–16',          web:'https://mind.se' },
  { id:'n5', name:'Mindler',              phone:null,            desc:'100 kr/samtal, frikort', web:'https://mindler.se' },
  { id:'n6', name:'Kry Psykolog',          phone:'08-22 77 07',  desc:'Primärvårdspris, app',  web:'https://kry.se/psykolog-online' },
  { id:'n7', name:'AA Telejour',           phone:'08-720 38 42', desc:'Alla dagar 11–20',      web:'https://aa.se' },
  { id:'n8', name:'Al-Anon',              phone:'070-610 96 61', desc:'Mån 19–21',             web:'https://al-anon.se' },
];
