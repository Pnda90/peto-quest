# 🌬️ Peto Quest

**Peto Quest** è un endless runner ad alta velocità in "fake 3D" sviluppato con **Phaser 3** e **TypeScript**. Corri attraverso un percorso insidioso all'interno del sistema digestivo, raccogli i fagioli per aumentare il tuo punteggio ed evita gli ostacoli in questa avventura... gassosa!

## ✨ Caratteristiche

- **Gameplay Dinamico**: Velocità e difficoltà crescenti nel tempo.
- **Audio Procedurale**: Effetti sonori e musica di sottofondo chiptune sintetizzati al 100% tramite Web Audio API — nessun asset esterno richiesto!
- **Loop di Metagioco**:
  - **Skin**: Sblocca ed equipaggia diversi look per il personaggio (Verde Tossico, Vento Dorato).
  - **Potenziamenti**: Spendi i tuoi fagioli guadagnati con fatica per aumentare permanentemente la durata di bonus come la **Calamita** e l'**Invincibilità**.
- **Design Responsivo**: Completamente ottimizzato sia per Desktop (Frecce/WASD) che per Mobile (Gesti swipe).
- **Feedback Coinvolgente**: Vibrazioni della telecamera, flash ed un sistema di moltiplicatori combo per una sensazione arcade premium.

## 🚀 Per Iniziare

### Prerequisiti

- [Node.js](https://nodejs.org/) (v18 o superiore consigliata)
- [npm](https://www.npmjs.com/)

### Installazione

1. Clona la repository (o scarica i sorgenti).
2. Installa le dipendenze:
   ```bash
   npm install
   ```

### Sviluppo

Avvia il server di sviluppo con hot-reload:
```bash
npm run dev
```

### Build per la Produzione

Genera una build di produzione ottimizzata nella cartella `dist/`:
```bash
npm run build
```

## 🛠️ Tecnologie Utilizzate

- **[Phaser 3](https://phaser.io/)** - Motore di gioco web.
- **[TypeScript](https://www.typescriptlang.org/)** - Per una logica di gioco secura e tipizzata.
- **[Vite](https://vitejs.dev/)** - Per un bundling ultra-veloce.
- **Web Audio API** - Per la sintesi sonora chiptune.

## 🎨 Informazioni sugli Asset

Il gioco utilizza un mix di grafiche generate proceduralmente e sprite personalizzati situati in `public/assets`. Gli effetti sonori sono generati a runtime via codice.

## 📱 Come Pubblicare (Gratis su iPhone)

Il gioco è configurato come **PWA** (Progressive Web App).

1. **Deploy su Vercel (Consigliato)**:
   - Vai su [Vercel.com](https://vercel.com) e crea un account gratuito.
   - Trascina questa cartella nel loro dashboard o collegala via GitHub.
   - Il file `vercel.json` che ho creato gestirà tutto automaticamente.
2. **Installazione su iPhone**:
   - Apri l'URL generato da Vercel su **Safari**.
   - Tocca l'icona **Condividi** (il quadrato con la freccia).
   - Seleziona **"Aggiungi alla schermata Home"**.

---

## 🧘‍♂️ Vibe Coding Flow

Questo progetto è un esempio di **Vibe Coding Flow**, un approccio moderno allo sviluppo software dove la visione creativa viene tradotta in codice attraverso una collaborazione fluida tra lo sviluppatore e l'Intelligenza Artificiale.

La realizzazione di questo gioco è stata resa possibile grazie all'utilizzo di **[AgentiPRO](https://github.com/Pnda90/AgentiPRO)**, un framework di agenti IA avanzati creato da Gianluca Bernardo. Nello specifico, è stato utilizzato lo strumento `game-developer.md` per guidare l'intero ciclo di vita dello sviluppo: dalla concezione delle meccaniche alla risoluzione dei bug critici su iOS.

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Consulta il file [LICENSE](LICENSE) per i dettagli.

*Continua a correre, continua a... gasare!* 🌬️💨

