import type { Topic } from '../stores/types';

export interface Pokemon {
  id: string;
  name: string;
  topic: Topic;
  cost: number; // Pokeballs needed to catch
  evolution: string[]; // Names in evolution chain
  evolutionRequirements: {
    stage2: number; // Correct answers needed for stage 2
    stage3: number; // Consecutive correct needed for stage 3 (mastery challenge)
  };
  type: string; // Pokemon type for theming
}

// Pokemon database - one per math topic
export const POKEMON: Record<string, Pokemon> = {
  pikachu: {
    id: 'pikachu',
    name: 'Pikachu',
    topic: 'addition',
    cost: 10,
    evolution: ['pikachu', 'raichu'],
    evolutionRequirements: { stage2: 20, stage3: 10 },
    type: 'electric',
  },
  squirtle: {
    id: 'squirtle',
    name: 'Squirtle',
    topic: 'subtraction',
    cost: 10,
    evolution: ['squirtle', 'wartortle', 'blastoise'],
    evolutionRequirements: { stage2: 20, stage3: 10 },
    type: 'water',
  },
  oddish: {
    id: 'oddish',
    name: 'Oddish',
    topic: 'skip-counting',
    cost: 15,
    evolution: ['oddish', 'gloom', 'vileplume'],
    evolutionRequirements: { stage2: 20, stage3: 10 },
    type: 'grass',
  },
  porygon: {
    id: 'porygon',
    name: 'Porygon',
    topic: 'shapes',
    cost: 25,
    evolution: ['porygon', 'porygon2', 'porygon-z'],
    evolutionRequirements: { stage2: 25, stage3: 10 },
    type: 'normal',
  },
  magnemite: {
    id: 'magnemite',
    name: 'Magnemite',
    topic: 'grouping',
    cost: 25,
    evolution: ['magnemite', 'magneton', 'magnezone'],
    evolutionRequirements: { stage2: 25, stage3: 10 },
    type: 'electric',
  },
  abra: {
    id: 'abra',
    name: 'Abra',
    topic: 'place-value',
    cost: 30,
    evolution: ['abra', 'kadabra', 'alakazam'],
    evolutionRequirements: { stage2: 30, stage3: 10 },
    type: 'psychic',
  },
  exeggcute: {
    id: 'exeggcute',
    name: 'Exeggcute',
    topic: 'fractions',
    cost: 40,
    evolution: ['exeggcute', 'exeggutor'],
    evolutionRequirements: { stage2: 35, stage3: 10 },
    type: 'grass',
  },
  bulbasaur: {
    id: 'bulbasaur',
    name: 'Bulbasaur',
    topic: 'word-problems',
    cost: 50,
    evolution: ['bulbasaur', 'ivysaur', 'venusaur'],
    evolutionRequirements: { stage2: 40, stage3: 10 },
    type: 'grass',
  },
};

// Map topics to their Pokemon
export const TOPIC_TO_POKEMON: Record<Topic, string> = {
  addition: 'pikachu',
  subtraction: 'squirtle',
  'skip-counting': 'oddish',
  shapes: 'porygon',
  grouping: 'magnemite',
  'place-value': 'abra',
  fractions: 'exeggcute',
  'word-problems': 'bulbasaur',
};

// Get all Pokemon as array
export function getAllPokemon(): Pokemon[] {
  return Object.values(POKEMON);
}

// Get Pokemon by ID
export function getPokemon(id: string): Pokemon | undefined {
  return POKEMON[id];
}

// Get Pokemon for a topic
export function getPokemonForTopic(topic: Topic): Pokemon {
  return POKEMON[TOPIC_TO_POKEMON[topic]];
}

// Get current evolution name based on stage
export function getCurrentEvolutionName(pokemonId: string, stage: number): string {
  const pokemon = POKEMON[pokemonId];
  if (!pokemon) return pokemonId;
  const index = Math.min(stage - 1, pokemon.evolution.length - 1);
  return pokemon.evolution[index];
}

// Get sprite path for a Pokemon at a specific stage
export function getSpriteUrl(pokemonId: string, stage: number): string {
  const name = getCurrentEvolutionName(pokemonId, stage);
  return `/sprites/pokemon/${name}.png`;
}

// Check if Pokemon can evolve
export function canEvolve(
  pokemonId: string,
  currentStage: number,
  correctAnswers: number,
  consecutiveCorrect: number
): boolean {
  const pokemon = POKEMON[pokemonId];
  if (!pokemon) return false;

  // Already at max evolution
  if (currentStage >= pokemon.evolution.length) return false;

  // Stage 1 -> Stage 2: Need enough correct answers
  if (currentStage === 1) {
    return correctAnswers >= pokemon.evolutionRequirements.stage2;
  }

  // Stage 2 -> Stage 3: Need mastery challenge (consecutive correct)
  if (currentStage === 2 && pokemon.evolution.length > 2) {
    return consecutiveCorrect >= pokemon.evolutionRequirements.stage3;
  }

  return false;
}

// Get evolution progress
export function getEvolutionProgress(
  pokemonId: string,
  currentStage: number,
  correctAnswers: number,
  consecutiveCorrect: number
): { current: number; needed: number; percent: number } {
  const pokemon = POKEMON[pokemonId];
  if (!pokemon) return { current: 0, needed: 0, percent: 100 };

  // Already at max evolution
  if (currentStage >= pokemon.evolution.length) {
    return { current: 0, needed: 0, percent: 100 };
  }

  // Stage 1 -> Stage 2
  if (currentStage === 1) {
    const needed = pokemon.evolutionRequirements.stage2;
    return {
      current: correctAnswers,
      needed,
      percent: Math.min(100, Math.round((correctAnswers / needed) * 100)),
    };
  }

  // Stage 2 -> Stage 3
  if (currentStage === 2 && pokemon.evolution.length > 2) {
    const needed = pokemon.evolutionRequirements.stage3;
    return {
      current: consecutiveCorrect,
      needed,
      percent: Math.min(100, Math.round((consecutiveCorrect / needed) * 100)),
    };
  }

  return { current: 0, needed: 0, percent: 100 };
}

// Get a random Pokemon that can be encountered
export function getRandomEncounter(
  currentPokeballs: number,
  pokemonStates: Record<string, { caught: boolean; stage: number }>,
  enabledTopics: Record<Topic, boolean>
): Pokemon | null {
  // Get Pokemon that:
  // 1. Haven't been caught yet
  // 2. Player can afford
  // 3. Topic is enabled
  const available = getAllPokemon().filter((p) => {
    const state = pokemonStates[p.id];
    return (
      !state?.caught &&
      p.cost <= currentPokeballs &&
      enabledTopics[p.topic]
    );
  });

  if (available.length === 0) return null;

  // Weight by inverse cost (cheaper Pokemon more likely)
  const totalWeight = available.reduce((sum, p) => sum + (1 / p.cost), 0);
  let random = Math.random() * totalWeight;

  for (const pokemon of available) {
    random -= 1 / pokemon.cost;
    if (random <= 0) return pokemon;
  }

  return available[0];
}

// Topic display names
export const TOPIC_NAMES: Record<Topic, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  'skip-counting': 'Skip Counting',
  shapes: 'Shapes',
  grouping: 'Visual Grouping',
  'place-value': 'Place Value',
  fractions: 'Fractions',
  'word-problems': 'Word Problems',
};

// Type colors for theming
export const TYPE_COLORS: Record<string, string> = {
  electric: '#F8D030',
  water: '#6890F0',
  grass: '#78C850',
  fire: '#F08030',
  psychic: '#F85888',
  normal: '#A8A878',
};
