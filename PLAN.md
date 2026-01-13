# Pokemon Math Adventure - Educational Math Game

## Overview
A web-based math puzzle game for a 6-year-old where solving math problems earns Pokeballs to capture and evolve Pokemon. The game features a puzzle/explorer style with parent-controlled difficulty.

## Core Concept
- **Theme:** Pokemon (private/offline use for family)
- **Goal:** Solve math puzzles → Earn Pokeballs → Capture Pokemon → Evolve them through mastery
- **Motivation:** Pokemon of varying rarity require different effort to capture

---

## Game Mechanics

### Puzzle System
Three puzzle types rotating to keep things fresh:

1. **Fill in the Blank**
   - `3 + __ = 7`
   - `12 - 5 = __`
   - `__ + __ = 10` (multiple solutions)

2. **Visual Matching**
   - Count objects (apples, stars, creatures)
   - Shape recognition and matching
   - Pattern completion (2, 4, 6, __)

3. **Multiple Choice**
   - "Which shape has 4 sides?"
   - "What comes next: 5, 10, 15, __?"
   - Simple word problems with picture choices

### Difficulty Presets
Parent selects one of three presets that control number ranges:

| Preset | Number Range | Description |
|--------|--------------|-------------|
| **Easy** | 1-20 | Comfortable practice zone |
| **Medium** | 1-100 | Good stretch, two-digit numbers |
| **Hard** | 1-1000 | Full challenge with large numbers |

### Math Topics (8 Categories)

1. **Addition**
   - All levels from basic to carrying
   - Range scales with difficulty preset
   - Examples: `7 + 5`, `48 + 23`, `456 + 289`

2. **Subtraction**
   - Includes borrowing/regrouping
   - Range scales with difficulty preset
   - Examples: `15 - 7`, `83 - 45`, `724 - 358`

3. **Skip Counting**
   - Count by 2s, 5s, and 10s
   - Pattern completion: `10, 20, 30, __`
   - Sequences up to preset max

4. **Shape Recognition**
   - Basic: circle, square, triangle, rectangle
   - Advanced: pentagon, hexagon, oval, diamond
   - Properties: sides, corners

5. **Visual Grouping (Multiplication Intro)**
   - Groups of objects: "3 groups of 4 = ?"
   - Arrays: "How many dots? (3x4 grid)"
   - Real-world: "5 hands, how many fingers?"

6. **Place Value**
   - Identify hundreds, tens, ones
   - "What digit is in the tens place of 347?"
   - Build numbers: "2 hundreds + 5 tens + 3 ones = ?"

7. **Simple Fractions (Visual)**
   - Half, quarter, third recognition
   - Pie charts and bar models
   - "Color 1/4 of the shape"

8. **Word Problems**
   - Story-based math with pictures
   - "Sam has 12 apples and gives 5 away..."
   - Multi-step for Hard difficulty

### Pokeball Rewards
- **Correct answer on first try:** 2 Pokeballs
- **Correct answer on retry:** 1 Pokeball
- **Streak bonus:** +1 Pokeball for every 5 correct in a row

### Evolution System
- Pokemon evolve using their real evolution chains
- **Stage 1 → Stage 2:** Get 20 correct answers in that topic
- **Stage 2 → Stage 3:** Complete a "Mastery Challenge" (10 consecutive correct)
- Example: Squirtle → Wartortle → Blastoise (through subtraction mastery)

---

## Technical Architecture

### Tech Stack
- **HTML5/CSS3** - Structure and styling
- **Vanilla JavaScript** - Game logic (no frameworks for simplicity)
- **LocalStorage** - Save progress offline
- **CSS Animations** - Creature animations and feedback
- **Web Audio API** - Sound effects

