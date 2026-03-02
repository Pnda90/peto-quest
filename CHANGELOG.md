# Changelog

## v0.2.0 — Salto Qualitativo ✨ (2 Marzo 2026)

Upgrade completo dell'esperienza visiva e del game feel. Il gioco passa da prototipo funzionale a esperienza **premium e coinvolgente**.

### 🎨 Nuovi Asset Visivi (AI-Generated)
- **Sfondi parallax** — tunnel organico bioluminescente + cellule fluttuanti
- **Stellina invincibilità** — stella dorata a 5 punte con glow (procedurale)
- **Magnete** — ferro di cavallo rosso con punte argento e scintille (procedurale)
- **Acid Trap** — pozza acida verde con bolle e bordo luminoso (procedurale)
- **Texture VFX** — `lane_glow`, `speed_line`, `spark`, `trail_particle`, `menu_particle`

### 🎯 UI/UX Redesign
- **Font Outfit** (Google Fonts) su tutte le scene
- **Gradient backgrounds** animati con particelle fluttuanti
- **Pulsanti premium** con shadow, highlight, scale animation, icone emoji
- **MenuScene** — titolo con glow, missione con progress bar, stats bar
- **SelectionScene** — food card glassmorphism con hover animation
- **GameOverScene** — contatori animati, particelle oro per nuovo record, medaglie
- **ShopScene** — card premium con level dots ●○, sezioni SKIN/POTENZIAMENTI
- **LeaderboardScene** — medaglie 🥇🥈🥉, righe con bordi colorati top 3
- **SettingsScene** — toggle switch visuale al posto del testo

### 🚀 Gameplay VFX
- **Corsie luminose** — linee glow animate con scrolling parallax
- **Player glow trail** — scia verde dietro il personaggio
- **Spark burst** — esplosione dorata alla raccolta coin/powerup
- **Speed lines** — linee diagonali ad alta velocità
- **HUD premium** — barra arrotondata semi-trasparente con font Outfit
- **Stage transitions** — flash viola + zoom text
- **Score popup** — testo `+punti` con animazione fade-up
- **Challenge UI** — missioni con emoji 🫘 🦘 💨

### 🛠️ Fix & Polish
- **Palette colori** aggiornata: viola/oro/verde premium
- **Text overflow** corretto in mission card, shop cards, leaderboard rows
- **Asset broken** sostituiti con texture procedurali (stellina, magnete, acid trap)
- **Loading bar** premium con titolo, percentuale e gradiente

### 🧪 Verifiche
- TypeScript: zero errori compilazione
- Unit test: 5/5 passed (SaveManager)
- Visual: verificato in browser (menu, shop, gameplay, game over)
