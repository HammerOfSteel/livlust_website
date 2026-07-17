import { useTranslation } from 'react-i18next';
import ResourcesMap from '../components/ResourcesMap';
import './ResourcesPage.css';

export default function ResourcesPage() {
  const { t } = useTranslation();
  return (
    <div className="rp">
      <header className="rp-header">
        <a className="rp-header__back" href="/">
          {t('resurskarta.back_home')}
        </a>
        <span className="rp-header__title">{t('resurskarta.page_title')}</span>
        <a className="rp-header__logo" href="/">Livslust</a>
      </header>

      <ResourcesMap />
    </div>
  );
}
