# Come creare il tuo GrigliaTron gratis in 20 minuti

GrigliaTron è gratuito, ma per usarlo devi creare la **tua copia personale** online.

Non devi programmare: devi solo seguire questi passaggi.

Ti servono:

- un **account Google**, quello che usi per Gmail;
- un **account Netlify** gratuito;
- un **account GitHub** gratuito.

Alla fine avrai un link personale, tipo:

```text
https://mio-grigliatron.netlify.app
```

da condividere con gli amici per organizzare il tuo evento.

---

## Cosa stai per fare

In questa guida creerai la tua copia gratuita di GrigliaTron.

Farai 4 cose:

1. Creerai una copia del progetto GrigliaTron su Netlify, cioè il servizio gratuito che ospiterà l’app online.
2. Creerai un progetto Firebase, cioè il servizio gratuito di Google che salverà dati, login, eventi, liste, spese e foto.
3. Collegherai Netlify e Firebase inserendo alcune chiavi.
4. Creerai il tuo primo evento e condividerai il link con gli amici.

**Tempo richiesto:** 15-20 minuti  
**Costo:** 0 euro  
**Serve programmare?** No

---

## Cosa ti serve

Prima di iniziare, assicurati di avere:

- un **account Google**, ad esempio il tuo account Gmail;
- un **account Netlify** gratuito: [registrati qui](https://app.netlify.com/signup);
- un **account GitHub** gratuito: [registrati qui](https://github.com/signup).

Puoi usare lo stesso account Google per registrarti sia su Netlify sia su GitHub, se preferisci.

---

## Schema veloce del percorso

Il percorso completo è questo:

```text
1. Clicca Deploy to Netlify
2. Crea progetto Firebase
3. Registra Web App Firebase
4. Abilita Google Login
5. Crea Firestore Database
6. Crea Storage
7. Copia le chiavi Firebase
8. Incolla le chiavi su Netlify
9. Fai redeploy
10. Autorizza il dominio Netlify su Firebase
11. Crea il primo evento
12. Condividi il link agli amici
```

---

## Step 1 — Crea la tua copia su Netlify

Netlify serve per pubblicare online la tua copia di GrigliaTron.

1. Clicca su questo bottone:

   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Giammariodecandia1/grigliatron)

2. Netlify ti chiederà di collegare il tuo account GitHub. Fallo.

3. Ti verrà chiesto di dare un nome al repository, cioè alla tua copia del progetto. Puoi chiamarlo come vuoi, ad esempio:

```text
mio-grigliatron
```

oppure:

```text
grigliatron-festa-estate
```

4. Se Netlify ti chiede subito delle variabili d’ambiente, per ora **non compilarle**. Le aggiungeremo dopo.

5. Clicca su **Save & Deploy**.

Netlify inizierà a creare il tuo sito.

> Il sito verrà pubblicato, ma non funzionerà ancora. È normale: manca il collegamento con Firebase.

---

## Step 2 — Crea il progetto Firebase

Firebase è il servizio gratuito di Google che farà da database per la tua app.

Serve per salvare:

- eventi;
- partecipanti;
- liste;
- sondaggi;
- spese;
- scontrini;
- foto evento;
- login utenti.

Procedi così:

1. Vai su [Firebase Console](https://console.firebase.google.com/).
2. Accedi con il tuo account Google.
3. Clicca su **Aggiungi progetto** oppure **Add project**.
4. Dai un nome al progetto.

Esempi:

```text
grigliatron-marco
```

oppure:

```text
grigliatron-festa-estate
```

oppure:

```text
grigliatron-famiglia-rossi
```

5. Quando Firebase ti chiede se vuoi attivare Google Analytics, scegli **Disabilita**. Per GrigliaTron non serve.
6. Clicca su **Crea progetto**.
7. Aspetta qualche secondo.
8. Quando Firebase ti dice che il progetto è pronto, clicca su **Continua**.

---

## Step 3 — Registra la Web App Firebase

Ora devi dire a Firebase che GrigliaTron è un sito web.

1. Nella dashboard del progetto Firebase, cerca l’icona **</>**.

   È l’icona per aggiungere una Web App.

2. Cliccala.

3. Dai un nome alla tua app, ad esempio:

```text
GrigliaTron Web
```

4. **Non** spuntare Firebase Hosting. Useremo Netlify.

5. Clicca su **Registra app**.

6. Firebase ti mostrerà un blocco di codice simile a questo:

```js
const firebaseConfig = {
  apiKey: "xxxxxxxx",
  authDomain: "xxxxxxxx.firebaseapp.com",
  projectId: "xxxxxxxx",
  storageBucket: "xxxxxxxx.appspot.com",
  messagingSenderId: "xxxxxxxx",
  appId: "xxxxxxxx"
};
```

7. Non chiudere questa pagina.

Le chiavi che ti servono sono:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

> Consiglio: copia tutto il blocco in un file di testo temporaneo, così non rischi di perderlo.

8. Clicca su **Vai alla console**.

---

## Step 4 — Abilita Google Login

GrigliaTron permette agli utenti di entrare con Google.

Per attivare questa funzione:

1. Nel menu a sinistra di Firebase, clicca su **Authentication**.
2. Clicca su **Inizia** oppure **Get started**.
3. Vai nella tab **Sign-in method**.
4. Trova **Google**.
5. Clicca su Google.
6. Attiva il metodo di accesso.
7. Quando ti chiede una email di supporto, inserisci la tua email Gmail.
8. Clicca su **Salva**.

Da questo momento il login Google è abilitato.

---

## Step 5 — Crea Firestore Database

Firestore è il database dove GrigliaTron salverà tutti i dati dell’app.

Salverà, per esempio:

- eventi;
- partecipanti;
- liste cibo;
- attrezzatura;
- cose da fare;
- sondaggi;
- offerte spesa;
- spese;
- recensioni;
- aggiornamenti.

Procedi così:

1. Nel menu a sinistra di Firebase, clicca su **Firestore Database**.
2. Clicca su **Crea database** oppure **Create database**.
3. Scegli una regione vicina a te.

Per l’Italia va bene una regione europea.

4. Seleziona **Avvia in modalità di produzione**.

5. Clicca su **Crea**.

6. Dopo la creazione del database, vai nella tab **Regole** oppure **Rules**.

7. Cancella tutto quello che trovi scritto.

8. Torna nel repository GitHub di GrigliaTron:

```text
https://github.com/Giammariodecandia1/grigliatron
```

9. Apri il file:

```text
firestore.rules
```

10. Copia tutto il contenuto del file.

11. Incollalo nella sezione Regole di Firestore.

12. Clicca su **Pubblica** oppure **Publish**.

> Questo passaggio è importante: senza le regole corrette, GrigliaTron potrebbe non riuscire a leggere o salvare i dati.

---

## Step 6 — Crea Storage

Firebase Storage serve per salvare file e immagini.

In GrigliaTron viene usato per:

- foto degli scontrini;
- immagine principale dell’evento;
- eventuali PDF ricordo;
- allegati futuri.

Procedi così:

1. Nel menu a sinistra di Firebase, clicca su **Storage**.
2. Clicca su **Inizia** oppure **Get started**.
3. Seleziona la stessa regione scelta per Firestore, se possibile.
4. Clicca su **Fine**.
5. Vai nella tab **Regole** oppure **Rules**.
6. Cancella tutto quello che trovi scritto.
7. Torna nel repository GitHub di GrigliaTron:

```text
https://github.com/Giammariodecandia1/grigliatron
```

8. Apri il file:

```text
storage.rules
```

9. Copia tutto il contenuto del file.
10. Incollalo nella sezione Regole di Firebase Storage.
11. Clicca su **Pubblica** oppure **Publish**.

---

## Step 7 — Copia le chiavi Firebase

Se hai ancora aperta la pagina con le chiavi Firebase, perfetto.

Se invece l’hai chiusa, puoi ritrovarle così:

1. Vai nella dashboard del tuo progetto Firebase.
2. Clicca sull’**ingranaggio** in alto a sinistra.
3. Clicca su **Impostazioni progetto**.
4. Scorri in basso fino alla sezione **Le tue app**.
5. Clicca sulla tua Web App.
6. Troverai di nuovo il blocco con:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Copia questi 6 valori:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

Ti serviranno nello step successivo.

---

## Step 8 — Inserisci le variabili su Netlify

Ora colleghiamo Firebase a Netlify.

1. Vai su [Netlify Dashboard](https://app.netlify.com/).
2. Clicca sul sito che hai creato allo Step 1.
3. Vai su **Site configuration** oppure **Site settings**.
4. Vai su **Environment variables**.
5. Clicca su **Add a variable**.
6. Inserisci una alla volta queste variabili:

| Chiave Netlify | Valore Firebase da copiare |
|---|---|
| `VITE_FIREBASE_API_KEY` | valore di `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | valore di `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | valore di `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | valore di `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | valore di `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | valore di `appId` |

### Variabile opzionale ma consigliata

Puoi aggiungere anche:

| Chiave Netlify | Valore |
|---|---|
| `VITE_ADMIN_EMAILS` | la tua email Gmail |

Esempio:

```text
VITE_ADMIN_EMAILS=la.tua.email@gmail.com
```

Questa variabile ti dà poteri di super-admin nella tua copia di GrigliaTron.

Non è obbligatoria, perché chi crea un evento diventa già admin di quell’evento.

---

## Step 9 — Fai redeploy

Dopo aver inserito le variabili, devi far ripartire il sito perché Netlify le legga.

1. Su Netlify, vai su **Deploys**.
2. Clicca su **Trigger deploy**.
3. Clicca su **Deploy site**.

In alternativa, se disponibile, puoi usare:

```text
Clear cache and deploy site
```

4. Aspetta 1-2 minuti che il deploy finisca.

Quando il deploy è completato, il tuo sito è collegato a Firebase.

---

## Step 10 — Autorizza il dominio Netlify su Firebase

Firebase deve sapere da quale sito arrivano i login Google.

1. Copia l’URL del tuo sito Netlify.

Esempio:

```text
https://mio-grigliatron.netlify.app
```

2. Torna su **Firebase Console**.
3. Vai su **Authentication**.
4. Vai su **Settings**.
5. Cerca la sezione **Authorized domains**.
6. Clicca su **Aggiungi dominio** oppure **Add domain**.
7. Incolla il dominio del tuo sito Netlify **senza** `https://`.

Esempio:

```text
mio-grigliatron.netlify.app
```

8. Salva.

---

## Step 11 — Crea il tuo primo evento

Ora apri il tuo sito Netlify nel browser.

1. Fai login con Google.
2. Dovresti vedere la pagina **I miei eventi**.
3. Clicca su **Crea nuovo evento**.
4. Segui il wizard.
5. Inserisci:

- titolo evento;
- tipo evento;
- data;
- ora;
- luogo;
- link Google Maps, se vuoi;
- descrizione;
- tema grafico;
- accesso ospite sì/no.

6. Alla fine clicca su **Crea evento**.

Il tuo primo evento è online.

---

## Step 12 — Condividi il link agli amici

1. Apri il tuo evento.
2. Vai nella tab **Info**.
3. Troverai la card **Condividi evento**.
4. Copia il link.
5. Mandalo su WhatsApp agli amici.

Se hai attivato l’accesso ospiti, gli amici potranno entrare anche senza account Google.

Dovranno solo inserire il proprio nome.

---

## Messaggio WhatsApp consigliato

Puoi usare questo messaggio:

```text
Ti invito su GrigliaTron per organizzarci senza caos su WhatsApp.

Apri il link, conferma la presenza e scegli cosa portare:

[INCOLLA QUI IL LINK EVENTO]
```

---

## Accesso ospite

GrigliaTron permette anche l’accesso come ospite, se l’organizzatore lo abilita.

Questo è utile quando vuoi far partecipare amici che non vogliono fare login con Google.

Un ospite può:

- vedere l’evento;
- confermare la presenza;
- aggiungere elementi;
- cliccare “Ci penso io”;
- partecipare all’organizzazione;
- modificare solo ciò che ha creato lui dallo stesso dispositivo.

Un ospite non può:

- essere admin;
- modificare le impostazioni dell’evento;
- gestire altri partecipanti;
- modificare contenuti creati da altri.

> Nota: l’accesso ospite è pensato per eventi informali tra amici. Per eventi pubblici, aziendali o sensibili, è meglio disattivarlo.

---

## Problemi comuni

| Problema | Soluzione |
|---|---|
| Il sito mostra “Firebase non configurato” | Hai dimenticato di inserire le variabili su Netlify oppure non hai fatto il redeploy. Controlla Step 8 e Step 9. |
| Il login Google non funziona | Hai dimenticato di abilitare Google Login su Firebase oppure non hai autorizzato il dominio Netlify. Controlla Step 4 e Step 10. |
| Compare “Permission denied” | Le regole Firestore o Storage non sono state copiate correttamente. Controlla Step 5 e Step 6. |
| Il sito si vede ma non ci sono eventi | È normale. Devi creare il tuo primo evento. Controlla Step 11. |
| Gli amici non riescono a entrare come ospiti | Verifica che l’opzione “Consenti accesso senza Google” sia attiva nel tuo evento. |
| Dopo aver inserito le variabili il sito non cambia | Devi fare un nuovo deploy su Netlify. Controlla Step 9. |
| Aprendo un link evento compare errore 404 | Verifica che il file `_redirects` sia presente nel progetto e che il deploy sia aggiornato. |
| Storage non funziona | Controlla di aver creato Firebase Storage e copiato correttamente le regole `storage.rules`. |

---

## FAQ

### Quanto costa?

Zero.

Firebase Spark e Netlify Free sono gratuiti e sufficienti per piccoli eventi informali.

### Devo programmare?

No.

Devi solo seguire i passaggi della guida.

### Serve installare qualcosa sul computer?

No.

Tutto avviene online tramite browser.

### Devo avere un dominio?

No.

Netlify ti fornisce un dominio gratuito, per esempio:

```text
https://mio-grigliatron.netlify.app
```

### Posso creare più eventi?

Sì.

Puoi creare più eventi dalla stessa copia di GrigliaTron.

### Posso usare GrigliaTron per compleanni o cene?

Sì.

GrigliaTron non serve solo per grigliate. Puoi usarlo per:

- grigliate;
- cene;
- compleanni;
- feste;
- uscite;
- piccoli viaggi;
- eventi informali.

### I miei dati sono visibili a Giammario?

No.

I dati sono nel **tuo** progetto Firebase.

Giammario non ha accesso ai tuoi dati, ai tuoi eventi o ai tuoi partecipanti.

### Posso usarlo per eventi aziendali?

GrigliaTron è pensato per eventi informali tra amici.

Per eventi pubblici, aziendali o sensibili, leggi la sezione **Security Model** nel README.

### Posso disattivare l’accesso ospite?

Sì.

Quando crei un evento puoi scegliere se consentire o meno l’accesso senza Google.

### Posso personalizzare colori e testi?

Sì, ma devi modificare il codice.

Consulta la sezione per sviluppatori nel README.

### Posso contribuire al progetto?

Sì.

Il progetto è open source. Puoi proporre miglioramenti, aprire issue o inviare pull request su GitHub.

---

## Security Model in breve

GrigliaTron è pensato per eventi informali tra amici.

Quando l’accesso ospite è attivo, il modello è basato sulla fiducia tra partecipanti.

Per eventi tra amici, questa impostazione rende tutto più semplice.

Per eventi pubblici, aziendali o sensibili, è consigliato:

- disattivare l’accesso ospite;
- usare solo login Google;
- leggere attentamente le regole Firebase;
- restringere le regole Firestore e Storage se necessario.

---

## Crediti

GrigliaTron è un progetto open source ideato e sviluppato da **Giammario de Candia**.

Nasce da un’esigenza reale: organizzare una grigliata tra amici senza perdersi nel caos dei messaggi, delle liste duplicate e dei “chi porta cosa?”.

Il progetto viene messo gratuitamente a disposizione di tutti i grigliatori nerd, volenterosi e organizzatori seriali che vogliono gestire eventi informali in modo semplice, collaborativo e un po’ più intelligente.

Puoi seguire i miei progetti su LinkedIn:

[LinkedIn — Giammario de Candia](https://www.linkedin.com/in/giammario-de-candia-11895090)

---

## Offrimi una birra

GrigliaTron nasce da una grigliata vera ed è condiviso gratuitamente con chiunque voglia organizzare eventi senza caos.

Se il progetto ti è stato utile, puoi offrirmi simbolicamente una birra:

[Offrimi una birra](https://paypal.me/Aeroverify)

Sarà molto apprezzato.

---

## Licenza

GrigliaTron è distribuito con licenza MIT.

Puoi usarlo, modificarlo e condividerlo liberamente, nel rispetto della licenza.
