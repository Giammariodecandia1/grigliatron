# 🔥 Come creare il tuo GrigliaTron gratis in 20 minuti

GrigliaTron è gratuito, ma per usarlo devi creare la **tua copia personale** online.  
Non devi programmare: devi solo seguire questi passaggi.  
Ti servono un **account Google** e un **account Netlify** gratuito.

Alla fine avrai un link personale (tipo `https://mio-grigliatron.netlify.app`) da condividere con gli amici per organizzare il tuo evento.

---

## 📋 Cosa stai per fare

1. Creare una copia del progetto GrigliaTron sul tuo profilo Netlify (il "server" gratuito che ospiterà l'app).
2. Creare un progetto Firebase (il "database" gratuito che salverà i dati dell'evento).
3. Collegare i due servizi inserendo delle chiavi.
4. Creare il tuo primo evento e condividere il link.

**Tempo richiesto:** 15–20 minuti  
**Costo:** 0 €  
**Serve programmare?** No

---

## 🧰 Cosa ti serve

- Un **account Google** (quello che usi per Gmail)
- Un **account Netlify** gratuito — [Registrati qui](https://app.netlify.com/signup) (puoi usare il tuo account Google o GitHub)
- Un **account GitHub** gratuito — [Registrati qui](https://github.com/signup) (serve per copiare il progetto)

---

## Step 1 — Crea la tua copia su Netlify

1. Clicca su questo bottone:

   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Giammariodecandia1/grigliatron)

2. Netlify ti chiederà di collegare il tuo account GitHub. Fallo.
3. Ti verrà chiesto di dare un nome al "repository" (la tua copia del progetto). Puoi chiamarlo come vuoi, ad esempio `mio-grigliatron`.
4. **Non compilare** ancora le variabili d'ambiente (Environment Variables). Le aggiungeremo dopo.
5. Clicca su **Save & Deploy**.

> ⏳ Il sito verrà pubblicato, ma non funzionerà ancora. È normale! Manca il collegamento con Firebase.

---

## Step 2 — Crea il progetto Firebase

Firebase è il servizio gratuito di Google che farà da "database" per la tua app.

1. Vai su 👉 [Firebase Console](https://console.firebase.google.com/)
2. Accedi con il tuo account Google.
3. Clicca su **Aggiungi progetto** (o "Add project").
4. Dai un nome al progetto. Esempio: `grigliatron-marco` o `grigliatron-festa-estate`.
5. Alla domanda su Google Analytics: **disabilita** (non serve). Clicca **Crea progetto**.
6. Aspetta qualche secondo. Quando dice "Il tuo progetto è pronto", clicca **Continua**.

---

## Step 3 — Registra la Web App Firebase

Ora devi dire a Firebase che la tua app è un sito web.

1. Nella dashboard del progetto Firebase, cerca l'icona **</>** (Web) e cliccala.
2. Dai un nome alla tua app (es. "Grigliatron Web"). **Non** spuntare "Firebase Hosting".
3. Clicca **Registra app**.
4. Ti apparirà un blocco di codice con le tue chiavi. **Non chiudere questa pagina!**  
   Le chiavi che ti servono sono queste (copia i valori dopo il `=`):
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

> 💡 **Consiglio:** Copia tutto il blocco in un file di testo temporaneo per non perderlo.

5. Clicca **Vai alla console**.

---

## Step 4 — Abilita Google Login

Perché i tuoi amici possano accedere con il loro account Google:

1. Nel menu a sinistra di Firebase, clicca **Authentication** (o "Autenticazione").
2. Clicca **Inizia** (o "Get started").
3. Nella tab **Sign-in method**, trova **Google** e clicca il pulsante per abilitarlo.
4. Ti chiede una email di supporto: inserisci la tua email Gmail.
5. Clicca **Salva**.

---

## Step 5 — Crea Firestore Database

Il database dove verranno salvati gli eventi, le liste, i sondaggi, ecc.

1. Nel menu a sinistra, clicca **Firestore Database**.
2. Clicca **Crea database** (o "Create database").
3. Scegli una regione vicina a te. Per l'Italia: `eur3 (europe-west)`.
4. Seleziona **Avvia in modalità di produzione** ("Start in production mode").
5. Clicca **Crea**.
6. Ora vai nella tab **Regole** (Rules).
7. **Cancella tutto** quello che c'è scritto.
8. Vai nel repository GitHub di GrigliaTron, apri il file `firestore.rules`, copia tutto il contenuto e incollalo qui.
9. Clicca **Pubblica** (Publish).

---

## Step 6 — Crea Storage

Lo storage serve per salvare le foto degli scontrini e la foto ricordo dell'evento.

1. Nel menu a sinistra, clicca **Storage**.
2. Clicca **Inizia** (o "Get started").
3. Seleziona la stessa regione di prima.
4. Clicca **Fine**.
5. Vai nella tab **Regole** (Rules).
6. **Cancella tutto** quello che c'è scritto.
7. Vai nel repository GitHub di GrigliaTron, apri il file `storage.rules`, copia tutto il contenuto e incollalo qui.
8. Clicca **Pubblica** (Publish).

---

## Step 7 — Copia le chiavi Firebase

Se hai ancora la pagina con le chiavi aperta, perfetto! Altrimenti:

1. Nella dashboard Firebase, clicca sull'**ingranaggio ⚙️** in alto a sinistra > **Impostazioni progetto**.
2. Scorri in basso fino alla sezione **Le tue app** > la tua app web.
3. Troverai di nuovo il blocco con `apiKey`, `authDomain`, ecc.

Copia i 6 valori. Ti serviranno nel prossimo step.

---

## Step 8 — Inserisci le variabili su Netlify

Ora colleghiamo Firebase a Netlify:

1. Vai su 👉 [Netlify Dashboard](https://app.netlify.com/)
2. Clicca sul tuo sito (quello che hai creato allo Step 1).
3. Vai su **Site configuration** (o "Site settings") > **Environment variables**.
4. Clicca **Add a variable** e inserisci **una alla volta** queste 6 variabili:

| Chiave | Dove la trovi |
|--------|---------------|
| `VITE_FIREBASE_API_KEY` | Il valore di `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Il valore di `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | Il valore di `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Il valore di `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Il valore di `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Il valore di `appId` |

5. *(Opzionale ma consigliato)* Aggiungi anche:  
   `VITE_ADMIN_EMAILS` = `la.tua.email@gmail.com`  
   Questo ti darà i poteri di super-admin su tutti gli eventi.

---

## Step 9 — Fai Redeploy

Dopo aver inserito le variabili, devi far ripartire il sito perché le legga:

1. Su Netlify, vai su **Deploys** (nel menu in alto del tuo sito).
2. Clicca **Trigger deploy** > **Deploy site** (o "Clear cache and deploy site").
3. Aspetta 1-2 minuti che il deploy finisca.

---

## Step 10 — Autorizza il dominio e Crea il tuo primo evento

Ultimo passaggio! Firebase deve sapere da quale sito arrivano i login:

1. Copia l'URL del tuo sito Netlify (es. `https://mio-grigliatron.netlify.app`).
2. Torna su **Firebase Console** > **Authentication** > **Settings** > **Authorized domains**.
3. Clicca **Aggiungi dominio** e incolla il dominio del tuo sito Netlify (senza `https://`).

Ora apri il tuo sito Netlify nel browser:

4. Fai **login con Google**.
5. Clicca su **"+ Crea nuovo evento"**.
6. Segui il wizard: inserisci titolo, data, luogo e scegli il tema.
7. 🎉 **Il tuo primo evento è online!**

---

## Step 11 — Condividi il link agli amici

1. Apri il tuo evento.
2. Vai nella tab **Info** e troverai la card **"Condividi evento"**.
3. Copia il link e mandalo su WhatsApp ai tuoi amici.
4. Se hai attivato l'accesso ospiti (Guest), i tuoi amici potranno partecipare anche senza account Google: basterà inserire il proprio nome.

---

## ❓ Problemi comuni

| Problema | Soluzione |
|----------|-----------|
| Il sito mostra "Firebase non configurato" | Hai dimenticato di inserire le variabili su Netlify (Step 8) o non hai fatto il redeploy (Step 9) |
| Il login Google non funziona | Hai dimenticato di abilitare Google come metodo di login su Firebase (Step 4) oppure non hai autorizzato il dominio Netlify (Step 10) |
| Errore "Permission denied" | Le regole Firestore o Storage non sono state copiate correttamente (Step 5 e 6) |
| Il sito si vede ma è tutto vuoto | È normale! Devi creare il tuo primo evento (Step 10) |
| I miei amici non riescono a entrare come ospiti | Verifica che l'opzione "Consenti accesso senza Google" sia attiva nel tuo evento |

---

## ❓ FAQ

**Quanto costa?**  
Zero. Firebase Spark e Netlify Free sono gratuiti per sempre.

**C'è un limite di eventi?**  
No, puoi creare quanti eventi vuoi.

**C'è un limite di utenti?**  
Firebase Spark supporta fino a 50.000 letture/giorno e 20.000 scritture/giorno. Per una grigliata tra amici è più che sufficiente.

**I miei dati sono al sicuro?**  
I dati sono nel TUO progetto Firebase. Nessun altro può vederli. Giammario non ha accesso ai tuoi dati.

**Posso usarlo per eventi aziendali?**  
GrigliaTron è pensato per eventi informali tra amici. Per eventi pubblici o sensibili, consulta la sezione "Security Model" nel README.

**Posso personalizzare i colori?**  
Sì, ma devi modificare il codice. Consulta la sezione "Per gli sviluppatori" nel README.

---

## 👨‍💻 Crediti

GrigliaTron è un progetto open source ideato e sviluppato da **Giammario de Candia**.

Nasce da un'esigenza reale: organizzare una grigliata tra amici senza perdersi nel caos dei messaggi, delle liste duplicate e dei "chi porta cosa?".

Il progetto viene messo gratuitamente a disposizione di tutti i grigliatori nerd, volenterosi e organizzatori seriali che vogliono gestire eventi informali in modo semplice, collaborativo e un po' più intelligente.

🔗 [LinkedIn — Giammario de Candia](https://www.linkedin.com/in/giammario-de-candia-11895090)

---

## ?? Offrimi una birra

GrigliaTron nasce da una grigliata vera ed � condiviso gratuitamente con chiunque voglia organizzare eventi senza caos.

Se il progetto ti � stato utile, puoi offrirmi simbolicamente una birra:

?? **[?? Offrimi una birra](https://paypal.me/Aeroverify)**

Sar� molto apprezzato.