### File Structure
```
pokemon-math/
├── index.html          # Main game page
├── css/
│   ├── style.css       # Main styles + battle screens
│   └── pokemon.css     # Pokemon sprites/animations
├── js/
│   ├── game.js         # Core game logic
│   ├── puzzles.js      # Puzzle generation
│   ├── pokemon.js      # Pokemon data & evolution
│   ├── storage.js      # Save/load progress
│   ├── audio.js        # Sound management
│   ├── battle.js       # Pokemon vs Pokemon battle system
│   └── legendary.js    # Legendary boss fight system
├── assets/
│   ├── pokemon/        # Pokemon images (PNG/SVG)
│   └── sounds/         # Sound effects (MP3)
└── data/
    └── pokemon.json    # Pokemon definitions
```

### Key Features
- **GitHub Pages Hosting:** Play instantly at https://bbrandtom.github.io/math-game-for-kids/
- **Offline Play:** Works without internet after initial load
- **Progress Tracking:** Pokeballs earned, Pokemon caught, topics mastered
- **Parent Controls:** easily accessible settings for difficulty presets
- **Sound Effects:** Pokemon-style sounds for correct answers, capture fanfare

---

## Pokemon (8 Pokemon - One Per Topic)

| Pokemon | Math Topic | Pokeballs | Evolution Chain |
|---------|------------|-----------|-----------------|
| **Pikachu** ⚡ | Addition | 10 | → Raichu |
| **Squirtle** 💧 | Subtraction | 10 | → Wartortle → Blastoise |
| **Oddish** 🌸 | Skip Counting | 15 | → Gloom → Vileplume |
| **Porygon** 📐 | Shapes | 25 | → Porygon2 → Porygon-Z |
| **Magnemite** 🧲 | Visual Grouping | 25 | → Magneton → Magnezone |
| **Abra** 🔮 | Place Value | 30 | → Kadabra → Alakazam |
| **Exeggcute** 🥚 | Fractions | 40 | → Exeggutor |
| **Bulbasaur** 🌿 | Word Problems | 50 | → Ivysaur → Venusaur |

### Pokemon Selection Notes
- **Pikachu:** The iconic electric mouse - perfect for energetic addition!
- **Squirtle:** Classic starter, 3-stage evolution for subtraction journey
- **Oddish:** Grows and counts up through its evolution stages
- **Porygon:** Digital/geometric Pokemon - perfect for shapes!
- **Magnemite:** Shows grouping visually (1 → 3 magnets in Magneton!)
- **Abra:** Psychic Pokemon for mental math / place value
- **Exeggcute:** 6 eggs showing parts of a whole - great for fractions
- **Bulbasaur:** Completing the starter trio for word problems

---

## Battle System

### Pokemon vs Pokemon Battles
Once players have caught 2+ Pokemon, they can battle them against each other:
- **Selection**: Choose 2 of your caught Pokemon to battle
- **Turn-based combat**: Pokemon take turns attacking
- **Quick-time mechanic**: Tap when the marker hits the target zone for maximum damage
- **Accuracy levels**: Perfect (100% damage), Near hit (50%), Miss (20%)
- **XP rewards**: Winner gains XP based on opponent's level
- **Level ups**: Pokemon level up and gain stronger attacks

### Attack System
Each Pokemon has attacks based on their level:
- Attacks have damage values displayed
- Higher-level Pokemon unlock stronger attacks
- Damage is modified by quick-time accuracy

---

## Legendary Boss Fights

### Legendary Pokemon (Unlockable Rewards)
| Pokemon | HP | Unlock Requirement |
|---------|----|--------------------|
| **Lucario** | 150 | Available from start |
| **Mewtwo** | 200 | Defeat Lucario |
| **Arceus** | 300 | Defeat Mewtwo |

### Boss Fight Mechanics
- **Team Battle**: Your entire caught team fights together
- **Combined damage**: All alive Pokemon attack simultaneously
- **Boss attacks**: Legendary Pokemon have special attacks that can hit multiple targets
- **Victory reward**: Defeat a boss to catch them and earn team XP
- **Progression**: Defeating each boss unlocks the next legendary

---

## User Interface Screens

