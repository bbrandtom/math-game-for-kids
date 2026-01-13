// Game state types

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

  // Settings
  setDifficulty: (difficulty: Difficulty) => void;
  toggleSound: () => void;
  toggleTopic: (topic: Topic) => void;

  // Reset
  resetProgress: () => void;
}

export type GameStore = GameState & GameActions;
