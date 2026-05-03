import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isFirebaseConfigured } from './config/firebase';
import MyEventsPage from './components/pages/MyEventsPage';
import CreateEventWizard from './components/pages/CreateEventWizard';
import EventDashboard from './components/pages/EventDashboard';
import AboutPage from './components/pages/AboutPage';
import './App.css';

function SetupScreen() {
  const vars = [
    { key: 'VITE_FIREBASE_API_KEY', ok: !!import.meta.env.VITE_FIREBASE_API_KEY },
    { key: 'VITE_FIREBASE_AUTH_DOMAIN', ok: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN },
    { key: 'VITE_FIREBASE_PROJECT_ID', ok: !!import.meta.env.VITE_FIREBASE_PROJECT_ID },
    { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', ok: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID },
    { key: 'VITE_FIREBASE_APP_ID', ok: !!import.meta.env.VITE_FIREBASE_APP_ID },
  ];

  return (
    <div className="app-splash">
      <div className="splash-content">
        <span className="splash-emoji">🔥</span>
        <h1 className="splash-title">GrigliaTron</h1>
        <p className="splash-subtitle">Il gestionale leggero per organizzare grigliate, feste e ritrovi senza caos su WhatsApp.</p>
        <div className="setup-box">
          <h3>⚙️ Configura GrigliaTron</h3>
          <p>Firebase non è ancora configurato. Segui il tutorial nel README per creare il tuo progetto Firebase gratuito e collegarlo a Netlify.</p>
          <div className="setup-vars">
            <h4>Variabili richieste:</h4>
            <ul className="setup-vars-list">
              {vars.map(v => (
                <li key={v.key} className={v.ok ? 'setup-var-ok' : 'setup-var-missing'}>
                  {v.ok ? '✅' : '❌'} <code>{v.key}</code>
                </li>
              ))}
            </ul>
            <p className="setup-var-optional">
              Opzionale: <code>VITE_ADMIN_EMAILS</code> (super-admin globali, separati da virgola)
            </p>
          </div>
          <div className="setup-vars" style={{ borderLeft: '4px solid #FF9800', marginTop: '1rem' }}>
            <h4>⚠️ Passo critico: Autorizza il dominio</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              Dopo aver inserito le variabili e fatto il deploy, devi autorizzare il dominio Netlify in Firebase:
            </p>
            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>Vai su <strong>Firebase Console → Authentication → Settings</strong></li>
              <li>Trova <strong>Authorized domains</strong></li>
              <li>Clicca <strong>Add domain</strong> e inserisci il tuo dominio Netlify (es: <code>mio-sito.netlify.app</code>)</li>
            </ol>
            <p style={{ fontSize: '0.85rem', color: '#FF9800', marginTop: '0.5rem' }}>
              Senza questo passo, il login Google non funzionerà!
            </p>
          </div>
          <div className="setup-links">
            <a href="https://console.firebase.google.com/" target="_blank" rel="noopener" className="btn btn-primary">
              🔗 Firebase Console
            </a>
            <p className="setup-hint">Dopo aver inserito le variabili su Netlify, fai un nuovo deploy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const { signIn } = useAuth();

  return (
    <div className="app-splash">
      <div className="splash-content">
        <span className="splash-emoji">🔥</span>
        <h1 className="splash-title">GrigliaTron</h1>
        <p className="splash-subtitle">Il gestionale leggero per organizzare grigliate, feste e ritrovi senza caos su WhatsApp.</p>
        <button className="btn btn-login-main" onClick={signIn}>
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Accedi con Google
        </button>
        <p className="splash-hint">Accedi per creare e gestire eventi con i tuoi amici.</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-splash">
        <div className="splash-content">
          <span className="splash-emoji">🔥</span>
          <h1 className="splash-title">GrigliaTron</h1>
          <p className="splash-subtitle">Caricamento...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Dashboard evento — accessibile anche ai guest */}
      <Route path="/event/:eventId" element={<EventDashboard />} />
      {/* About — accessibile a tutti */}
      <Route path="/about" element={<AboutPage />} />
      {/* Route protette — solo utenti Google */}
      <Route path="/create" element={user ? <CreateEventWizard /> : <LandingPage />} />
      <Route path="/events" element={user ? <MyEventsPage /> : <LandingPage />} />
      <Route path="/" element={user ? <MyEventsPage /> : <LandingPage />} />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  if (!isFirebaseConfigured) {
    return <SetupScreen />;
  }

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
