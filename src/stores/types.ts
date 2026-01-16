// Game state types

// Battle attack definition
export interface Attack {
  name: string;
  damage: number;
  unlockLevel: number;
}

// Battle-specific Pokemon state
export interface BattlePokemonState {
  level: number; // 1-10
  xp: number; // XP toward next level (10 XP per level)
  currentHp: number; // Current HP in battle
  maxHp: number; // Max HP (scales with level and evolution)
}

// Legendary boss definition
export type LegendaryId = 'lucario' | 'mewtwo' | 'arceus';

export interface LegendaryBoss {
  id: LegendaryId;
  name: string;
  hp: number;
  attacks: Attack[];
  specialAttack: {
    name: string;
    damage: number;
    targets: 'one' | 'some' | 'all';
    multiplier: number;
    healAmount?: number;
  };
  reward: number; // XP reward for defeating
}

// Battle state for 1v1
export interface BattleState {
  active: boolean;
  pokemon1: string | null; // Pokemon ID
  pokemon2: string | null;
  pokemon1Hp: number;
  pokemon2Hp: number;
  currentTurn: 1 | 2;
  phase: 'select' | 'battle' | 'result';
  winner: 1 | 2 | null;
}

// Legendary battle state
export interface LegendaryBattleState {
  active: boolean;
  bossId: LegendaryId | null;
  bossHp: number;
  bossMaxHp: number;
  teamHp: Record<string, number>; // Pokemon ID -> current HP
  phase: 'select' | 'battle' | 'result';
  victory: boolean | null;
}

export type Topic =
  | 'addition'
  | 'subtraction'
  | 'skip-counting'
  | 'shapes'
  | 'grouping'
  | 'place-value'
  | 'fractions'
  | 'word-problems';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PokemonState {
  caught: boolean;
  stage: number; // 1, 2, or 3 for evolution stage
  level: number; // Battle level 1-10
  xp: number; // XP toward next level
}

export interface TopicMastery {
  correct: number;
  total: number;
  consecutiveCorrect: number;
}

export interface GameState {
  // Version for migrations
  version: number;

  // Player progress
  pokeballs: number;
  totalPokeballs: number;
  streak: number;

  // Settings
  difficulty: Difficulty;
  soundEnabled: boolean;
  enabledTopics: Record<Topic, boolean>;

  // Pokemon collection
  pokemon: Record<string, PokemonState>;

  // Topic mastery tracking
  topicMastery: Record<Topic, TopicMastery>;

  // Battle progress
  defeatedLegendaries: LegendaryId[];

  // Stats
  totalCorrect: number;
  totalAnswered: number;

  // Timestamps
  lastSaved: number;
}

export interface GameActions {
  // Pokeball actions
  addPokeballs: (amount: number) => void;
  spendPokeballs: (amount: number) => boolean;

  // Answer tracking
  recordAnswer: (topic: Topic, correct: boolean) => void;
  resetStreak: () => void;

  // Pokemon actions
  catchPokemon: (pokemonId: string) => void;
  evolvePokemon: (pokemonId: string) => void;

  // Battle actions
  gainXP: (pokemonId: string, amount: number) => void;
  defeatLegendary: (bossId: LegendaryId) => void;

  // Settings
  setDifficulty: (difficulty: Difficulty) => void;
  toggleSound: () => void;
  toggleTopic: (topic: Topic) => void;

  // Reset
  resetProgress: () => void;
}

export type GameStore = GameState & GameActions;
