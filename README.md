# Pokemon Math Adventure

A modern, fun math game for kids (age 6+) where solving puzzles earns Pokeballs to capture and evolve Pokemon.

## Play Now

| Platform | Link |
|----------|------|
| **Vercel (Recommended)** | https://pokemath-lilac.vercel.app |
| GitHub Pages | https://bbrandtom.github.io/math-game-for-kids/ |

Both versions are fully offline-capable PWAs - install on your phone for the best experience!

## Features

### Core Gameplay
- **8 Math Topics**: Addition, Subtraction, Skip Counting, Shapes, Visual Grouping, Place Value, Fractions, Word Problems
- **8 Collectible Pokemon** with evolution chains
- **Retro GBA/DS Pixel Art** aesthetic with Press Start 2P font
- **Mobile-First PWA**: Install on your phone, works offline

### Battle System
- **1v1 Battles**: Pit your caught Pokemon against each other in turn-based combat
- **Quick-Time Attacks**: Time your taps for bonus damage
- **XP & Leveling**: Your Pokemon grow stronger with each battle

### Legendary Boss Fights
Challenge powerful legendary Pokemon with your entire team:
- **Lucario** - The Aura Pokemon
- **Mewtwo** - The Genetic Pokemon
- **Arceus** - The Alpha Pokemon

Defeat them to add legendaries to your collection!

### Multi-Language Support
Play in your preferred language:
- English
- עברית (Hebrew)
- العربية (Arabic)
- Français (French)

### Parent Controls
- **Difficulty Settings**: Easy (1-20), Medium (1-100), Hard (1-1000)
- **Topic Toggles**: Enable/disable specific math topics
- **Progress Tracking**: Mastery per topic, accuracy stats

## Game Mechanics

| Pokemon | Math Topic | Pokeballs | Evolution |
|---------|------------|-----------|-----------|
| Pikachu | Addition | 10 | → Raichu |
| Squirtle | Subtraction | 10 | → Wartortle → Blastoise |
| Oddish | Skip Counting | 15 | → Gloom → Vileplume |
| Porygon | Shapes | 25 | → Porygon2 → Porygon-Z |
| Magnemite | Visual Grouping | 25 | → Magneton → Magnezone |
| Abra | Place Value | 30 | → Kadabra → Alakazam |
| Exeggcute | Fractions | 40 | → Exeggutor |
| Bulbasaur | Word Problems | 50 | → Ivysaur → Venusaur |

**Rewards**:
- Correct on first try: 2 Pokeballs
- Correct on retry: 1 Pokeball
- Every 5 correct streak: +1 bonus

## Run Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- React 19 + TypeScript
- Vite 7 with PWA plugin
- Tailwind CSS 4
- Framer Motion for animations
- Zustand + IndexedDB for offline state
- Howler.js for audio
- i18next for internationalization

## License

Private/family use. Pokemon is a trademark of Nintendo/Game Freak.
