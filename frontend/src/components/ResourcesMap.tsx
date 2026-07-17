import { useEffect, useRef, useMemo, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  RESOURCES,
  NATIONAL,
  CATEGORIES,
  type Resource,
  type CategoryKey,
} from '../data/resources';
import './ResourcesMap.css';

// ── Pin SVG helpers ───────────────────────────────────────────────────────

const dotPin = (color: string) =>
  `<svg viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.4 14 22 14 22S28 24.4 28 14C28 6.27 21.73 0 14 0z"
      fill="${color}" stroke="rgba(0,0,0,0.18)" stroke-width="0.8"/>
    <circle cx="14" cy="14" r="5.5" fill="rgba(255,255,255,0.9)"/>
  </svg>`;

const heartPin = (color: string) =>
  `<svg viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.4 14 22 14 22S28 24.4 28 14C28 6.27 21.73 0 14 0z"
      fill="${color}" stroke="rgba(0,0,0,0.18)" stroke-width="0.8"/>
    <text x="14" y="19" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.95)">♥</text>
  </svg>`;

// ── Sub-components ────────────────────────────────────────────────────────

interface CardProps {
  resource: Resource;
  onSelect: (id: string) => void;
}

function ResourceCard({ resource: r, onSelect }: CardProps) {
  const cat = CATEGORIES[r.cat];
  return (
    <button className="rm-card" onClick={() => onSelect(r.id)}>
      <span className="rm-card__color-bar" style={{ background: cat.color }} />
      <div className="rm-card__body">
        <span
          className="rm-card__badge"
          style={{ background: cat.bg, color: cat.color }}
        >
          {cat.emoji} {cat.label}
        </span>
        <p className="rm-card__name">{r.name}</p>
        <p className="rm-card__meta">
          {r.city}{r.phone ? ` · ${r.phone}` : ''}
        </p>
      </div>
    </button>
  );
}

interface DetailProps {
  resource: Resource;
  onClose: () => void;
}

