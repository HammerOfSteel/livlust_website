import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import './ContactForm.css';

export default function ContactForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact">
      <div className="container contact-grid">
        <div className="contact-info">
          <h2>{t('contact.heading')}</h2>
          <p>{t('contact.intro')}</p>
          <p className="contact-detail">📍 {t('contact.address')}</p>
          <p className="contact-detail">✉️ <a href={`mailto:${t('contact.emailAddress')}`}>{t('contact.emailAddress')}</a></p>
        </div>
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          {status === 'success' && <p className="form-msg success">{t('contact.success')}</p>}
          {status === 'error'   && <p className="form-msg error">{t('contact.error')}</p>}
          <div className="form-group">
            <label htmlFor="cf-name">{t('contact.name')}</label>
            <input id="cf-name" type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="cf-email">{t('contact.email')}</label>
            <input id="cf-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="cf-message">{t('contact.message')}</label>
            <textarea id="cf-message" rows={5} value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '…' : t('contact.submit')}
          </button>
        </form>
      </div>
    </section>
  );
}
