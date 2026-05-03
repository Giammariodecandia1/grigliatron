# 🔥 GrigliaTron 2.0 — Adoption Ready

**GrigliaTron** è un gestionale web open source e gratuito per organizzare grigliate, feste e ritrovi tra amici.  
Nasce per risolvere il problema dei gruppi WhatsApp caotici, delle liste duplicate e della classica domanda: *"Chi porta cosa?"*

Niente server da gestire, niente database a pagamento: si appoggia interamente al piano Spark (gratuito) di Firebase e a Netlify.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Giammariodecandia1/grigliatron)

> 💡 **Non sei uno sviluppatore?** Leggi la [GUIDA_RAPIDA.md](https://github.com/Giammariodecandia1/grigliatron/blob/main/GUIDA_RAPIDA.md) per creare la tua copia in 20 minuti senza scrivere una riga di codice.

---

## 📋 Indice

1. [Cos'è GrigliaTron](#-cosè-grigliatron)
2. [A chi serve](#-a-chi-serve)
3. [Cosa risolve](#-cosa-risolve)
4. [Screenshot](#-screenshot)
5. [Setup rapido per utenti non tecnici](#-setup-rapido-per-utenti-non-tecnici)
6. [Deploy to Netlify](#-deploy-to-netlify)
7. [Configurazione Firebase](#-configurazione-firebase)
8. [Creazione primo evento](#-creazione-primo-evento)
9. [Guest Access](#-guest-access)
10. [Security Model](#️-security-model)
11. [Per gli sviluppatori](#-per-gli-sviluppatori)
12. [Roadmap](#-roadmap)
13. [Crediti](#-crediti)
14. [Licenza](#-licenza)

---

## 🔥 Cos'è GrigliaTron

GrigliaTron è una web app **self-hosted** e **multi-evento** che trasforma l'organizzazione di eventi informali da un caos di messaggi su WhatsApp in un'esperienza ordinata, collaborativa e — ammettiamolo — un po' nerd.

**Caratteristiche principali:**

*   **Self-Hosted & Gratuito**: Lo ospiti sul tuo account Firebase/Netlify a costo zero.
*   **Multi-Evento**: Organizza quante grigliate vuoi dalla stessa dashboard.
*   **Gestione Ospiti (No-Login)**: Chi non vuole usare Google può accedere come "Ospite" tramite un link condiviso.
*   **Liste collaborative in tempo reale**: Cibo, bevande, attrezzatura. Basta cliccare "Ci penso io!".
*   **Sondaggi**: Per decidere data o location senza intasare la chat.
*   **Divisione Spese intelligente**: Calcolo automatico di "Chi deve a Chi" e supporto quote parziali.
*   **Archivio Foto & PDF**: Genera un report PDF dell'evento con scontrini e foto di copertina.
*   **Mobile-First**: Si usa da smartphone, proprio come una vera app.

---

## 🎯 A chi serve

- Gruppi di amici che organizzano grigliate, cene, pic-nic, campeggi.
- Chi è stufo di liste duplicate su WhatsApp.
- Organizzatori seriali che vogliono tenere tutto sotto controllo.
- Chi vuole dividere le spese senza impazzire.

---

## 💡 Cosa risolve

| Il problema | La soluzione GrigliaTron |
|---|---|
| "Chi porta le birre?" chiesto 47 volte | Lista collaborativa con "Ci penso io!" |
| "Dove ci troviamo?" messaggio perso | Card luogo con link Google Maps |
| "Quanto devo a Marco?" | Calcolo automatico dei debiti |
| "Quale data va bene a tutti?" | Sondaggi con voto |
| "Non ho Google, come faccio?" | Accesso ospite senza login |
| Messaggi sparsi in 12 chat | Dashboard unica per evento |

---

## 📸 Screenshot

<!-- Inserisci qui screenshot della tua istanza quando disponibili -->
> 🖼️ *Screenshot disponibili dopo la creazione del primo evento. Pubblica la tua copia per vederne l'aspetto reale!*

---

## 🚀 Setup rapido per utenti non tecnici

Non devi programmare. Ti servono solo un **account Google** e un **account Netlify** gratuito.

**Tempo richiesto:** 15–20 minuti | **Costo:** 0 €

Hai due opzioni:

1. **📖 [Leggi la GUIDA_RAPIDA.md](https://github.com/Giammariodecandia1/grigliatron/blob/main/GUIDA_RAPIDA.md)** — Tutorial passo passo con screenshot e FAQ.

---

## 🌐 Deploy to Netlify

Clicca il bottone per creare la tua copia gratuita:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Giammariodecandia1/grigliatron)

Dopo il deploy, dovrai:
1. Creare un progetto Firebase (gratuito)
2. Inserire le chiavi API nelle variabili d'ambiente di Netlify
3. Fare un redeploy

Tutti i dettagli nella [GUIDA_RAPIDA.md](GUIDA_RAPIDA.md).

---

## 🔧 Configurazione Firebase

### Step 1: Crea il progetto
1. Vai su [Firebase Console](https://console.firebase.google.com/) e accedi con il tuo account Google.
2. Clicca **Aggiungi progetto** (es. "grigliatron-tuonome"). Disabilita Google Analytics.
3. Clicca sull'icona **</>** (Web) per aggiungere un'app. Copia le **API Keys**.

### Step 2: Configura i servizi
1. **Authentication**: Abilita il metodo **Google** nella tab "Sign-in method".
2. **Firestore Database**: Crea il database in modalità produzione. Incolla il contenuto di [`firestore.rules`](firestore.rules) nella tab Regole.
3. **Storage**: Crea lo storage. Incolla il contenuto di [`storage.rules`](storage.rules) nella tab Regole.

### Step 3: Inserisci le variabili su Netlify
In **Site configuration > Environment variables**, inserisci:

| Variabile | Valore |
|---|---|
| `VITE_FIREBASE_API_KEY` | La tua apiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | Il tuo authDomain |
| `VITE_FIREBASE_PROJECT_ID` | Il tuo projectId |
| `VITE_FIREBASE_STORAGE_BUCKET` | Il tuo storageBucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Il tuo messagingSenderId |
| `VITE_FIREBASE_APP_ID` | Il tuo appId |
| `VITE_ADMIN_EMAILS` *(opzionale)* | La tua email per super-admin |

### Step 4: Autorizza il dominio
In **Firebase > Authentication > Settings > Authorized domains**, aggiungi il tuo dominio Netlify.

---

## 🎉 Creazione primo evento

1. Apri il tuo sito Netlify e fai **login con Google**.
2. Clicca **"+ Crea nuovo evento"**.
3. Segui il wizard a 5 step: titolo, data, luogo, tema, conferma.
4. L'evento è online! Vai nella tab **Info** per copiare il link di invito.

---

## 👤 Guest Access

GrigliaTron è pensato per essere *Zero-Friction*:

- Il creatore dell'evento genera un **link di invito**.
- Se l'opzione "Consenti accesso senza Google" è attiva, l'amico clicca il link e inserisce solo il proprio **nome**.
- I dati degli ospiti vengono salvati nel browser (localStorage). Se l'ospite cambia dispositivo o cancella i dati, perderà la sua "identità".
- Per gli organizzatori abituali è sempre consigliato il **login con Google**.

---

## 🛡️ Security Model

GrigliaTron adotta un approccio **trust-based** (basato sulla fiducia) pensato per eventi informali tra amici.

| Modalità | Quando usarla | Comportamento |
|---|---|---|
| **🟢 Friends Mode** | Grigliate tra amici, eventi informali | Guest access attivo, massima semplicità. Le Firestore Rules sulle sub-collections sono aperte per permettere ai Guest di collaborare. La UI blocca modifiche non autorizzate, ma un utente tecnico potrebbe aggirare i controlli lato client. |
| **🔒 Strict Mode** | Quando vuoi maggior controllo | Guest access disabilitato (deseleziona "Consenti accesso senza Google" nella creazione evento). Solo utenti con account Google possono partecipare. |

> ⚠️ **Nota per eventi pubblici o sensibili:** Se prevedi un uso con persone sconosciute, dovrai restringere manualmente le regole in `firestore.rules`, imponendo il check `request.auth != null` in tutte le sub-collections.

In ogni caso, **solo il Creatore (o gli Admin)** può eliminare l'evento o modificarne la struttura principale.

---

## 🛠 Per gli sviluppatori

Se vuoi modificare il codice di GrigliaTron sul tuo PC:

1. Assicurati di avere [Node.js](https://nodejs.org/) installato.
2. Clona la repository: `git clone https://github.com/Giammariodecandia1/grigliatron`
3. Installa le dipendenze: `npm install`
4. Copia `.env.example` in `.env` e riempilo con le tue API keys di Firebase.
5. Avvia il server: `npm run dev`
6. Apri `http://localhost:5173` nel browser.

**Stack tecnologico:** React + Vite + Firebase (Auth, Firestore, Storage) + React Router

---

## 🗺️ Roadmap

- [x] Multi-evento con routing
- [x] Wizard creazione evento
- [x] Guest access (accesso senza login)
- [x] Admin per-evento (non più globale)
- [x] Divisione spese e pagamenti
- [x] Sondaggi con trasformazione in lista
- [x] Report PDF post-evento
- [x] Guida setup per non tecnici
- [x] Pagina launcher/setup interattiva
- [ ] Notifiche push (opzionale)
- [ ] Temi personalizzabili da UI
- [ ] Export/import eventi
- [ ] PWA (installabile come app)
- [ ] Localizzazione multilingua

---

## 👨‍💻 Crediti

GrigliaTron è un progetto open source ideato e sviluppato da **Giammario de Candia**.

Nasce da un'esigenza reale: organizzare una grigliata tra amici senza perdersi nel caos dei messaggi, delle liste duplicate e dei "chi porta cosa?".

Il progetto viene messo gratuitamente a disposizione di tutti i grigliatori nerd, volenterosi e organizzatori seriali che vogliono gestire eventi informali in modo semplice, collaborativo e un po' più intelligente.

🔗 [LinkedIn — Giammario de Candia](https://www.linkedin.com/in/giammario-de-candia-11895090)

---

## 🍺 Offrimi una birra

GrigliaTron nasce da una grigliata vera ed è condiviso gratuitamente con chiunque voglia organizzare eventi senza caos.

Se il progetto ti è stato utile, puoi offrirmi simbolicamente una birra:

👉 **[🍺 Offrimi una birra](https://paypal.me/Aeroverify)**

Sarà molto apprezzato.

---

## 📄 Licenza

**MIT License** — Puoi usarlo, modificarlo, regalarlo e grigliarci sopra. 🥩

Vedi il file [LICENSE](LICENSE) per i dettagli completi.
