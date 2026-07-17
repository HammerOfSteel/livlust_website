import ResourcesMap from '../components/ResourcesMap';
import './ResourcesPage.css';

export default function ResourcesPage() {
  return (
    <div className="rp">
      <header className="rp-header">
        <a className="rp-header__back" href="/">
          ← Hem
        </a>
        <span className="rp-header__title">Resurskarta</span>
        <a className="rp-header__logo" href="/">Livslust</a>
      </header>

      <ResourcesMap />
    </div>
  );
}
