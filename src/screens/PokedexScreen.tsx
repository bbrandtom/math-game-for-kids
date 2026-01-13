import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Panel, PokemonSprite } from '../components/common';
import { useGameStore } from '../stores/gameStore';
import {
  getAllPokemon,
  getCurrentEvolutionName,
  getEvolutionProgress,
  TOPIC_NAMES,
} from '../data/pokemon';
import { cn } from '../utils/cn';

export function PokedexScreen() {
  const navigate = useNavigate();
  const pokemonStates = useGameStore((s) => s.pokemon);
  const topicMastery = useGameStore((s) => s.topicMastery);

  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);

  const allPokemon = getAllPokemon();

  const selectedData = selectedPokemon
    ? {
        pokemon: allPokemon.find((p) => p.id === selectedPokemon)!,
        state: pokemonStates[selectedPokemon],
        mastery: topicMastery[allPokemon.find((p) => p.id === selectedPokemon)!.topic],
      }
    : null;

  return (
    <div className="screen flex flex-col p-4 safe-area-padding bg-gradient-to-b from-gba-cream to-gba-tan">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
          ←
        </Button>
        <h1 className="font-pixel text-sm text-gba-dark">Pokedex</h1>
      </div>

      {/* Pokemon grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {allPokemon.map((pokemon, index) => {
          const state = pokemonStates[pokemon.id];
          const isCaught = state?.caught;

          return (
            <motion.button
              key={pokemon.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => isCaught && setSelectedPokemon(pokemon.id)}
              className={cn(
                'aspect-square rounded-lg p-2',
                'border-2',
                'flex flex-col items-center justify-center gap-1',
                'transition-transform active:scale-95',
                isCaught
                  ? 'bg-gba-tan border-gba-brown cursor-pointer'
                  : 'bg-gba-shadow/30 border-gba-shadow cursor-default'
              )}
            >
              <PokemonSprite
                pokemonId={pokemon.id}
                stage={state?.stage || 1}
                size="sm"
                silhouette={!isCaught}
              />
              <span className="font-pixel text-[8px] text-gba-dark truncate w-full text-center">
                {isCaught ? getCurrentEvolutionName(pokemon.id, state.stage) : '???'}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-1"
          >
            <Panel className="h-full">
              {/* Close button */}
              <button
                onClick={() => setSelectedPokemon(null)}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center font-pixel text-gba-dark"
              >
                ×
              </button>

              <div className="flex flex-col items-center gap-4">
                {/* Pokemon sprite */}
                <PokemonSprite
                  pokemonId={selectedData.pokemon.id}
                  stage={selectedData.state.stage}
                  size="lg"
                  animate
                />

                {/* Name */}
                <h2 className="font-pixel text-lg capitalize text-pokemon-blue">
                  {getCurrentEvolutionName(selectedData.pokemon.id, selectedData.state.stage)}
                </h2>

                {/* Topic */}
                <span className="font-pixel text-[10px] px-3 py-1 bg-gba-tan rounded-full text-gba-brown">
                  {TOPIC_NAMES[selectedData.pokemon.topic]}
                </span>

                {/* Evolution chain */}
                <div className="flex items-center gap-2">
                  {selectedData.pokemon.evolution.map((evoName, index) => (
                    <div key={evoName} className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full overflow-hidden border-2',
                          index < selectedData.state.stage
                            ? 'border-pokemon-yellow bg-gba-tan'
                            : 'border-gba-shadow bg-gba-shadow/30'
                        )}
                      >
                        <PokemonSprite
                          pokemonId={selectedData.pokemon.id}
                          stage={index + 1}
                          size="sm"
                          silhouette={index >= selectedData.state.stage}
                        />
                      </div>
                      {index < selectedData.pokemon.evolution.length - 1 && (
                        <span className="font-pixel text-xs text-gba-shadow">→</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Evolution progress */}
                {selectedData.state.stage < selectedData.pokemon.evolution.length && (
                  <div className="w-full max-w-xs">
                    <div className="h-3 bg-gba-shadow/30 rounded-full overflow-hidden border border-gba-brown">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            getEvolutionProgress(
                              selectedData.pokemon.id,
                              selectedData.state.stage,
                              selectedData.mastery.correct,
                              selectedData.mastery.consecutiveCorrect
                            ).percent
                          }%`,
                        }}
                        className="h-full bg-pokemon-yellow"
                      />
                    </div>
                    <p className="font-pixel text-[8px] text-center mt-1 text-gba-brown">
                      {getEvolutionProgress(
                        selectedData.pokemon.id,
                        selectedData.state.stage,
                        selectedData.mastery.correct,
                        selectedData.mastery.consecutiveCorrect
                      ).current}
                      /
                      {getEvolutionProgress(
                        selectedData.pokemon.id,
                        selectedData.state.stage,
                        selectedData.mastery.correct,
                        selectedData.mastery.consecutiveCorrect
                      ).needed}{' '}
                      to evolve
                    </p>
                  </div>
                )}

                {selectedData.state.stage >= selectedData.pokemon.evolution.length && (
                  <p className="font-pixel text-xs text-pokemon-yellow">Fully Evolved!</p>
                )}
              </div>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state hint */}
      {!selectedData && (
        <Panel className="flex-1 flex items-center justify-center">
          <p className="font-pixel text-xs text-gba-brown text-center">
            Tap a caught Pokemon
            <br />
            to see details
          </p>
        </Panel>
      )}
    </div>
  );
}

export default PokedexScreen;
