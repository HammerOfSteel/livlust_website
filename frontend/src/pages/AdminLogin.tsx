import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError(t('admin.loginError'));
        return;
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      navigate('/admin');
    } catch {
      setError(t('admin.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1 className="admin-heading">{t('admin.loginHeading')}</h1>
        {error && <p className="form-msg error">{error}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">{t('admin.emailLabel')}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">{t('admin.passwordLabel')}</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? '…' : t('admin.loginButton')}
          </button>
        </form>
      </div>
    </div>
  );
}
