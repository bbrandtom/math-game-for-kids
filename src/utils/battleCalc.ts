import type { Attack } from '../stores/types';

// Constants for battle calculations
export const MAX_LEVEL = 10;
export const XP_PER_LEVEL = 10;

// Quick-time accuracy zones
export const TARGET_ZONE_WIDTH = 0.3; // 30% of bar
export const PERFECT_ZONE_WIDTH = 0.1; // 10% of bar (center of target)

// Accuracy multipliers
export const PERFECT_ACCURACY = 1.0; // 100%
export const NEAR_ACCURACY = 0.5; // 50%
export const MISS_ACCURACY = 0.2; // 20%

/**
 * Calculate max HP based on base HP, level, and evolution stage
 * HP scales with level (10% per level) and evolution stage (25% per stage)
 */
export function calculateMaxHP(baseHP: number, level: number, stage: number): number {
  const levelMultiplier = 1 + (level - 1) * 0.1; // +10% per level
  const stageMultiplier = 1 + (stage - 1) * 0.25; // +25% per evolution stage
  return Math.floor(baseHP * levelMultiplier * stageMultiplier);
}

/**
 * Calculate damage based on base damage and accuracy modifier
 */
export function calculateDamage(baseDamage: number, accuracy: number): number {
  return Math.floor(baseDamage * accuracy);
}

/**
 * Calculate accuracy from quick-time bar position
 * @param position - Current marker position (0-100)
 * @param targetCenter - Center of target zone (default 50)
 * @returns Accuracy value (PERFECT_ACCURACY, NEAR_ACCURACY, or MISS_ACCURACY)
 */
export function calculateAccuracy(position: number, targetCenter: number = 50): {
  accuracy: number;
  rating: 'perfect' | 'near' | 'miss';
} {
  const normalizedPosition = position / 100;
  const normalizedCenter = targetCenter / 100;
  const distance = Math.abs(normalizedPosition - normalizedCenter);

  // Perfect zone: center 10%
  if (distance <= PERFECT_ZONE_WIDTH / 2) {
    return { accuracy: PERFECT_ACCURACY, rating: 'perfect' };
  }

  // Near zone: within 30% target
  if (distance <= TARGET_ZONE_WIDTH / 2) {
    return { accuracy: NEAR_ACCURACY, rating: 'near' };
  }

  // Miss
  return { accuracy: MISS_ACCURACY, rating: 'miss' };
}

/**
 * Calculate XP reward for winning a battle
 * Higher level opponents give more XP
 */
export function calculateXPReward(winnerLevel: number, loserLevel: number): number {
  const basereward = 5;
  const levelDiff = loserLevel - winnerLevel;
  // Bonus for fighting stronger opponents
  const bonus = levelDiff > 0 ? levelDiff * 2 : 0;
  return basereward + bonus;
}

/**
 * Calculate new level and remaining XP after gaining XP
 */
export function calculateLevelUp(
  currentLevel: number,
  currentXP: number,
  gainedXP: number
): { newLevel: number; newXP: number; leveledUp: boolean } {
  let totalXP = currentXP + gainedXP;
  let level = currentLevel;
  let leveledUp = false;

  while (totalXP >= XP_PER_LEVEL && level < MAX_LEVEL) {
    totalXP -= XP_PER_LEVEL;
    level++;
    leveledUp = true;
  }

  // Cap XP at max level
  if (level >= MAX_LEVEL) {
    totalXP = 0;
  }

  return {
    newLevel: level,
    newXP: totalXP,
    leveledUp,
  };
}

/**
 * Get available attacks based on Pokemon level
 */
export function getAvailableAttacks(attacks: Attack[], level: number): Attack[] {
  return attacks.filter((attack) => attack.unlockLevel <= level);
}

/**
 * Choose a random attack for AI (boss attacks)
 */
export function chooseRandomAttack(attacks: Attack[]): Attack {
  return attacks[Math.floor(Math.random() * attacks.length)];
}

/**
 * Determine if boss should use special attack
 * Boss uses special attack every N turns
 */
export function shouldUseSpecialAttack(turnNumber: number, frequency: number = 3): boolean {
  return turnNumber > 0 && turnNumber % frequency === 0;
}

/**
 * Calculate targets for boss special attack
 */
export function getSpecialAttackTargets(
  targetType: 'one' | 'some' | 'all',
  teamPokemonIds: string[]
): string[] {
  if (teamPokemonIds.length === 0) return [];

  switch (targetType) {
    case 'one':
      // Target random one
      return [teamPokemonIds[Math.floor(Math.random() * teamPokemonIds.length)]];
    case 'some':
      // Target 2-3 random Pokemon (or all if team is smaller)
      const count = Math.min(
        Math.floor(Math.random() * 2) + 2, // 2-3
        teamPokemonIds.length
      );
      const shuffled = [...teamPokemonIds].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    case 'all':
      return [...teamPokemonIds];
    default:
      return [teamPokemonIds[0]];
  }
}
