import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import type { GameStore, GameState, Topic, Difficulty } from './types';

// Current schema version
const SCHEMA_VERSION = 2;

// Default state
const defaultState: GameState = {
  version: SCHEMA_VERSION,
  pokeballs: 0,
  totalPokeballs: 0,
  streak: 0,
  difficulty: 'medium',
  soundEnabled: true,
  enabledTopics: {
    addition: true,
    subtraction: true,
    'skip-counting': true,
    shapes: true,
    grouping: true,
    'place-value': true,
    fractions: true,
    'word-problems': true,
  },
  pokemon: {
    pikachu: { caught: false, stage: 1 },
    squirtle: { caught: false, stage: 1 },
    oddish: { caught: false, stage: 1 },
    porygon: { caught: false, stage: 1 },
    magnemite: { caught: false, stage: 1 },
    abra: { caught: false, stage: 1 },
    exeggcute: { caught: false, stage: 1 },
    bulbasaur: { caught: false, stage: 1 },
  },
  topicMastery: {
    addition: { correct: 0, total: 0, consecutiveCorrect: 0 },
    subtraction: { correct: 0, total: 0, consecutiveCorrect: 0 },
    'skip-counting': { correct: 0, total: 0, consecutiveCorrect: 0 },
    shapes: { correct: 0, total: 0, consecutiveCorrect: 0 },
    grouping: { correct: 0, total: 0, consecutiveCorrect: 0 },
    'place-value': { correct: 0, total: 0, consecutiveCorrect: 0 },
    fractions: { correct: 0, total: 0, consecutiveCorrect: 0 },
    'word-problems': { correct: 0, total: 0, consecutiveCorrect: 0 },
  },
  totalCorrect: 0,
  totalAnswered: 0,
  lastSaved: Date.now(),
};

// Custom IndexedDB storage adapter
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await get(name);
      return value ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await set(name, value);
    } catch (error) {
      console.error('Failed to save to IndexedDB:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await del(name);
    } catch (error) {
      console.error('Failed to remove from IndexedDB:', error);
    }
  },
};

// Migrate from old localStorage format
async function migrateFromLocalStorage(): Promise<Partial<GameState> | null> {
  try {
    const oldData = localStorage.getItem('pokemon-math-state');
    if (!oldData) return null;

    const parsed = JSON.parse(oldData);
    console.log('Migrating from localStorage...');

    // Clear old localStorage after migration
    localStorage.removeItem('pokemon-math-state');

    return {
      ...parsed,
      version: SCHEMA_VERSION,
      lastSaved: Date.now(),
    };
  } catch {
    return null;
  }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addPokeballs: (amount: number) => {
        set((state) => ({
          pokeballs: state.pokeballs + amount,
          totalPokeballs: state.totalPokeballs + amount,
          lastSaved: Date.now(),
        }));
      },

      spendPokeballs: (amount: number) => {
        const state = get();
        if (state.pokeballs < amount) return false;
        set({
          pokeballs: state.pokeballs - amount,
          lastSaved: Date.now(),
        });
        return true;
      },

      recordAnswer: (topic: Topic, correct: boolean) => {
        set((state) => {
          const mastery = state.topicMastery[topic];
          return {
            topicMastery: {
              ...state.topicMastery,
              [topic]: {
                correct: mastery.correct + (correct ? 1 : 0),
                total: mastery.total + 1,
                consecutiveCorrect: correct ? mastery.consecutiveCorrect + 1 : 0,
              },
            },
            streak: correct ? state.streak + 1 : 0,
            totalCorrect: state.totalCorrect + (correct ? 1 : 0),
            totalAnswered: state.totalAnswered + 1,
            lastSaved: Date.now(),
          };
        });
      },

      resetStreak: () => {
        set({ streak: 0, lastSaved: Date.now() });
      },

      catchPokemon: (pokemonId: string) => {
        set((state) => ({
          pokemon: {
            ...state.pokemon,
            [pokemonId]: {
              ...state.pokemon[pokemonId],
              caught: true,
            },
          },
          lastSaved: Date.now(),
        }));
      },

      evolvePokemon: (pokemonId: string) => {
        set((state) => ({
          pokemon: {
            ...state.pokemon,
            [pokemonId]: {
              ...state.pokemon[pokemonId],
              stage: state.pokemon[pokemonId].stage + 1,
            },
          },
          lastSaved: Date.now(),
        }));
      },

      setDifficulty: (difficulty: Difficulty) => {
        set({ difficulty, lastSaved: Date.now() });
      },

      toggleSound: () => {
        set((state) => ({
          soundEnabled: !state.soundEnabled,
          lastSaved: Date.now(),
        }));
      },

      toggleTopic: (topic: Topic) => {
        set((state) => ({
          enabledTopics: {
            ...state.enabledTopics,
            [topic]: !state.enabledTopics[topic],
          },
          lastSaved: Date.now(),
        }));
      },

      resetProgress: () => {
        set({
          ...defaultState,
          lastSaved: Date.now(),
        });
      },
    }),
    {
      name: 'pokemon-math-game',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => {
        return async (state, error) => {
          if (error) {
            console.error('Error rehydrating state:', error);
            return;
          }

          // Try to migrate from localStorage if no state in IndexedDB
          if (!state || !state.version) {
            const migrated = await migrateFromLocalStorage();
            if (migrated) {
              useGameStore.setState(migrated);
              console.log('Migration from localStorage complete');
            }
          }
        };
      },
    }
  )
);

// Simple selectors (primitives - no memoization needed)
export const selectPokeballs = (state: GameStore) => state.pokeballs;
export const selectStreak = (state: GameStore) => state.streak;
export const selectDifficulty = (state: GameStore) => state.difficulty;
export const selectSoundEnabled = (state: GameStore) => state.soundEnabled;
export const selectPokemon = (state: GameStore) => state.pokemon;
export const selectEnabledTopics = (state: GameStore) => state.enabledTopics;
export const selectTopicMastery = (state: GameStore) => state.topicMastery;
export const selectTotalPokeballs = (state: GameStore) => state.totalPokeballs;
export const selectTotalCorrect = (state: GameStore) => state.totalCorrect;
export const selectTotalAnswered = (state: GameStore) => state.totalAnswered;

// Computed values (call these in components, not as selectors)
export function getCaughtCount(pokemon: GameStore['pokemon']): number {
  return Object.values(pokemon).filter((p) => p.caught).length;
}

export function getAccuracy(totalCorrect: number, totalAnswered: number): number {
  return totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
}

export function getEnabledTopicsList(enabledTopics: GameStore['enabledTopics']): Topic[] {
  return (Object.entries(enabledTopics) as [Topic, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([topic]) => topic);
}
