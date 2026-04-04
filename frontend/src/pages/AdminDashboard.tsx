import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ContentEditor from '../components/admin/ContentEditor';
import UserManager from '../components/admin/UserManager';
import './Admin.css';

type Tab = 'content' | 'users';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('content');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/admin/login');
  };

  return (
    <div className="admin-page admin-dashboard">
      <header className="admin-header">
        <span className="admin-brand">{t('admin.dashboard')}</span>
        <nav className="admin-nav">
          <button
            className={`admin-tab${tab === 'content' ? ' active' : ''}`}
            onClick={() => setTab('content')}
          >
            {t('admin.content')}
          </button>
          {role === 'superadmin' && (
            <button
              className={`admin-tab${tab === 'users' ? ' active' : ''}`}
              onClick={() => setTab('users')}
            >
              {t('admin.users')}
            </button>
          )}
        </nav>
        <button className="btn btn-primary admin-logout" onClick={logout}>
          {t('admin.logout')}
        </button>
      </header>
      <main className="admin-main container">
        {tab === 'content' && <ContentEditor />}
        {tab === 'users' && role === 'superadmin' && <UserManager />}
      </main>
    </div>
  );
}
