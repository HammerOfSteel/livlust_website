import { useTranslation } from 'react-i18next';
import './Footer.css';

const CMS_URL = import.meta.env.VITE_CMS_URL ?? 'http://localhost:8055';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <p>{t('footer.rights', { year })}</p>
          <p className="footer-org">Org.nr 802556-0601 &middot; Kamvägen 3, 93731 Burträsk</p>
        </div>
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