1. **Home Screen**
   - Play button (styled as Pokeball!)
   - Pokedex (view captured Pokemon)
   - Battle button (unlocks with 2+ Pokemon)
   - Legendary button (challenge bosses)
   - Parent Settings (accessible via menu)

2. **Play Screen**
   - Puzzle area (center)
   - Current Pokeballs count (top)
   - Wild Pokemon encounter (when enough Pokeballs)
   - Topic indicator

3. **Capture Screen**
   - Pokeball throw animation
   - "Gotcha! [Pokemon] was caught!" celebration
   - Add to Pokedex

4. **Pokedex Screen**
   - Grid of all Pokemon (silhouettes for uncaptured)
   - Tap to see stats and evolution progress

5. **Battle Select Screen**
   - Grid of caught Pokemon
   - Select 2 Pokemon to battle each other

6. **Battle Screen**
   - Two Pokemon facing each other
   - HP bars for each Pokemon
   - Attack buttons with damage values
   - Quick-time target bar
   - Turn indicator

7. **Legendary Select Screen**
   - Grid of legendary bosses
   - Locked bosses shown as silhouettes
   - Defeated bosses marked as caught

8. **Legendary Battle Screen**
   - Boss Pokemon display with HP bar
   - Team Pokemon row with individual HP
   - Combined team attack mechanic
   - Boss special attack animations

9. **Parent Settings** (accessible via menu)
   - **Difficulty preset:** Easy / Medium / Hard
   - **Topic toggles:** Enable/disable each of 8 topics
   - **Progress stats:** Stars earned, creatures captured, accuracy %
   - **Reset option:** Clear all progress (with confirmation)

---

## Implementation Plan

### Phase 1: Core Foundation ✅
- [x] Set up project structure (HTML, CSS, JS files)
- [x] Create Pokemon-themed UI layout and navigation
- [x] Implement puzzle generation for fill-in-the-blank

### Phase 2: Puzzle System ✅
- [x] Add visual matching puzzles
- [x] Add multiple choice puzzles
- [x] Implement answer validation and Pokeball rewards
- [x] Add Pokemon-style sound effects

### Phase 3: Pokemon System ✅
- [x] Create Pokemon data structure with evolution chains
- [x] Add Pokemon sprite images
- [x] Implement capture mechanics with Pokeball animation
- [x] Build Pokedex collection screen

### Phase 4: Progression & Polish ✅
- [x] Add evolution system with mastery requirements
- [x] Implement LocalStorage save/load
- [x] Create easily accessible parent settings
- [x] Add animations and "Gotcha!" celebrations
- [x] Final polish and testing

### Phase 5: Battle System ✅
- [x] Implement Pokemon vs Pokemon battles
- [x] Add quick-time attack mechanic
- [x] Create battle UI with HP bars and turn indicators
- [x] Add XP and leveling system for battles

### Phase 6: Legendary Boss Fights ✅
- [x] Add legendary Pokemon (Lucario, Mewtwo, Arceus)
- [x] Implement team vs boss battle mechanics
- [x] Create boss special attacks
- [x] Add progression system (defeat one to unlock next)
- [x] Legendary Pokemon sprites and styling

---

## Verification Plan
1. Open `index.html` in browser
2. Test each puzzle type with correct and incorrect answers
3. Verify Pokeballs accumulate correctly
4. Capture a Pokemon and confirm it appears in Pokedex
5. Close and reopen browser - verify progress persists
6. Test evolution triggers when mastery requirements are met
7. Test parent settings (difficulty presets, topic toggles)
8. Test offline mode by disabling network after initial load
9. Catch 2+ Pokemon and test Battle mode
10. Verify quick-time mechanic works (perfect/near/miss)
11. Confirm XP rewards and level ups after battles
12. Test Legendary boss selection screen
13. Challenge Lucario and verify team battle mechanics
14. Defeat Lucario and confirm Mewtwo unlocks
15. Verify defeated legendaries show as caught in selection
