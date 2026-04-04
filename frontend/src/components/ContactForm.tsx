import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteContent } from '../hooks/useSiteContent';
import './ContactForm.css';

export default function ContactForm() {
  const { t } = useTranslation();
  const cms = useSiteContent();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    try {
      const res = await fetch('/cms/items/contact_submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok || res.status === 204) {
        setStatus('success');
        setName(''); setEmail(''); setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const intro = cms.contact_intro ?? t('contact.intro');

  return (
    <section id="contact">
      <div className="container contact-grid">

        {/* ── Contact info ── */}
        <div className="contact-info">
          <h2>{t('contact.heading')}</h2>
          <p className="contact-intro-text">{intro}</p>

          <ul className="contact-details">
            <li>
              <span className="contact-detail-icon" aria-hidden="true">📍</span>
              <span>{t('contact.address')}</span>
            </li>
            <li>
              <span className="contact-detail-icon" aria-hidden="true">✉️</span>
              <a href={`mailto:${t('contact.emailAddress')}`}>{t('contact.emailAddress')}</a>
            </li>
          </ul>

          <div className="contact-note">
            <p>Alla som kontaktar oss tas emot med värme och respekt.<br />
            Vi svarar normalt inom 2–3 arbetsdagar.</p>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="contact-form-wrap">
          {status === 'success' && (
            <div className="form-feedback success" role="alert">
              <span aria-hidden="true">✓</span> {t('contact.success')}
            </div>
          )}
          {status === 'error' && (
            <div className="form-feedback error" role="alert">
              <span aria-hidden="true">⚠</span> {t('contact.error')}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cf-name">{t('contact.name')}</label>
                <input
                  id="cf-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cf-email">{t('contact.email')}</label>
                <input
                  id="cf-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="cf-message">{t('contact.message')}</label>
              <textarea
                id="cf-message"
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t('contact.message_placeholder')}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary contact-submit"
              disabled={loading}
            >
              {loading ? t('contact.sending') : t('contact.submit')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
