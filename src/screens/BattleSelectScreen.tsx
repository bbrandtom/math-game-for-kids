import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common';
import { PokemonSprite } from '../components/common/PokemonSprite';
import { useGameStore, selectPokemon } from '../stores/gameStore';
import { POKEMON } from '../data/pokemon';
import { calculateMaxHP } from '../utils/battleCalc';

export function BattleSelectScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const pokemon = useGameStore(selectPokemon);

  const [selected, setSelected] = useState<string[]>([]);

  // Get all caught Pokemon with their data
  const caughtPokemon = Object.entries(pokemon)
    .filter(([, state]) => state.caught)
    .map(([id, state]) => ({
      id,
      ...state,
      data: POKEMON[id],
    }));

  const handleSelect = (pokemonId: string) => {
    setSelected((prev) => {
      if (prev.includes(pokemonId)) {
        // Deselect
        return prev.filter((id) => id !== pokemonId);
      }
      if (prev.length >= 2) {
        // Replace second selection
        return [prev[0], pokemonId];
      }
      // Add to selection
      return [...prev, pokemonId];
    });
  };

  const handleStartBattle = () => {
    if (selected.length === 2) {
      // Navigate to fight screen with selected Pokemon
      navigate('/battle/fight', {
        state: {
          pokemon1: selected[0],
          pokemon2: selected[1],
        },
      });
    }
  };

  return (
    <div className="screen flex flex-col p-4 safe-area-padding bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <Button variant="secondary" size="sm" onClick={() => navigate('/battle')}>
          Back
        </Button>
        <h1 className="font-pixel text-lg text-yellow-400">
          {t('battle.select.title')}
        </h1>
        <div className="w-16" />
      </motion.div>

      {/* Selected Pokemon preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center gap-8 mb-6 h-24"
      >
        {/* Pokemon 1 slot */}
        <div className="w-20 h-20 relative">
          <AnimatePresence mode="wait">
            {selected[0] ? (
              <motion.div
                key={selected[0]}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="absolute inset-0"
              >
                <PokemonSprite
                  pokemonId={selected[0]}
                  stage={pokemon[selected[0]].stage}
                  size="lg"
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty1"
                className="w-full h-full bg-slate-700/50 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center"
              >
                <span className="text-slate-500 text-3xl">1</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* VS */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-pixel text-red-500"
        >
          {t('battle.fight.vs')}
        </motion.div>

        {/* Pokemon 2 slot */}
        <div className="w-20 h-20 relative">
          <AnimatePresence mode="wait">
            {selected[1] ? (
              <motion.div
                key={selected[1]}
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -180 }}
                className="absolute inset-0 transform scale-x-[-1]"
              >
                <PokemonSprite
                  pokemonId={selected[1]}
                  stage={pokemon[selected[1]].stage}
                  size="lg"
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty2"
                className="w-full h-full bg-slate-700/50 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center"
              >
                <span className="text-slate-500 text-3xl">2</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Instructions */}
      <p className="text-center text-slate-400 text-xs pixel-font mb-4">
        {t('battle.select.selectTwo')}
      </p>

      {/* Pokemon grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-3 gap-3">
          {caughtPokemon.map(({ id, stage, level, data }, index) => {
            const isSelected = selected.includes(id);
            const selectionIndex = selected.indexOf(id);
            const maxHP = calculateMaxHP(data.baseHP, level, stage);

            return (
              <motion.button
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  relative p-2 rounded-xl border-4 transition-all
                  ${
                    isSelected
                      ? 'bg-blue-900/50 border-blue-400 shadow-lg shadow-blue-500/30'
                      : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                  }
                `}
                onClick={() => handleSelect(id)}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-10">
                    <span className="text-white text-xs font-bold pixel-font">
                      {selectionIndex + 1}
                    </span>
                  </div>
                )}

                {/* Pokemon sprite */}
                <div className="w-16 h-16 mx-auto">
                  <PokemonSprite pokemonId={id} stage={stage} size="md" />
                </div>

                {/* Pokemon info */}
                <div className="mt-1 text-center">
                  <p className="text-white text-xs pixel-font truncate">
                    {data.name}
                  </p>
                  <p className="text-yellow-400 text-[10px] pixel-font">
                    {t('battle.select.level', { level })}
                  </p>
                  <p className="text-green-400 text-[10px] pixel-font">
                    HP: {maxHP}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Start Battle button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4"
      >
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleStartBattle}
          disabled={selected.length !== 2}
        >
          {selected.length === 2
            ? t('battle.select.start')
            : `Select ${2 - selected.length} more`}
        </Button>
      </motion.div>
    </div>
  );
}

export default BattleSelectScreen;
