# Winamp Spotify Skin - Implementationsplan

## Projektöversikt

**Mål**: Bygga en funktionell Winamp-klon som agerar skin för Spotify Web Playback SDK. Användare kan logga in med sitt Spotify Premium-konto och spela upp musik genom ett nostalgiskt Winamp-gränssnitt med fullt fungerande visualizer.

**Kärnfunktioner**:
- Autentisk Winamp Classic-UI (äkta pixel-perfect design)
- Spotify Premium Web Playback SDK-integration
- Realtids audiospektrum-visualizer med presets
- Spelarkontroller (play/pause, seek, volym, shuffle, repeat)
- Playlista-hantering och sökning
- Persistent state (Zustand)

## Tech Stack

### Frontend Core
- **React 18** - UI-ramverk
- **TypeScript** - Type safety
- **Vite** - Build tool och dev server
- **Zustand** - State management (lättviktig, perfekt för denna storlek)

### Spotify Integration
- **Spotify Web Playback SDK** - Audio playback
- **Spotify Web API** - Metadata, playlists, search
- **PKCE OAuth Flow** - Säker autentisering utan backend

### Visualizer
- **Canvas API** - 2D rendering
- **Web Audio API** - Realtids-frekvensanalys
- **Modulärt preset-system** - Utbytbara visuella effekter

### Styling
- **CSS Modules** - Scoped styling
- **Pixel-perfect Winamp sprites** - Autentisk look

### Dev Tools
- **ESLint + Prettier** - Code quality
- **Vitest** - Unit testing (optional, later)

## Teamroller

- **Frontend Architect (Generalist)** - Projektstruktur, React-komponenter, state management
- **Spotify Specialist (SDK Expert)** - Auth flow, SDK integration, API-calls
- **Visualizer Dev (Plugin Maestro)** - Canvas rendering, Audio API, preset system

---

## Fasindelning

### Fas 1: Grundstruktur och Boilerplate
**Mål**: Få igång projektet med Vite, skapa grundläggande filstruktur och core UI-komponenter.

**Ansvarig**: Frontend Architect

**Uppgifter**:
1. ✅ Initiera Vite + React + TypeScript-projekt
2. ✅ Konfigurera ESLint, Prettier, tsconfig
3. ✅ Skapa mappstruktur (se Filstruktur nedan)
4. ✅ Sätt upp Zustand stores:
   - `playerStore` - Playback state (playing, position, track, volume)
   - `spotifyStore` - Auth state, tokens, user info
   - `visualizerStore` - Visualizer settings, active preset
5. ✅ Skapa baslayout-komponenter:
   - `App.tsx` - Root med routing logic
   - `WinampWindow.tsx` - Huvudfönster med draggable window
   - `MainWindow.tsx` - Spelaren (top section)
   - `PlaylistEditor.tsx` - Playlist-fönster (bottom section)
   - `Equalizer.tsx` - EQ-fönster (kan vara fas 2)
