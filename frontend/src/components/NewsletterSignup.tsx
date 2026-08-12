import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import './NewsletterSignup.css';

// Listmonk list UUID (Admin → Lists), not a secret — required by the public subscription API.
const LIST_UUID = '17478c3b-bdf8-4f71-bd1f-5bbd99ae20f6';

export default function NewsletterSignup() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); // honeypot, hidden from real users
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (company) return; // bot filled the honeypot field, silently drop

    setStatus('loading');
    try {
      const res = await fetch('/newsletter-api/api/public/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, list_uuids: [LIST_UUID] }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="newsletter-signup">
      <h3 className="newsletter-heading">{t('newsletter.heading')}</h3>
      <p className="newsletter-intro">{t('newsletter.intro')}</p>

      {status === 'success' ? (
        <div className="newsletter-feedback success" role="alert">
          <span aria-hidden="true">✓</span> {t('newsletter.success')}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="newsletter-form" noValidate>
          <div className="newsletter-honeypot" aria-hidden="true">
            <label htmlFor="nl-company">Company</label>
            <input
              id="nl-company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>

          <label htmlFor="nl-email" className="newsletter-visually-hidden">
            {t('newsletter.emailLabel')}
          </label>
          <input
            id="nl-email"
            type="email"
            required
            autoComplete="email"
            placeholder={t('newsletter.emailPlaceholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary newsletter-submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? t('newsletter.sending') : t('newsletter.submit')}
          </button>

          {status === 'error' && (
            <div className="newsletter-feedback error" role="alert">
              <span aria-hidden="true">⚠</span> {t('newsletter.error')}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
