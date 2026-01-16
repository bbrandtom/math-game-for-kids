import type { LegendaryId, LegendaryBoss } from '../stores/types';

// Legendary boss definitions
// Unlocked sequentially: Lucario -> Mewtwo -> Arceus
export const LEGENDARY_BOSSES: Record<LegendaryId, LegendaryBoss> = {
  lucario: {
    id: 'lucario',
    name: 'Lucario',
    hp: 300,
    attacks: [
      { name: 'Aura Sphere', damage: 20, unlockLevel: 1 },
      { name: 'Force Palm', damage: 30, unlockLevel: 1 },
    ],
    specialAttack: {
      name: 'Close Combat',
      damage: 40,
      targets: 'one',
      multiplier: 1.5,
    },
    reward: 50,
  },
  mewtwo: {
    id: 'mewtwo',
    name: 'Mewtwo',
    hp: 500,
    attacks: [
      { name: 'Psychic', damage: 25, unlockLevel: 1 },
      { name: 'Shadow Ball', damage: 35, unlockLevel: 1 },
    ],
    specialAttack: {
      name: 'Psystrike',
      damage: 50,
      targets: 'some',
      multiplier: 1.5,
    },
    reward: 100,
  },
  arceus: {
    id: 'arceus',
    name: 'Arceus',
    hp: 800,
    attacks: [
      { name: 'Judgment', damage: 35, unlockLevel: 1 },
      { name: 'Hyper Beam', damage: 45, unlockLevel: 1 },
    ],
    specialAttack: {
      name: 'Divine Wrath',
      damage: 60,
      targets: 'all',
      multiplier: 2.0,
      healAmount: 100,
    },
    reward: 200,
  },
};

// Order of legendary unlocks
export const LEGENDARY_UNLOCK_ORDER: LegendaryId[] = ['lucario', 'mewtwo', 'arceus'];

// Get the next legendary to unlock after defeating the given one
export function getNextLegendary(defeatedId: LegendaryId): LegendaryId | null {
  const currentIndex = LEGENDARY_UNLOCK_ORDER.indexOf(defeatedId);
  if (currentIndex === -1 || currentIndex >= LEGENDARY_UNLOCK_ORDER.length - 1) {
    return null;
  }
  return LEGENDARY_UNLOCK_ORDER[currentIndex + 1];
}

// Check if a legendary is unlocked based on defeated legendaries
export function isLegendaryUnlocked(
  bossId: LegendaryId,
  defeatedLegendaries: LegendaryId[]
): boolean {
  const index = LEGENDARY_UNLOCK_ORDER.indexOf(bossId);
  if (index === 0) return true; // Lucario is always available
  // Must have defeated all previous legendaries
  for (let i = 0; i < index; i++) {
    if (!defeatedLegendaries.includes(LEGENDARY_UNLOCK_ORDER[i])) {
      return false;
    }
  }
  return true;
}

// Get all legendaries with their unlock status
export function getLegendariesWithStatus(
  defeatedLegendaries: LegendaryId[]
): Array<{ boss: LegendaryBoss; unlocked: boolean; defeated: boolean }> {
  return LEGENDARY_UNLOCK_ORDER.map((id) => ({
    boss: LEGENDARY_BOSSES[id],
    unlocked: isLegendaryUnlocked(id, defeatedLegendaries),
    defeated: defeatedLegendaries.includes(id),
  }));
}

// Get sprite path for a legendary
export function getLegendarySpriteUrl(bossId: LegendaryId): string {
  return `/sprites/pokemon/${bossId}.png`;
}
