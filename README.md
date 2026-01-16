# Pokemon Math Adventure

A modern, fun math game for kids where solving puzzles earns Pokeballs to capture and evolve Pokemon.

## Features

- **8 Math Topics**: Addition, Subtraction, Skip Counting, Shapes, Visual Grouping, Place Value, Fractions, Word Problems
- **8 Collectible Pokemon** with evolution chains
- **Retro GBA/DS Pixel Art** aesthetic with Press Start 2P font
- **Mobile-First PWA**: Install on your phone, works offline
- **Parent Controls**: Difficulty settings (Easy/Medium/Hard), topic toggles
- **Progress Tracking**: Mastery per topic, accuracy stats
- **Battle System**: Pit your caught Pokemon against each other in turn-based battles with quick-time attack mechanics
- **Legendary Boss Fights**: Challenge powerful legendary Pokemon (Lucario, Mewtwo, Arceus) with your entire team

## How to Play

**Play online**: https://bbrandtom.github.io/math-game-for-kids/

**Run locally**:
```bash
npm install
npm run dev
```

## Tech Stack

- React 19 + TypeScript
- Vite 7 with PWA plugin
- Tailwind CSS 4
- Framer Motion for animations
- Zustand + IndexedDB for offline state
- Howler.js for audio

## Development

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

## Screenshots

*Coming soon*

## License

Private/family use. Pokemon is a trademark of Nintendo/Game Freak.
