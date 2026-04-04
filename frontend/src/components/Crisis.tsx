import { useTranslation } from 'react-i18next';
import './Crisis.css';

export default function Crisis() {
  const { t } = useTranslation();
  return (
    <div className="crisis-wrap">
      <div className="container">
        <div className="crisis-box">
          <span className="crisis-icon" aria-hidden="true">🆘</span>
          <div className="crisis-content">
            <h3>{t('crisis.heading')}</h3>
            <ul>
              <li>
                <strong>Mind Självmordslinjen:</strong>{' '}
                <a href="tel:90101">90101</a> — dygnet runt, anonymt och kostnadsfritt
              </li>
              <li>
                <strong>1177 Vårdguiden:</strong>{' '}
                <a href="tel:1177">1177</a> — sjukvårdsrådgivning
              </li>
              <li className="crisis-emergency">{t('crisis.note')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