6. ✅ Implementera grundläggande Winamp-styling (CSS modules)
   - Classic Winamp color palette (#000000, #00FF00, etc.)
   - Pixel fonts
   - Window chrome (title bar, close/minimize buttons)

**Leverabler**:
- Fungerande Vite dev server
- Visuell Winamp-skal (utan funktionalitet ännu)
- State management redo för integration

**Tidsuppskattning**: 1-2 dagar

---

### Fas 2: Spotify Integration
**Mål**: Implementera fullständig Spotify-autentisering och playback.

**Ansvarig**: Spotify Specialist

**Uppgifter**:
1. ✅ Registrera Spotify Developer App
   - Dokumentera Client ID i `.env.example`
   - Sätt redirect URI (http://localhost:5173/callback)
2. ✅ Implementera PKCE OAuth flow:
   - `src/lib/spotify/auth.ts` - generateCodeChallenge, getAuthUrl, exchangeCodeForToken
   - Lagra tokens säkert (localStorage med expiry handling)
   - Auto-refresh logic för access tokens
3. ✅ Integrera Web Playback SDK:
   - `src/lib/spotify/player.ts` - SDK wrapper
   - Initiera player med access token
   - Device ID hantering
   - Player state listeners (track change, position, pause/play)
4. ✅ Implementera Spotify Web API client:
   - `src/lib/spotify/api.ts` - Typed API wrapper
   - Endpoints: getCurrentTrack, getUserPlaylists, search, getPlaylistTracks
   - Error handling och rate limiting
5. ✅ Koppla Zustand stores till Spotify:
   - Synka `playerStore` med SDK state
   - Uppdatera `spotifyStore` vid auth events
6. ✅ Bygg UI-komponenter för Spotify:
   - `LoginScreen.tsx` - OAuth start
   - `TrackDisplay.tsx` - Nuvarande låt med metadata
   - `PlaylistView.tsx` - Lista användarens playlists
   - `SearchBar.tsx` - Sök låtar/artister

**Leverabler**:
- Fungerande login flow (PKCE)
- Playback av Spotify-tracks
- Grundläggande spelarkontroller (play/pause/seek/volym)
- Playlist-visning

**Tidsuppskattning**: 2-3 dagar

**Beroenden**: Fas 1 måste vara klar

---

### Fas 3: Visualizer Implementation
**Mål**: Bygga realtids-visualizer med modulärt preset-system.

**Ansvarig**: Visualizer Dev

**Uppgifter**:
1. ✅ Sätt upp Web Audio API pipeline:
   - `src/lib/audio/analyzer.ts` - Audio context, analyzer node
   - Koppla till Spotify Web Playback SDK audio stream
   - Frekvensdata extraction (FFT)
2. ✅ Skapa Canvas-renderare:
   - `src/components/Visualizer/VisualizerCanvas.tsx` - Canvas wrapper
   - `src/lib/visualizer/renderer.ts` - Animation loop (requestAnimationFrame)
   - Performance optimization (throttling vid behov)
3. ✅ Designa preset-arkitektur:
   - `src/lib/visualizer/presets/PresetBase.ts` - Abstract base class
   - Interface: `init()`, `render(frequencyData, canvas)`, `cleanup()`
   - Preset registry för dynamisk loading
4. ✅ Implementera 3-5 klassiska Winamp-presets:
   - **Oscilloscope** - Waveform line
   - **Spectrum Analyzer** - Frequency bars (klassisk!)
   - **Dots** - Bouncing particles
   - **Fire** - Flame effect
   - **Random** - Shuffle mellan presets
5. ✅ Bygg preset-selector UI:
   - `PresetSelector.tsx` - Dropdown eller visualizer-högerklick
   - Thumbnail previews (optional)
   - Smooth transitions mellan presets
6. ✅ Integrera med Zustand:
   - `visualizerStore` - active preset, settings
   - Persist vald preset i localStorage

**Leverabler**:
- Fungerande realtids-visualizer
- Minst 3 användbara presets
- Preset-switching utan glitches
- Bra performance (60 FPS på moderna browsers)

**Tidsuppskattning**: 2-3 dagar

**Beroenden**: Fas 2 måste vara klar (behöver Spotify audio stream)

---

### Fas 4: Winamp UI Polish och Features
**Mål**: Finslipa UI till pixel-perfect Winamp-upplevelse och lägga till nice-to-have features.

**Ansvarig**: Frontend Architect (med hjälp av Spotify Specialist)

**Uppgifter**:
1. ✅ Perfekta Winamp-detaljer:
   - Draggable windows (main + playlist + EQ)
   - Double-size mode (2x scaling)
   - Shade mode (minimera till title bar)
   - Korrekt pixelfonts (Winamp BMP fonts eller fallback)
   - Hover states på alla knappar
   - Animated VU-meter (fake eller real?)
2. ✅ Equalizer implementation:
   - `Equalizer.tsx` - 10-band EQ UI
   - Faktisk audio filtering (Web Audio API BiquadFilter nodes)
   - EQ presets (Rock, Pop, Jazz, etc.)
3. ✅ Playlist Editor features:
   - Add tracks från search
   - Drag-and-drop reordering
   - Remove tracks
   - Save/load playlists (localStorage först)
   - Double-click to play
4. ✅ Keyboard shortcuts:
   - Spacebar - play/pause
   - Arrow keys - seek/volume
   - C - toggle playlist
   - D - toggle double-size
5. ✅ Context menus (högerklick):
   - Playlist: Remove, Move to top, etc.
   - Visualizer: Preset selection
   - Main window: Options, Always on top, etc.
6. ✅ Persistence:
   - Spara window positions
   - Senaste playlist
   - Volume, EQ settings
   - Visualizer preset

**Leverabler**:
- Polerad, autentisk Winamp-upplevelse
- Alla core features implementerade
- Keyboard navigation
- Persistent state mellan sessions

**Tidsuppskattning**: 2-3 dagar

**Beroenden**: Fas 1-3 måste vara klara

---

## Filstruktur

```
agent-factory/
├── .claude/                  # Agent factory system
├── .env.example              # Spotify Client ID template
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── PROJECT_PLAN.md           # Denna fil
├── public/
│   ├── sprites/              # Winamp skin sprites
│   │   ├── main.png
│   │   ├── playlist.png
│   │   └── equalizer.png
│   └── fonts/
│       └── winamp.ttf        # Pixel font (optional)
└── src/
    ├── main.tsx              # Entry point
    ├── App.tsx               # Root component
    ├── vite-env.d.ts
    │
    ├── components/
    │   ├── WinampWindow/
    │   │   ├── WinampWindow.tsx       # Draggable window wrapper
    │   │   └── WinampWindow.module.css
    │   ├── MainWindow/
    │   │   ├── MainWindow.tsx         # Main player window
    │   │   ├── TrackDisplay.tsx       # Song info + time
    │   │   ├── Controls.tsx           # Play/pause/stop buttons
    │   │   ├── SeekBar.tsx            # Progress bar
    │   │   ├── VolumeControl.tsx      # Volume slider
    │   │   └── MainWindow.module.css
    │   ├── Visualizer/
    │   │   ├── VisualizerCanvas.tsx   # Canvas wrapper
    │   │   ├── PresetSelector.tsx     # Preset picker
    │   │   └── Visualizer.module.css
    │   ├── PlaylistEditor/
    │   │   ├── PlaylistEditor.tsx     # Playlist window
    │   │   ├── PlaylistView.tsx       # Track list
    │   │   ├── PlaylistControls.tsx   # Add/remove buttons
    │   │   └── PlaylistEditor.module.css
    │   ├── Equalizer/
    │   │   ├── Equalizer.tsx          # EQ window
    │   │   ├── EQSlider.tsx           # Single band slider
    │   │   └── Equalizer.module.css
    │   ├── SearchBar/
    │   │   ├── SearchBar.tsx
    │   │   └── SearchResults.tsx
    │   └── LoginScreen/
    │       ├── LoginScreen.tsx
    │       └── LoginScreen.module.css
    │
    ├── stores/
    │   ├── playerStore.ts        # Playback state (Zustand)
    │   ├── spotifyStore.ts       # Auth + user data
    │   └── visualizerStore.ts    # Visualizer settings
    │
    ├── lib/
    │   ├── spotify/
    │   │   ├── auth.ts               # PKCE OAuth flow
    │   │   ├── player.ts             # Web Playback SDK wrapper
    │   │   ├── api.ts                # Web API client
    │   │   └── types.ts              # Spotify type definitions
    │   ├── audio/
    │   │   ├── analyzer.ts           # Web Audio API setup
    │   │   └── equalizer.ts          # EQ filter nodes
    │   └── visualizer/
    │       ├── renderer.ts           # Main render loop
    │       ├── presets/
    │       │   ├── PresetBase.ts     # Abstract preset class
    │       │   ├── Oscilloscope.ts
    │       │   ├── SpectrumAnalyzer.ts
    │       │   ├── Dots.ts
    │       │   ├── Fire.ts
    │       │   └── index.ts          # Preset registry
    │       └── utils.ts              # Helper functions
    │
    ├── hooks/
    │   ├── useSpotifyAuth.ts         # Auth state hook
    │   ├── useSpotifyPlayer.ts       # Player control hook
    │   └── useKeyboardShortcuts.ts   # Keyboard handling
    │
    ├── utils/
    │   ├── storage.ts                # localStorage helpers
    │   └── draggable.ts              # Window drag logic
    │
    └── styles/
        ├── global.css                # Reset + Winamp vars
        └── colors.css                # Winamp color palette
```

---

## Milstolpar

### M1: Dev Environment Ready (Fas 1 klar)
- [ ] Vite projekt körs
- [ ] Grundläggande Winamp UI visas
- [ ] Zustand stores på plats

### M2: Spotify Playback Works (Fas 2 klar)
- [ ] Användare kan logga in med Spotify
- [ ] Musik spelar via Web Playback SDK
- [ ] Basic controls fungerar

### M3: Visualizer Live (Fas 3 klar)
- [ ] Visualizer reagerar på musik i realtid
- [ ] Minst 3 presets implementerade
- [ ] Smooth preset-switching

### M4: Production Ready (Fas 4 klar)
- [ ] Pixel-perfect Winamp UI
- [ ] Alla features kompletta
- [ ] Keyboard shortcuts fungerar
- [ ] State persists mellan sessions

---

## Tekniska Utmaningar och Lösningar

### Utmaning 1: Spotify Web Playback SDK Restrictions
**Problem**: SDK kräver Spotify Premium + endast fungerar i HTTPS (eller localhost).  
**Lösning**: 
- Tydlig dokumentation om Premium-krav
- Localhost dev via Vite (HTTPS optional för prod deploy)
- Error handling för icke-Premium användare

### Utmaning 2: Web Audio API Access till Spotify Stream
**Problem**: Web Playback SDK audio kan vara svåråtkomligt för analyze.  
**Lösning**: 
- Använd `createMediaElementSource()` om möjligt
- Fallback: Mock data eller pre-rendered waveforms
- Test med `getUserMedia()` för mic input som backup demo

### Utmaning 3: Pixel-Perfect Winamp Sprites
**Problem**: Original Winamp använder BMP sprites, rättigheter?  
**Lösning**: 
- Använd open-source Winamp skins (t.ex. från archive.org)
- Eller: Recreate sprites manuellt (pixelart är small!)
- CSS sprite sheets för performance

### Utmaning 4: Draggable Windows Performance
**Problem**: Smooth dragging utan jank.  
**Lösning**: 
- `will-change: transform` på dragged elements
- `transform: translate()` istället för `top/left`
- Throttle mousemove events om behövs

---

## Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

**Notera**: Inga extra dependencies! Spotify SDK + Web Audio API är native browser APIs.

---

## Nästa Steg

1. **Frontend Architect** börjar med Fas 1 (initiera projekt)
2. **Spotify Specialist** förbereder Spotify Developer App under tiden
3. **Visualizer Dev** researchar Web Audio API + Canvas best practices
4. När Fas 1 är klar: Parallellt arbete på Fas 2 + 3
5. Fas 4 sker när både Spotify + Visualizer är integrerade

---

## Framtida Expansionsmöjligheter (Post-MVP)

- **Skins**: Ladda custom Winamp skins (WSZ-filer)
- **Plugins**: Community-made visualizer presets
- **Milkdrop**: Full Milkdrop preset support (extremt ambitiöst!)
- **Backend**: Spara playlists i databas istället för localStorage
- **Social**: Dela playlists mellan användare
- **Desktop App**: Electron wrapper för native feel

---

**Status**: Planering klar. Redo för implementation!

**Skapad**: 2026-02-13  
**CEO**: Agent Factory Team
