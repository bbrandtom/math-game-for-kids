import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common';
import { PokemonSprite } from '../components/common/PokemonSprite';
import { QuickTimeBar, BattleHPBar, AttackList } from '../components/battle';
import { useGameStore, selectPokemon, selectDefeatedLegendaries } from '../stores/gameStore';
import { POKEMON } from '../data/pokemon';
import {
  LEGENDARY_BOSSES,
  isLegendaryUnlocked,
  getLegendarySpriteUrl,
} from '../data/legendaries';
import {
  calculateMaxHP,
  calculateDamage,
  chooseRandomAttack,
  shouldUseSpecialAttack,
  getSpecialAttackTargets,
} from '../utils/battleCalc';
import type { Attack, LegendaryId } from '../stores/types';

type BattlePhase =
  | 'team-select'
  | 'intro'
  | 'player-turn'
  | 'select-attack'
  | 'select-target'
  | 'quick-time'
  | 'player-attack'
  | 'boss-turn'
  | 'boss-attack'
  | 'victory'
  | 'defeat';

interface TeamMember {
  id: string;
  hp: number;
  maxHp: number;
}

interface LegendaryBattleState {
  phase: BattlePhase;
  bossHp: number;
  bossMaxHp: number;
  team: TeamMember[];
  currentAttacker: number; // Index in team
  selectedAttack: Attack | null;
  turnCount: number;
  lastDamage: number;
  lastAccuracyRating: 'perfect' | 'near' | 'miss' | null;
  bossAttackTargets: string[];
  bossAttackDamage: number;
}

