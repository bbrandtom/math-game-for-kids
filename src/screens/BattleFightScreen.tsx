import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common';
import { PokemonSprite } from '../components/common/PokemonSprite';
import { QuickTimeBar, BattleHPBar, AttackList } from '../components/battle';
import { useGameStore, selectPokemon } from '../stores/gameStore';
import { POKEMON } from '../data/pokemon';
import {
  calculateMaxHP,
  calculateDamage,
  calculateXPReward,
} from '../utils/battleCalc';
import type { Attack } from '../stores/types';

type BattlePhase =
  | 'intro'
  | 'select-attack'
  | 'quick-time'
  | 'animate-attack'
  | 'check-result'
  | 'victory';

interface BattleState {
  pokemon1Id: string;
  pokemon2Id: string;
  pokemon1Hp: number;
  pokemon2Hp: number;
  pokemon1MaxHp: number;
  pokemon2MaxHp: number;
  currentTurn: 1 | 2;
  phase: BattlePhase;
  selectedAttack: Attack | null;
  lastDamage: number;
  lastAccuracyRating: 'perfect' | 'near' | 'miss' | null;
  winner: 1 | 2 | null;
}

export function BattleFightScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const pokemon = useGameStore(selectPokemon);
  const gainXP = useGameStore((state) => state.gainXP);

  // Get selected Pokemon from navigation state
  const { pokemon1: pokemon1Id, pokemon2: pokemon2Id } = (location.state as {
    pokemon1: string;
    pokemon2: string;
  }) || { pokemon1: '', pokemon2: '' };

  // Redirect if no Pokemon selected
  useEffect(() => {
    if (!pokemon1Id || !pokemon2Id) {
      navigate('/battle/select');
    }
  }, [pokemon1Id, pokemon2Id, navigate]);

  // Initialize battle state
  const [battle, setBattle] = useState<BattleState>(() => {
    const p1State = pokemon[pokemon1Id];
    const p2State = pokemon[pokemon2Id];
    const p1Data = POKEMON[pokemon1Id];
    const p2Data = POKEMON[pokemon2Id];

    const p1MaxHp = p1Data && p1State
      ? calculateMaxHP(p1Data.baseHP, p1State.level, p1State.stage)
      : 100;
    const p2MaxHp = p2Data && p2State
      ? calculateMaxHP(p2Data.baseHP, p2State.level, p2State.stage)
      : 100;

    return {
      pokemon1Id,
      pokemon2Id,
      pokemon1Hp: p1MaxHp,
      pokemon2Hp: p2MaxHp,
      pokemon1MaxHp: p1MaxHp,
      pokemon2MaxHp: p2MaxHp,
      currentTurn: 1,
      phase: 'intro',
      selectedAttack: null,
      lastDamage: 0,
      lastAccuracyRating: null,
      winner: null,
    };
  });

  // Track if XP has been awarded to prevent infinite loop
  const xpAwardedRef = useRef(false);

  // Get Pokemon data
  const p1State = pokemon[battle.pokemon1Id];
  const p2State = pokemon[battle.pokemon2Id];
  const p1Data = POKEMON[battle.pokemon1Id];
  const p2Data = POKEMON[battle.pokemon2Id];

  // Start battle after intro
  useEffect(() => {
    if (battle.phase === 'intro') {
      const timer = setTimeout(() => {
        setBattle((prev) => ({ ...prev, phase: 'select-attack' }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [battle.phase]);

  // Handle attack selection
  const handleSelectAttack = useCallback((attack: Attack) => {
    setBattle((prev) => ({
      ...prev,
      selectedAttack: attack,
      phase: 'quick-time',
    }));
  }, []);

  // Handle quick-time result
  const handleQuickTimeResult = useCallback(
    (accuracy: number, rating: 'perfect' | 'near' | 'miss') => {
      if (!battle.selectedAttack) return;

      const damage = calculateDamage(battle.selectedAttack.damage, accuracy);

      setBattle((prev) => ({
        ...prev,
        lastDamage: damage,
        lastAccuracyRating: rating,
        phase: 'animate-attack',
      }));

      // Apply damage after animation
      setTimeout(() => {
        setBattle((prev) => {
          const newHp =
            prev.currentTurn === 1
              ? prev.pokemon2Hp - damage
              : prev.pokemon1Hp - damage;

          const isDefeated = newHp <= 0;

          if (isDefeated) {
            return {
              ...prev,
              pokemon1Hp: prev.currentTurn === 2 ? newHp : prev.pokemon1Hp,
              pokemon2Hp: prev.currentTurn === 1 ? newHp : prev.pokemon2Hp,
              phase: 'victory',
              winner: prev.currentTurn,
            };
          }

          return {
            ...prev,
            pokemon1Hp: prev.currentTurn === 2 ? newHp : prev.pokemon1Hp,
            pokemon2Hp: prev.currentTurn === 1 ? newHp : prev.pokemon2Hp,
            phase: 'check-result',
          };
        });
      }, 1000);
    },
    [battle.selectedAttack]
  );

  // Switch turns
  useEffect(() => {
    if (battle.phase === 'check-result') {
      const timer = setTimeout(() => {
        setBattle((prev) => ({
          ...prev,
          currentTurn: prev.currentTurn === 1 ? 2 : 1,
          selectedAttack: null,
          lastDamage: 0,
          lastAccuracyRating: null,
          phase: 'select-attack',
        }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [battle.phase]);

  // Award XP on victory (only once)
  useEffect(() => {
    if (battle.phase === 'victory' && battle.winner && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      const winnerId = battle.winner === 1 ? battle.pokemon1Id : battle.pokemon2Id;
      const loserId = battle.winner === 1 ? battle.pokemon2Id : battle.pokemon1Id;
      const winnerState = pokemon[winnerId];
      const loserState = pokemon[loserId];

      if (winnerState && loserState) {
        const xpReward = calculateXPReward(winnerState.level, loserState.level);
        gainXP(winnerId, xpReward);
      }
    }
  }, [battle.phase, battle.winner, battle.pokemon1Id, battle.pokemon2Id, pokemon, gainXP]);

  if (!p1Data || !p2Data || !p1State || !p2State) {
    return null;
  }

  const currentPokemonData = battle.currentTurn === 1 ? p1Data : p2Data;
  const currentPokemonState = battle.currentTurn === 1 ? p1State : p2State;

  return (
    <div className="screen flex flex-col p-4 safe-area-padding bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Battle arena */}
      <div className="flex-1 flex flex-col">
        {/* Opponent (top) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start gap-4 mb-4"
        >
          {/* HP bar */}
          <div className="flex-1">
            <BattleHPBar
              currentHP={battle.pokemon2Hp}
              maxHP={battle.pokemon2MaxHp}
              name={p2Data.name}
              level={p2State.level}
              size="medium"
            />
          </div>
          {/* Pokemon sprite */}
          <motion.div
            className="transform scale-x-[-1]"
            animate={
              battle.phase === 'animate-attack' && battle.currentTurn === 1
                ? { x: [0, -10, 0], opacity: [1, 0.5, 1] }
                : {}
            }
            transition={{ duration: 0.3, repeat: 2 }}
          >
            <PokemonSprite
              pokemonId={battle.pokemon2Id}
              stage={p2State.stage}
              size="xl"
            />
          </motion.div>
        </motion.div>

        {/* Battle info area */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {/* Intro */}
            {battle.phase === 'intro' && (
              <motion.div
                key="intro"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-center"
              >
                <p className="text-yellow-400 text-xl pixel-font">
                  {t('battle.fight.vs')}
                </p>
              </motion.div>
            )}

            {/* Quick-time bar */}
            {battle.phase === 'quick-time' && (
              <motion.div
                key="quicktime"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <QuickTimeBar onResult={handleQuickTimeResult} />
              </motion.div>
            )}

            {/* Attack animation feedback */}
            {battle.phase === 'animate-attack' && (
              <motion.div
                key="attack"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                exit={{ scale: 0 }}
                className="text-center"
              >
                <p
                  className={`text-2xl pixel-font ${
                    battle.lastAccuracyRating === 'perfect'
                      ? 'text-green-400'
                      : battle.lastAccuracyRating === 'near'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {battle.lastAccuracyRating === 'perfect'
                    ? t('battle.fight.perfect')
                    : battle.lastAccuracyRating === 'near'
                    ? t('battle.fight.near')
                    : t('battle.fight.miss')}
                </p>
                <p className="text-white text-lg pixel-font mt-2">
                  -{battle.lastDamage} HP
                </p>
              </motion.div>
            )}

            {/* Victory */}
            {battle.phase === 'victory' && (
              <motion.div
                key="victory"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <p className="text-yellow-400 text-2xl pixel-font mb-4">
                  {t('battle.fight.victory')}
                </p>
                <p className="text-white text-lg pixel-font">
                  {battle.winner === 1 ? p1Data.name : p2Data.name} wins!
                </p>
                <p className="text-green-400 text-sm pixel-font mt-2">
                  {t('battle.fight.xpGained', {
                    xp: calculateXPReward(
                      battle.winner === 1 ? p1State.level : p2State.level,
                      battle.winner === 1 ? p2State.level : p1State.level
                    ),
                  })}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player Pokemon (bottom) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-end gap-4 mt-4"
        >
          {/* Pokemon sprite */}
          <motion.div
            animate={
              battle.phase === 'animate-attack' && battle.currentTurn === 2
                ? { x: [0, 10, 0], opacity: [1, 0.5, 1] }
                : {}
            }
            transition={{ duration: 0.3, repeat: 2 }}
          >
            <PokemonSprite
              pokemonId={battle.pokemon1Id}
              stage={p1State.stage}
              size="xl"
            />
          </motion.div>
          {/* HP bar */}
          <div className="flex-1">
            <BattleHPBar
              currentHP={battle.pokemon1Hp}
              maxHP={battle.pokemon1MaxHp}
              name={p1Data.name}
              level={p1State.level}
              size="medium"
            />
          </div>
        </motion.div>
      </div>

      {/* Action panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 bg-slate-800/80 rounded-xl p-4 border-2 border-slate-600"
      >
        {battle.phase === 'select-attack' && (
          <>
            <p className="text-center text-slate-300 text-xs pixel-font mb-3">
              {currentPokemonData.name}&apos;s turn -{' '}
              {t('battle.fight.selectAttack')}
            </p>
            <AttackList
              attacks={currentPokemonData.attacks}
              currentLevel={currentPokemonState.level}
              onSelectAttack={handleSelectAttack}
            />
          </>
        )}

        {battle.phase === 'victory' && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/battle')}
          >
            Continue
          </Button>
        )}

        {(battle.phase === 'intro' ||
          battle.phase === 'quick-time' ||
          battle.phase === 'animate-attack' ||
          battle.phase === 'check-result') && (
          <div className="h-24 flex items-center justify-center">
            <p className="text-slate-400 text-sm pixel-font">
              {battle.phase === 'check-result' ? 'Switching turns...' : ''}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default BattleFightScreen;
