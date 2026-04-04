import { useEffect, useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

const SECTIONS = ['hero_title', 'hero_subtitle', 'about', 'offer', 'contact_intro'];
const LANGS: Array<'sv' | 'en'> = ['sv', 'en'];

type ContentMap = Record<string, string>;

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

export default function ContentEditor() {
  const { t } = useTranslation();
  const [lang, setLang] = useState<'sv' | 'en'>('sv');
  const [content, setContent] = useState<ContentMap>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/content?lang=${lang}`)
      .then(r => r.json())
      .then(setContent)
      .catch(console.error);
  }, [lang]);

  const save = async (e: FormEvent, section: string) => {
    e.preventDefault();
    setSaving(section);
    try {
      const res = await fetch(`/api/content/${section}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ body: content[section] ?? '', language: lang }),
      });
      setMsg(m => ({ ...m, [section]: res.ok ? '✓ Saved' : '✗ Error' }));
    } catch {
      setMsg(m => ({ ...m, [section]: '✗ Error' }));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {LANGS.map(l => (
          <button
            key={l}
            className={`btn btn-primary btn-sm${lang === l ? '' : ''}`}
            style={{ opacity: lang === l ? 1 : 0.5 }}
            onClick={() => setLang(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {SECTIONS.map(section => (
        <form key={section} onSubmit={e => save(e, section)} style={{ marginBottom: '1.5rem' }}>
          <h3 className="admin-section-title" style={{ borderBottom: 'none', marginBottom: '0.4rem' }}>
            {section}
          </h3>
          <textarea
            rows={3}
            value={content[section] ?? ''}
            onChange={e => setContent(c => ({ ...c, [section]: e.target.value }))}
            style={{ marginBottom: '0.5rem' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving === section}>
              {saving === section ? '…' : t('contact.submit')}
            </button>
            {msg[section] && <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{msg[section]}</span>}
          </div>
        </form>
      ))}
    </div>
  );
}
