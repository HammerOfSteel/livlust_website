import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import swishQr from '../images/QR_swish_to_join.png';
import './MembershipModal.css';

interface Props {
  onClose: () => void;
}

export default function MembershipModal({ onClose }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="membership-heading"
    >
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label={t('membership.close')}>
          <span aria-hidden="true">×</span>
        </button>

        <h2 id="membership-heading">{t('membership.heading')}</h2>
        <p className="modal-intro">{t('membership.intro')}</p>

        <div className="membership-qr-wrap">
          <img
            src={swishQr}
            alt={t('membership.qr_alt')}
            className="membership-qr"
          />
        </div>

        <div className="membership-instructions">
          <p className="membership-fee">{t('membership.fee')}</p>
          <p className="membership-name-reminder">
            <strong>{t('membership.name_reminder_label')}</strong>{' '}
            {t('membership.name_reminder')}
          </p>
        </div>

        <details className="stadgar-details">
          <summary>{t('membership.stadgar_show')}</summary>
          <div className="stadgar-content" lang="sv">
            <p className="stadgar-adopted">{t('membership.stadgar_adopted')}</p>

            <h3>§ 1 Föreningens namn</h3>
            <p>Föreningens namn är Livslust &amp; Hållbart Stöd.</p>

            <h3>§ 2 Föreningens ändamål</h3>
            <p>
              Vi i Livslust &amp; Hållbart Stöd är en ideell och allmännyttig förening som finns till
              för människor i sorg, kris och psykisk utsatthet. Vårt ändamål är att med
              medmänsklighet, närvaro och omtanke arbeta med suicidprevention samt att ge stöd,
              gemenskap och hopp till dem som förlorat någon i suicid eller på annat sätt berörs av
              psykisk ohälsa.
            </p>
            <p>
              Vi vill vara en trygg plats där sorgen får finnas, där ingen ska behöva bära sin
              smärta ensam och där det är tillåtet att vara precis som man är. Genom samtal,
              stödjande aktiviteter, information, föreläsningar och delade erfarenheter vill vi
              minska ensamhet, bryta tystnad och motverka stigma kring suicid och psykisk hälsa.
            </p>
            <p>Vår verksamhet bedrivs utan vinstsyfte och är partipolitiskt och religiöst obunden.</p>

            <h3>§ 3 Föreningens säte</h3>
            <p>Föreningen har sitt säte i Burträsk, Sverige.</p>

            <h3>§ 4 Medlemsskap</h3>
            <p>Föreningen är öppen för alla som delar föreningens målsättning och följer dess stadgar.</p>

            <h3>§ 5 Medlemsavgifter</h3>
            <p>Medlem ska betala den medlemsavgift som årligen är 99 kr.</p>

            <h3>§ 6 Styrelsen</h3>
            <p>
              Styrelsen består av ordförande, samt två till max sju övriga ledamöter och samt en
              till max två suppleanter. Ordförande väljs på ett år medan övriga ledamöter väljs på
              två år. Styrelsen utser inom sig sekreterare, kassör och de övriga ledamöter
              föreningen anser sig behöva. Vid förfall inträder suppleant. Avgår ledamot före
              mandattidens utgång inträder suppleant i dennes ställe för tiden t o m nästa
              årsmöte.
            </p>

            <h3>§ 7 Styrelsens uppgifter</h3>
            <p>
              Styrelsen företräder föreningen, bevakar dess intressen och handhar dess
              angelägenheter.
            </p>
            <p>
              Styrelsen är beslutsför då minst tre personer är närvarande. Styrelsebeslut fattas
              med enkel majoritet. Vid lika röstetal gäller den mening ordföranden biträder, dock
              sker avgörandet vid val genom lottning.
            </p>
            <p>
              Föreningens firma tecknas av föreningens ordförande och/eller ledamot som därtill
              utses.
            </p>

            <h3>§ 8 Räkenskaper</h3>
            <p>Räkenskapsår ska vara kalenderår.</p>

            <h3>§ 9 Årsmöte</h3>
            <p>
              Årsmöte ska hållas varje år före mars månads utgång. Kallelse till årsmöte skall
              utgå minst två veckor i förväg. Vid ordinarie årsmöte ska följande ärenden behandlas:
            </p>
            <ol>
              <li>Val av ordförande och sekreterare för mötet.</li>
              <li>Fastställande av röstlängd för mötet.</li>
              <li>Val av kombinerad protokolljusterare och rösträknare.</li>
              <li>Fråga om mötet har utlysts på rätt sätt.</li>
              <li>Fastställande av dagordning.</li>
              <li>
                a) Styrelsens verksamhetsberättelse för det senaste verksamhetsåret.<br />
                b) Styrelsens förvaltningsberättelse (balans- och resultaträkning) för det senaste
                verksamhets-/räkenskapsåret.
              </li>
              <li>Revisionsberättelsen för verksamhets-/räkenskapsåret.</li>
              <li>Fråga om ansvarsfrihet för styrelsen för den tid revisionen avser.</li>
              <li>Fastställande av medlemsavgifter.</li>
              <li>
                Fastställande av ev. verksamhetsplan och behandling av budget för det kommande
                verksamhets-/räkenskapsåret.
              </li>
              <li>Val av ordförande i föreningen.</li>
              <li>Val av övriga styrelseledamöter samt suppleanter.</li>
              <li>Val av revisor samt suppleant.</li>
              <li>Fråga om valberedning behövs och i förekommande fall val av sådan.</li>
              <li>Behandling av styrelsens förslag och inkomna motioner.</li>
              <li>Övriga frågor.</li>
            </ol>

            <h3>§ 10 Rösträtt</h3>
            <p>
              Vid årsmöte har varje medlem som har betalat årets medlemsavgift en röst. Om ingen
              årsavgift aviserats under året anses den vara betald. Rösträtten är personlig och
              kan inte utövas genom ombud.
            </p>

            <h3>§ 11 Beslut, omröstning och beslutsmässighet</h3>
            <p>
              Beslut fattas med bifallsrop (acklamation) eller om så begärs, efter omröstning
              (votering).
            </p>
            <p>
              Omröstning sker öppet, utom vid val där sluten omröstning ska äga rum om någon
              begär detta. Beslut fattas, såvida dessa stadgar ej föreskriver annat, med enkel
              majoritet. Vid lika röstetal gäller den mening som ordföranden biträder, vid val
              sker dock avgörandet genom lottning.
            </p>

            <h3>§ 12 Regler för ändring av stadgarna</h3>
            <p>
              För ändring av dessa stadgar krävs beslut av årsmöte med minst 2/3 av antalet
              avgivna röster. Förslag till ändring av stadgarna får ges såväl av medlem som
              styrelsen. Förslag på ändring måste ha skickats ut två veckor före årsmötet för att
              behandlas.
            </p>

            <h3>§ 13 Utträde</h3>
            <p>
              Medlem som önskar utträda ur föreningen ska skriftligen anmäla detta till styrelsen
              och anses därmed omedelbart ha lämnat föreningen. Medlem som inte betalar
              medlemsavgiften anses ha utträtt av föreningen under förutsättning att
              medlemsavgift aviserats.
            </p>

            <h3>§ 14 Uteslutning</h3>
            <p>
              Medlem får inte uteslutas ur föreningen av annan anledning än att den har försummat
              att betala beslutade avgifter, motarbetat föreningens verksamhet eller ändamål,
              eller uppbarligen skadat föreningens intressen.
            </p>

            <h3>§ 15 Upplösning av föreningen</h3>
            <p>
              För upplösning av föreningen krävs beslut av årsmöte med minst 2/3 av antalet
              avgivna röster. Om föreningen upplöses ska föreningens tillgångar överlämnas till
              verksamhet med liknande syfte.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
