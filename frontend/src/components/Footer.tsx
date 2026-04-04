import { useTranslation } from 'react-i18next';
import './Footer.css';

const CMS_URL = import.meta.env.VITE_CMS_URL ?? 'http://localhost:8055';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>{t('footer.rights', { year })}</p>
        <a
          href={`${CMS_URL}/admin`}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-admin-link"
        >
          {t('footer.adminLink')}
        </a>
      </div>
    </footer>
  );
}
