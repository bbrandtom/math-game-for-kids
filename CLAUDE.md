# Pokemon Math Adventure

<identity>
Modern React PWA math game for kids (age 6+). Solve puzzles → earn Pokeballs → catch Pokemon.
Retro GBA/DS pixel art aesthetic. Mobile-first, offline-capable.
</identity>

<stack>
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 19.x |
| Build | Vite | 7.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Animation | Framer Motion | 12.x |
| State | Zustand | 5.x |
| Storage | IndexedDB (idb-keyval) | 6.x |
| Audio | Howler.js | 2.x |
| PWA | vite-plugin-pwa | 1.x |
| Routing | React Router | 7.x |
</stack>

<commands>
| Task | Command |
|------|---------|
| Install | `npm install` |
| Dev | `npm run dev` |
| Build | `npm run build` |
| Preview | `npm run preview` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Test | `npm test` |
</commands>

<structure>
```
src/
├── components/
│   ├── common/           # Button, Panel, PokemonSprite, PokeballCount
│   ├── puzzles/          # Puzzle type components (future)
│   ├── capture/          # Capture screen components (future)
│   └── pokedex/          # Pokedex components (future)
├── screens/
│   ├── HomeScreen.tsx    # Main menu with Pokeball play button
│   ├── PlayScreen.tsx    # Puzzle gameplay
│   ├── CaptureScreen.tsx # Pokemon capture
│   ├── PokedexScreen.tsx # Pokemon collection
│   └── SettingsScreen.tsx # Settings and stats
├── stores/
│   ├── gameStore.ts      # Zustand store with IndexedDB persistence
│   └── types.ts          # TypeScript types
├── data/
│   ├── pokemon.ts        # Pokemon definitions, evolution chains
│   └── puzzles/          # Puzzle generators by topic
├── hooks/                # Custom React hooks
├── utils/
│   ├── audio.ts          # Howler.js audio manager
│   └── cn.ts             # Tailwind class merging
├── styles/               # Additional CSS
├── App.tsx               # Router setup
├── main.tsx              # Entry point
└── index.css             # Global styles, Tailwind theme
public/
├── sprites/pokemon/      # Pokemon sprite PNGs (bundled)
├── icons/                # PWA icons
├── fonts/                # Self-hosted fonts (optional)
└── sounds/               # Sound files (optional)
```
</structure>

<architecture>
**State Management**: Zustand with IndexedDB persistence via `idb-keyval`
- Auto-saves on every state change
- Migrates from old localStorage format automatically

**Routing**: React Router with GitHub Pages basename
- Uses `import.meta.env.BASE_URL` for deployment flexibility

**Styling**: Tailwind CSS v4 with custom theme
- Pokemon color palette defined in `@theme` block
- CSS variables: `--color-pokemon-*`, `--color-gba-*`, `--color-pokeball-*`

**Audio**: Synthesized sounds via Howler.js
- Chiptune-style sounds generated at runtime
- No external audio files required
</architecture>

<game-mechanics>
**Topics** (8): addition, subtraction, skip-counting, shapes, grouping, place-value, fractions, word-problems

**Puzzle Types**:
- fill-blank / pattern-fill: Input answer in blank
- multiple-choice: Select from 4 options
- visual-counting: Count emoji objects
- visual-groups: Count groups × items
- shape-identify / shape-properties: Identify shapes or count sides
- fraction-visual: Match fraction to visual
- word-problem: Story-based multiple choice

**Difficulty Ranges**:
- Easy: 1-20
- Medium: 1-100
- Hard: 1-1000

**Rewards**:
- First attempt correct: 2 Pokeballs
- Retry correct: 1 Pokeball
- Every 5 streak: +1 bonus

**Pokemon** (8 total):
| Pokemon | Topic | Cost | Evolution |
|---------|-------|------|-----------|
| Pikachu | addition | 10 | → Raichu |
| Squirtle | subtraction | 10 | → Wartortle → Blastoise |
| Oddish | skip-counting | 15 | → Gloom → Vileplume |
| Porygon | shapes | 25 | → Porygon2 → Porygon-Z |
| Magnemite | grouping | 25 | → Magneton → Magnezone |
| Abra | place-value | 30 | → Kadabra → Alakazam |
| Exeggcute | fractions | 40 | → Exeggutor |
| Bulbasaur | word-problems | 50 | → Ivysaur → Venusaur |
</game-mechanics>

<state-schema>
```typescript
interface GameState {
  version: number;          // Schema version for migrations
  pokeballs: number;        // Current balance
  totalPokeballs: number;   // Lifetime earned
  streak: number;           // Current correct streak
  difficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
  enabledTopics: Record<Topic, boolean>;
  pokemon: Record<string, { caught: boolean; stage: number }>;
  topicMastery: Record<Topic, { correct: number; total: number; consecutiveCorrect: number }>;
  totalCorrect: number;
  totalAnswered: number;
  lastSaved: number;
}
```
</state-schema>

<conventions>
<do>
- Use Tailwind utility classes with custom theme colors
- Use Framer Motion for complex animations, CSS for simple ones
- Keep components small and focused
- Use Zustand selectors to prevent unnecessary re-renders
- Bundle sprites locally for offline capability
</do>
<dont>
- Don't add Redux or complex state management
- Don't use external API calls (keep fully offline)
- Don't modify Tailwind theme without updating index.css
- Don't use localStorage directly (use Zustand store)
</dont>
</conventions>

<deployment>
**GitHub Pages**:
- Base URL configured in `vite.config.ts`: `/math-game-for-kids/`
- Build outputs to `dist/`
- Deploy: `npm run build` then push `dist/` to gh-pages branch

**PWA Features**:
- Service worker auto-generated by vite-plugin-pwa
- Offline support via Workbox precaching
- Install prompt available on mobile
</deployment>

<testing>
Manual testing checklist:
1. All 7 puzzle types render and accept answers correctly
2. Pokeballs accumulate (first try: 2, retry: 1)
3. Streak bonus triggers every 5 correct
4. Pokemon encounters appear when affordable
5. Capture deducts Pokeballs, adds to Pokedex
6. Evolution progress shows in Pokedex
7. Settings persist after page reload
8. Difficulty affects number ranges
9. Topic toggles filter puzzle generation
10. Reset clears all progress
11. PWA installs on mobile
12. App works offline after first load
</testing>

<boundaries>
DO NOT:
- Add backend dependencies (keep fully offline)
- Change IndexedDB key without migration logic
- Remove PWA configuration
- Add external API calls during gameplay
</boundaries>

<troubleshooting>
| Issue | Solution |
|-------|----------|
| Blank screen | Check browser console for errors |
| No sound | Click sound toggle in settings, check browser autoplay |
| State not persisting | Check IndexedDB in DevTools > Application |
| Sprites missing | Verify `public/sprites/pokemon/` contains PNG files |
| Build fails | Run `npm run typecheck` to find TS errors |
| PWA not installing | Check manifest in DevTools > Application > Manifest |
</troubleshooting>