function ResourceDetail({ resource: r, onClose }: DetailProps) {
  const cat = CATEGORIES[r.cat];
  return (
    <div className="rm-detail">
      <div className="rm-detail__header">
        <button className="rm-detail__back" onClick={onClose}>
          ← Alla resurser
        </button>
        <span
          className="rm-detail__badge"
          style={{ background: cat.bg, color: cat.color }}
        >
          {cat.emoji} {cat.label}
        </span>
      </div>

      <h2 className="rm-detail__name">{r.name}</h2>

      <div className="rm-detail__meta-row">
        {r.phone && (
          <a className="rm-detail__meta-item" href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}>
            <span className="rm-detail__icon">📞</span>
            {r.phone}
          </a>
        )}
        <span className="rm-detail__meta-item">
          <span className="rm-detail__icon">📍</span>
          {r.city}
        </span>
      </div>

      {r.desc && <p className="rm-detail__desc">{r.desc}</p>}

      {r.contacts && r.contacts.length > 0 && (
        <div className="rm-detail__contacts">
          <span className="rm-detail__contacts-label">Kontakter</span>
          <div className="rm-detail__contacts-list">
            {r.contacts.map(name => (
              <span key={name} className="rm-detail__contact-chip">{name}</span>
            ))}
          </div>
        </div>
      )}

      <a
        className="rm-detail__cta"
        href={r.web}
        target="_blank"
        rel="noopener noreferrer"
      >
        Öppna webbplats →
      </a>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function ResourcesMap() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<maplibregl.Map | null>(null);
  const markersRef    = useRef<Record<string, { outer: HTMLDivElement; inner: HTMLDivElement }>>({});

  const [mapLoaded,    setMapLoaded]    = useState(false);
  const [activeFilter, setActiveFilter] = useState<CategoryKey | 'all'>('all');
  const [search,       setSearch]       = useState('');
  const [selectedId,   setSelectedId]   = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return RESOURCES.filter(r => {
      const matchesCat    = activeFilter === 'all' || r.cat === activeFilter;
      const matchesSearch = !q ||
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeFilter, search]);

  const selected = useMemo(
    () => selectedId ? RESOURCES.find(r => r.id === selectedId) : undefined,
    [selectedId],
  );

  // ── Mount map ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [16.0, 63.5],
      zoom: 4.3,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'bottom-right',
    );

    map.on('load', () => {
      RESOURCES.forEach(r => {
        const cat   = CATEGORIES[r.cat];
        const outer = document.createElement('div');
        const inner = document.createElement('div');

        inner.className = 'rm-pin';
        inner.dataset.cat = r.cat;
        inner.innerHTML   = r.cat === 'livslust' ? heartPin(cat.color) : dotPin(cat.color);

        inner.addEventListener('click', e => {
          e.stopPropagation();
          setSelectedId(prev => (prev === r.id ? null : r.id));
        });

        outer.appendChild(inner);

        new maplibregl.Marker({ element: outer, anchor: 'bottom' })
          .setLngLat([r.lng, r.lat])
          .addTo(map);

        markersRef.current[r.id] = { outer, inner };
      });

      setMapLoaded(true);
    });

    map.on('click', () => setSelectedId(null));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current   = null;
      markersRef.current = {};
    };
  }, []);

  // ── Update pin visibility when filter / search changes ─────────────────
  useEffect(() => {
    if (!mapLoaded) return;
    const visible = new Set(filtered.map(r => r.id));
    Object.entries(markersRef.current).forEach(([id, { outer }]) => {
      outer.style.display = visible.has(id) ? '' : 'none';
    });
  }, [filtered, mapLoaded]);

  // ── Highlight selected pin + fly to it ────────────────────────────────
  useEffect(() => {
    if (!mapLoaded) return;
    Object.values(markersRef.current).forEach(({ inner }) =>
      inner.classList.remove('rm-pin--sel'),
    );
    if (!selectedId) return;

    markersRef.current[selectedId]?.inner.classList.add('rm-pin--sel');

    const r = RESOURCES.find(x => x.id === selectedId);
    if (r && mapRef.current) {
      mapRef.current.flyTo({
        center:   [r.lng, r.lat],
        zoom:     Math.max(mapRef.current.getZoom(), 9),
        duration: 700,
      });
    }
  }, [selectedId, mapLoaded]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleFilterClick = (key: CategoryKey | 'all') => {
    setActiveFilter(prev => (prev === key ? 'all' : key));
    setSelectedId(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSelectedId(null);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="rm">

      {/* ── Map + floating filter overlay ── */}
      <div className="rm-map-wrap">
        <div ref={containerRef} className="rm-map" />

        <div className="rm-overlay">
          {/* Search */}
          <div className="rm-search-wrap">
            <span className="rm-search-icon" aria-hidden>🔍</span>
            <input
              type="text"
              className="rm-search-input"
              placeholder="Sök ort eller resurs…"
              value={search}
              onChange={handleSearchChange}
              aria-label="Sök resurser"
            />
            {search && (
              <button
                className="rm-search-clear"
                onClick={() => { setSearch(''); setSelectedId(null); }}
                aria-label="Rensa sökning"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="rm-chips" role="group" aria-label="Filtrera efter kategori">
            <button
              className={`rm-chip rm-chip--all${activeFilter === 'all' ? ' rm-chip--active' : ''}`}
              onClick={() => handleFilterClick('all')}
            >
              Alla
            </button>
            {(Object.keys(CATEGORIES) as CategoryKey[]).map(key => {
              const c = CATEGORIES[key];
              const active = activeFilter === key;
              return (
                <button
                  key={key}
                  className={`rm-chip${active ? ' rm-chip--active' : ''}`}
                  style={
                    { '--chip-color': c.color, '--chip-bg': c.bg } as React.CSSProperties
                  }
                  onClick={() => handleFilterClick(key)}
                >
                  {c.emoji && <span aria-hidden>{c.emoji}</span>}
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Results panel below map ── */}
      <div className="rm-results-wrap">
        {selected ? (
          <ResourceDetail resource={selected} onClose={() => setSelectedId(null)} />
        ) : (
          <>
            {/* Count + national shortcuts */}
            <div className="rm-results-header">
              <span className="rm-results-count">
                {filtered.length} resurser
              </span>
            </div>

            {/* National resources bar */}
            <div className="rm-national" aria-label="Nationella resurser">
              <span className="rm-national__label">Nationellt</span>
              {NATIONAL.map(n => (
                <a
                  key={n.id}
                  className="rm-national__card"
                  href={n.web}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="rm-national__name">{n.name}</span>
                  {n.phone && <span className="rm-national__phone">{n.phone}</span>}
                  <span className="rm-national__desc">{n.desc}</span>
                </a>
              ))}
            </div>

            {/* Geo resource cards */}
            <div className="rm-cards">
              {filtered.map(r => (
                <ResourceCard key={r.id} resource={r} onSelect={setSelectedId} />
              ))}
              {filtered.length === 0 && (
                <p className="rm-empty">Inga resurser matchar din sökning.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
