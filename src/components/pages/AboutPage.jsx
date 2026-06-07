import { useNavigate } from 'react-router-dom';

/**
 * Pagina About GrigliaTron con crediti autore.
 */
export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <div className="about-container">
        <button className="btn btn-ghost about-back" onClick={() => navigate(-1)}>← Indietro</button>

        <div className="about-hero">
          <span className="about-emoji">🔥</span>
          <h1>GrigliaTron</h1>
          <p className="about-version">Versione 2.0 — Adoption Ready</p>
        </div>

        <div className="about-section">
          <h2>Cos'è GrigliaTron</h2>
          <p>
            GrigliaTron è un progetto open source nato per aiutare gruppi di amici
            a organizzare eventi informali senza caos. Niente più liste duplicate
            su WhatsApp, niente più "chi porta cosa?" ripetuto 47 volte.
          </p>
        </div>

        <div className="about-section">
          <h2>Crediti</h2>
          <p>
            GrigliaTron è un progetto open source ideato e sviluppato da <strong>Giammario de Candia</strong>.
          </p>
          <p>
            Nasce da un'esigenza reale: organizzare una grigliata tra amici senza perdersi
            nel caos dei messaggi, delle liste duplicate e dei "chi porta cosa?".
          </p>
          <p>
            Il progetto viene messo gratuitamente a disposizione di tutti i grigliatori nerd,
            volenterosi e organizzatori seriali che vogliono gestire eventi informali in modo
            semplice, collaborativo e un po' più intelligente.
          </p>
          <a
            href="https://www.linkedin.com/in/giammario-de-candia-11895090"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost about-linkedin"
          >
            🔗 LinkedIn — Giammario de Candia
          </a>
        </div>

        <div className="about-section">
          <h2>Licenza</h2>
          <p>MIT — Usa, modifica e condividi liberamente.</p>
        </div>
      </div>
    </div>
  );
}
