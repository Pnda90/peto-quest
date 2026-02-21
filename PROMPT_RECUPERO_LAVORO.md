**Contesto del Progetto:**
Stiamo sviluppando "Peto Quest", un gioco web HTML5 stile endless runner a 3 corsie (simile a Subway Surfers / Temple Run).
Lo stack tecnologico utilizzato e rigorosamente configurato è: **Phaser 3 + TypeScript + Vite**.

**Stato Attuale (Cosa è stato fatto finora):**
1. **Sprint 1 (Core Gameplay):** Completato. Abbiamo la struttura di base del gioco in `src/game/`. È stato implementato un `InputSystem` (che supporta tastiere e swipe touch), il movimento "finto 3D" su 3 corsie (sinistra, centro, destra), meccaniche di salto e scivolata, spawn procedurale di ostacoli con velocità crescente e gestione delle collisioni basata sullo stato del giocatore. Le scene base sono: Boot, Preload, Menu, Game, GameOver.
2. **Sprint 2 (Asset Builder & Polish):** Completato. Per evitare dipendenze esterne, abbiamo progettato un "Asset Builder" interno in `tools/asset-builder/`. Questo tool sfrutta le Native Canvas API per disegnare proceduralmente gli asset (il player "Gassy", gli ostacoli come "Toot Trap" e "Spike Bush", gli sfondi in parallasse stile organi interni e le particelle). 
3. **Automazione Asset:** È stato creato uno script Node headless (`tools/asset-builder/extract.js` basato su Puppeteer) che estrae queste canvas dal DOM e salva automaticamente i file JSON e PNG finali nella cartella `public/generated/`.
4. **Juice e Polish:** In `GameScene.ts` le texture autogenerate sono perfettamente collegate. Abbiamo aggiunto polish ("juice"): particelle di polvere in corsa (`dustEmitter`), screen shake alla morte, e tween di contrazione/espansione per salto e scivolata.

**Obiettivo Attuale (Da dove ripartire):**
Il gioco ora è super fluido e graficamente in piedi. Il nostro prossimo obiettivo è lo **Sprint 3: Metagame & Ritenzione (Power-ups, Economia, SaveSystem)**.

I prossimi task da sviluppare sono:
- [ ] **Sistema di Power-up e Monete:** Inserire "Fagioli" o "Monete" da raccogliere durante la corsa (aggiungendo la logica di spawn oltre agli ostacoli). Inserire power-up temporanei (es. Invincibilità, Magnete monete).
- [ ] **Economia e Shop:** Creare una scena "Shop" accessibile dal Menu dove poter spendere le monete raccolte per comprare skin/colori alternativi o potenziamenti di durata.
- [ ] **SaveSystem:** Implementare un manager che scriva in `localStorage` in modo asincrono/sincrono per mantenere persistenti: High Score, Monete totali e upgrade sbloccati.

**Struttura Directory Essenziale / Comandi Utili:**
- Root del progetto (da cui eseguire i comandi): la cartella di Vite `/fart-quest/`
- Avviare il gioco per fare debug: `npm run dev`
- Ricompilare e rigenerare tutti gli assets procedurali (se modifichi il codice in `tools/asset-builder/draw/`): `npm run build && node tools/asset-builder/extract.js`

---
**Istruzione per l'AI:** Leggi questo documento, conferma di aver compreso l'architettura procedurale e la struttura Phaser 3 divisa in Scene/Consts/Systems, e chiedimi da quale task dello **Sprint 3** vogliamo iniziare a scrivere il codice.
