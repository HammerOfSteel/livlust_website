import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>{t('footer.rights', { year })}</p>
        <Link to="/admin/login" className="footer-admin-link">{t('footer.adminLink')}</Link>
      </div>
    </footer>
  );
}