export function LegendaryBattleScreen() {
  const navigate = useNavigate();
  const { bossId } = useParams<{ bossId: LegendaryId }>();
  const { t } = useTranslation();
  const pokemon = useGameStore(selectPokemon);
  const defeatedLegendaries = useGameStore(selectDefeatedLegendaries);
  const gainXP = useGameStore((state) => state.gainXP);
  const defeatLegendary = useGameStore((state) => state.defeatLegendary);

  const boss = bossId ? LEGENDARY_BOSSES[bossId] : null;

  // Check if boss is unlocked
  const isUnlocked = bossId ? isLegendaryUnlocked(bossId, defeatedLegendaries) : false;

  // Get caught Pokemon
  const caughtPokemon = useMemo(
    () =>
      Object.entries(pokemon)
        .filter(([, state]) => state.caught)
        .map(([id, state]) => ({
          id,
          ...state,
          data: POKEMON[id],
        })),
    [pokemon]
  );

  // Team selection state
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);

  // Battle state
  const [battle, setBattle] = useState<LegendaryBattleState>({
    phase: 'team-select',
    bossHp: boss?.hp || 300,
    bossMaxHp: boss?.hp || 300,
    team: [],
    currentAttacker: 0,
    selectedAttack: null,
    turnCount: 0,
    lastDamage: 0,
    lastAccuracyRating: null,
    bossAttackTargets: [],
    bossAttackDamage: 0,
  });

  // Track if rewards have been given to prevent infinite loop
  const rewardsGivenRef = useRef(false);

  // Redirect if boss not found or not unlocked
  useEffect(() => {
    if (!boss || !isUnlocked) {
      navigate('/battle');
    }
  }, [boss, isUnlocked, navigate]);

  // Handle team selection
  const handleSelectTeamMember = (pokemonId: string) => {
    setSelectedTeam((prev) => {
      if (prev.includes(pokemonId)) {
        return prev.filter((id) => id !== pokemonId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, pokemonId];
    });
  };

  // Start battle with selected team
  const handleStartBattle = () => {
    if (selectedTeam.length === 0 || !boss) return;

    const team: TeamMember[] = selectedTeam.map((id) => {
      const state = pokemon[id];
      const data = POKEMON[id];
      const maxHp = calculateMaxHP(data.baseHP, state.level, state.stage);
      return { id, hp: maxHp, maxHp };
    });

    setBattle({
      phase: 'intro',
      bossHp: boss.hp,
      bossMaxHp: boss.hp,
      team,
      currentAttacker: 0,
      selectedAttack: null,
      turnCount: 0,
      lastDamage: 0,
      lastAccuracyRating: null,
      bossAttackTargets: [],
      bossAttackDamage: 0,
    });
  };

  // Phase transitions
  useEffect(() => {
    if (battle.phase === 'intro') {
      const timer = setTimeout(() => {
        setBattle((prev) => ({ ...prev, phase: 'player-turn' }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [battle.phase]);

  useEffect(() => {
    if (battle.phase === 'player-turn') {
      const timer = setTimeout(() => {
        setBattle((prev) => ({ ...prev, phase: 'select-attack' }));
      }, 500);
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
      if (!battle.selectedAttack || !boss) return;

      const damage = calculateDamage(battle.selectedAttack.damage, accuracy);

      setBattle((prev) => ({
        ...prev,
        lastDamage: damage,
        lastAccuracyRating: rating,
        phase: 'player-attack',
      }));

      // Apply damage after animation
      setTimeout(() => {
        setBattle((prev) => {
          const newBossHp = Math.max(0, prev.bossHp - damage);
          const isDefeated = newBossHp <= 0;

          if (isDefeated) {
            return { ...prev, bossHp: 0, phase: 'victory' };
          }

          // Move to next team member or boss turn
          const nextAttacker = prev.currentAttacker + 1;
          const aliveTeam = prev.team.filter((m) => m.hp > 0);

          if (nextAttacker >= aliveTeam.length) {
            // Boss turn
            return {
              ...prev,
              bossHp: newBossHp,
              currentAttacker: 0,
              turnCount: prev.turnCount + 1,
              phase: 'boss-turn',
            };
          }

          return {
            ...prev,
            bossHp: newBossHp,
            currentAttacker: nextAttacker,
            phase: 'select-attack',
          };
        });
      }, 1000);
    },
    [battle.selectedAttack, boss]
  );

  // Boss turn
  useEffect(() => {
    if (battle.phase === 'boss-turn' && boss) {
      const timer = setTimeout(() => {
        const aliveTeam = battle.team.filter((m) => m.hp > 0);
        const useSpecial = shouldUseSpecialAttack(battle.turnCount);

        let targets: string[];
        let damage: number;

        if (useSpecial) {
          targets = getSpecialAttackTargets(
            boss.specialAttack.targets,
            aliveTeam.map((m) => m.id)
          );
          damage = Math.floor(boss.specialAttack.damage * boss.specialAttack.multiplier);
        } else {
          const attack = chooseRandomAttack(boss.attacks);
          targets = [aliveTeam[Math.floor(Math.random() * aliveTeam.length)].id];
          damage = attack.damage;
        }

        setBattle((prev) => ({
          ...prev,
          bossAttackTargets: targets,
          bossAttackDamage: damage,
          phase: 'boss-attack',
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [battle.phase, battle.turnCount, battle.team, boss]);

  // Apply boss damage
  useEffect(() => {
    if (battle.phase === 'boss-attack') {
      const timer = setTimeout(() => {
        setBattle((prev) => {
          const newTeam = prev.team.map((member) => {
            if (prev.bossAttackTargets.includes(member.id)) {
              return { ...member, hp: Math.max(0, member.hp - prev.bossAttackDamage) };
            }
            return member;
          });

          const aliveTeam = newTeam.filter((m) => m.hp > 0);

          if (aliveTeam.length === 0) {
            return { ...prev, team: newTeam, phase: 'defeat' };
          }

          return {
            ...prev,
            team: newTeam,
            currentAttacker: 0,
            phase: 'player-turn',
          };
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [battle.phase]);

  // Award XP and mark legendary as defeated on victory (only once)
  useEffect(() => {
    if (battle.phase === 'victory' && boss && bossId && !rewardsGivenRef.current) {
      rewardsGivenRef.current = true;
      // Award XP to surviving team members
      battle.team.forEach((member) => {
        if (member.hp > 0) {
          gainXP(member.id, boss.reward);
        }
      });
      // Mark legendary as defeated
      defeatLegendary(bossId);
    }
  }, [battle.phase, battle.team, boss, bossId, gainXP, defeatLegendary]);

  if (!boss) return null;

  // Team selection phase
  if (battle.phase === 'team-select') {
    return (
      <div className="screen flex flex-col p-4 safe-area-padding bg-gradient-to-b from-purple-900 to-slate-900">
        <div className="flex items-center justify-between mb-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/battle')}>
            Back
          </Button>
          <h1 className="font-pixel text-lg text-purple-400">
            {t('battle.legendary.challenge', { boss: boss.name })}
          </h1>
          <div className="w-16" />
        </div>

        {/* Boss preview */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={getLegendarySpriteUrl(boss.id)}
            alt={boss.name}
            className="w-32 h-32 object-contain pixelated"
            style={{ imageRendering: 'pixelated' }}
          />
          <p className="text-purple-300 pixel-font mt-2">HP: {boss.hp}</p>
        </div>

        <p className="text-center text-slate-300 text-xs pixel-font mb-4">
          {t('battle.legendary.selectTeam')}
        </p>

        {/* Pokemon selection grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-3 gap-3">
            {caughtPokemon.map(({ id, stage, level, data }) => {
              const isSelected = selectedTeam.includes(id);
              const maxHP = calculateMaxHP(data.baseHP, level, stage);

              return (
                <motion.button
                  key={id}
                  className={`
                    p-2 rounded-xl border-4 transition-all
                    ${
                      isSelected
                        ? 'bg-purple-900/50 border-purple-400'
                        : 'bg-slate-800/50 border-slate-600'
                    }
                  `}
                  onClick={() => handleSelectTeamMember(id)}
                  whileTap={{ scale: 0.95 }}
                >
                  <PokemonSprite pokemonId={id} stage={stage} size="md" />
                  <p className="text-white text-xs pixel-font truncate">{data.name}</p>
                  <p className="text-yellow-400 text-[10px] pixel-font">Lv.{level}</p>
                  <p className="text-green-400 text-[10px] pixel-font">HP: {maxHP}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="mt-4"
          onClick={handleStartBattle}
          disabled={selectedTeam.length === 0}
        >
          {selectedTeam.length > 0
            ? `Battle with ${selectedTeam.length} Pokemon`
            : 'Select Pokemon'}
        </Button>
      </div>
    );
  }

  // Battle phases
  const aliveTeam = battle.team.filter((m) => m.hp > 0);
  const currentAttackerMember = aliveTeam[battle.currentAttacker];
  const currentAttackerData = currentAttackerMember
    ? POKEMON[currentAttackerMember.id]
    : null;
  const currentAttackerState = currentAttackerMember
    ? pokemon[currentAttackerMember.id]
    : null;

  return (
    <div className="screen flex flex-col p-4 safe-area-padding bg-gradient-to-b from-purple-900 via-slate-800 to-slate-900">
      {/* Boss area */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-4"
      >
        <BattleHPBar
          currentHP={battle.bossHp}
          maxHP={battle.bossMaxHp}
          name={boss.name}
          size="large"
        />
        <motion.div
          animate={
            battle.phase === 'player-attack'
              ? { scale: [1, 0.9, 1], opacity: [1, 0.5, 1] }
              : battle.phase === 'boss-attack'
              ? { scale: [1, 1.1, 1] }
              : {}
          }
        >
          <img
            src={getLegendarySpriteUrl(boss.id)}
            alt={boss.name}
            className="w-32 h-32 object-contain pixelated mt-2"
            style={{ imageRendering: 'pixelated' }}
          />
        </motion.div>
      </motion.div>

      {/* Battle info */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {battle.phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center"
            >
              <p className="text-purple-400 text-xl pixel-font">
                {boss.name} appeared!
              </p>
            </motion.div>
          )}

          {battle.phase === 'quick-time' && (
            <motion.div
              key="quicktime"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <QuickTimeBar onResult={handleQuickTimeResult} />
            </motion.div>
          )}

          {battle.phase === 'player-attack' && (
            <motion.div
              key="attack"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
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
              <p className="text-white pixel-font">-{battle.lastDamage} HP</p>
            </motion.div>
          )}

          {battle.phase === 'boss-attack' && (
            <motion.div
              key="boss-attack"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center"
            >
              <p className="text-red-400 text-lg pixel-font">
                {shouldUseSpecialAttack(battle.turnCount)
                  ? t('battle.legendary.specialAttack', {
                      boss: boss.name,
                      attack: boss.specialAttack.name,
                    })
                  : `${boss.name} attacks!`}
              </p>
              <p className="text-white pixel-font mt-2">
                -{battle.bossAttackDamage} HP
              </p>
            </motion.div>
          )}

          {battle.phase === 'victory' && (
            <motion.div
              key="victory"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <p className="text-yellow-400 text-2xl pixel-font mb-2">
                {t('battle.legendary.defeated', { boss: boss.name })}
              </p>
              <p className="text-green-400 pixel-font">
                {t('battle.legendary.addedToPokedex', { boss: boss.name })}
              </p>
              <p className="text-blue-400 pixel-font mt-2">
                +{boss.reward} XP to survivors!
              </p>
            </motion.div>
          )}

          {battle.phase === 'defeat' && (
            <motion.div
              key="defeat"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <p className="text-red-400 text-2xl pixel-font">
                {t('battle.fight.defeat')}
              </p>
              <p className="text-slate-400 pixel-font mt-2">Try again!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Team area */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center gap-2 mb-4"
      >
        {battle.team.map((member) => {
          const isActive =
            battle.phase === 'select-attack' &&
            aliveTeam[battle.currentAttacker]?.id === member.id;
          const isTarget = battle.bossAttackTargets.includes(member.id);

          return (
            <motion.div
              key={member.id}
              className={`
                relative p-2 rounded-lg border-2
                ${member.hp <= 0 ? 'opacity-40 grayscale' : ''}
                ${isActive ? 'border-yellow-400 bg-yellow-900/30' : 'border-slate-600'}
              `}
              animate={
                isTarget && battle.phase === 'boss-attack'
                  ? { scale: [1, 0.8, 1], opacity: [1, 0.5, 1] }
                  : {}
              }
            >
              <PokemonSprite
                pokemonId={member.id}
                stage={pokemon[member.id].stage}
                size="sm"
              />
              <div className="w-16 mt-1">
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      member.hp / member.maxHp > 0.5
                        ? 'bg-green-500'
                        : member.hp / member.maxHp > 0.2
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(member.hp / member.maxHp) * 100}%` }}
                  />
                </div>
                <p className="text-[8px] text-center text-slate-400 pixel-font">
                  {member.hp}/{member.maxHp}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Action panel */}
      <div className="bg-slate-800/80 rounded-xl p-4 border-2 border-slate-600">
        {battle.phase === 'select-attack' &&
          currentAttackerData &&
          currentAttackerState && (
            <>
              <p className="text-center text-slate-300 text-xs pixel-font mb-3">
                {currentAttackerData.name}&apos;s turn
              </p>
              <AttackList
                attacks={currentAttackerData.attacks}
                currentLevel={currentAttackerState.level}
                onSelectAttack={handleSelectAttack}
              />
            </>
          )}

        {(battle.phase === 'victory' || battle.phase === 'defeat') && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/battle')}
          >
            Continue
          </Button>
        )}

        {battle.phase !== 'select-attack' &&
          battle.phase !== 'victory' &&
          battle.phase !== 'defeat' && (
            <div className="h-24 flex items-center justify-center">
              <p className="text-slate-400 text-sm pixel-font">
                {battle.phase === 'boss-turn' ? 'Boss is attacking...' : ''}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

export default LegendaryBattleScreen;
