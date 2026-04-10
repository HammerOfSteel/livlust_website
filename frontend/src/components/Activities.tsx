import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Activities.css';

interface Item {
  id: string;
  icon: string;
  titleKey: string;
  bodyKey: string;
}

const ITEMS: Item[] = [
  { id: 'samtalstrafar',   icon: '💬', titleKey: 'activities.samtalstrafar_title',   bodyKey: 'activities.samtalstrafar_body'   },
  { id: 'knata',           icon: '🚶', titleKey: 'activities.knata_title',           bodyKey: 'activities.knata_body'           },
  { id: 'forelasningar',   icon: '🎤', titleKey: 'activities.forelasningar_title',   bodyKey: 'activities.forelasningar_body'   },
  { id: 'sorgbearbetning', icon: '🤝', titleKey: 'activities.sorgbearbetning_title', bodyKey: 'activities.sorgbearbetning_body' },
  { id: 'digitala',        icon: '💻', titleKey: 'activities.digitala_title',        bodyKey: 'activities.digitala_body'        },
];

export default function Activities() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (id: string) => setOpen(prev => (prev === id ? null : id));

  return (
    <section id="activities" className="activities-section">
      <div className="container">
        <h2 className="section-heading">{t('activities.heading')}</h2>
        <p className="section-intro">{t('activities.intro')}</p>

        <div className="accordion" role="list">
          {ITEMS.map(item => (
            <div
              key={item.id}
              className={`accordion-item${open === item.id ? ' is-open' : ''}`}
              role="listitem"
            >
              <button
                className="accordion-trigger"
                onClick={() => toggle(item.id)}
                aria-expanded={open === item.id}
                aria-controls={`acc-${item.id}`}
              >
                <span className="accordion-icon" aria-hidden="true">{item.icon}</span>
                <span className="accordion-title">{t(item.titleKey)}</span>
                <span className="accordion-chevron" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>

              <div
                id={`acc-${item.id}`}
                className="accordion-body"
                role="region"
              >
                <div className="accordion-body-inner">
                  <p>{t(item.bodyKey)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
