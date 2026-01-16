import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button, Panel, PokemonSprite, PokeballCount } from '../components/common';
import { useGameStore } from '../stores/gameStore';
import type { Pokemon } from '../data/pokemon';
import GameAudio from '../utils/audio';

type CaptureState = 'ready' | 'throwing' | 'caught';

export function CaptureScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const pokemon = location.state?.pokemon as Pokemon | undefined;

  const pokeballs = useGameStore((s) => s.pokeballs);
  const spendPokeballs = useGameStore((s) => s.spendPokeballs);
  const catchPokemon = useGameStore((s) => s.catchPokemon);

  const [captureState, setCaptureState] = useState<CaptureState>('ready');

  if (!pokemon) {
    navigate('/play');
    return null;
  }

  const canAfford = pokeballs >= pokemon.cost;

  const handleThrow = () => {
    if (!canAfford) return;

    GameAudio.playThrow();
    spendPokeballs(pokemon.cost);
    setCaptureState('throwing');

    // After throw animation
    setTimeout(() => {
      catchPokemon(pokemon.id);
      GameAudio.playCapture();
      setCaptureState('caught');
    }, 2000);
  };

  const handleContinue = () => {
    navigate('/play');
  };

  const handleRunAway = () => {
    navigate('/play');
  };

  return (
    <div className="screen flex flex-col items-center justify-center p-6 safe-area-padding bg-gradient-to-b from-gba-dark to-gba-shadow">
      {/* Pokeball count */}
      <div className="absolute top-4 end-4">
        <PokeballCount count={pokeballs} />
      </div>

      <AnimatePresence mode="wait">
        {captureState === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Wild Pokemon */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <PokemonSprite pokemonId={pokemon.id} stage={1} size="xl" />
            </motion.div>

            <Panel className="text-center">
              <p className="font-pixel text-sm mb-2">
                {t('capture.wildEncounter', { pokemon: pokemon.name })}
              </p>
            </Panel>

            <Panel className="text-center">
              <p className="font-pixel text-xs mb-3">
                {t('capture.catchCost', { cost: pokemon.cost })}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="pokeball"
                  onClick={handleThrow}
                  disabled={!canAfford}
                >
                  {t('capture.throwBall')}
                </Button>
                <Button variant="secondary" onClick={handleRunAway}>
                  ←
                </Button>
              </div>
              {!canAfford && (
                <p className="font-pixel text-[10px] text-error mt-2">
                  {t('capture.notEnough')}
                </p>
              )}
            </Panel>
          </motion.div>
        )}

        {captureState === 'throwing' && (
          <motion.div
            key="throwing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Pokemon fading out */}
            <motion.div
              animate={{ opacity: [1, 0.5, 0] }}
              transition={{ duration: 1.5 }}
            >
              <PokemonSprite pokemonId={pokemon.id} stage={1} size="xl" />
            </motion.div>

            {/* Pokeball animation */}
            <motion.div
              initial={{ y: 200, rotate: 0 }}
              animate={{
                y: [200, -50, 0],
                rotate: [0, 360, 720],
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute"
            >
              <div className="w-16 h-16 rounded-full border-4 border-gba-dark overflow-hidden animate-pokeball-wobble">
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-pokeball-red" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-pokeball-white" />
                <div className="absolute top-1/2 left-0 right-0 h-1 -mt-0.5 bg-gba-dark" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gba-dark" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {captureState === 'caught' && (
          <motion.div
            key="caught"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Celebration */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              <PokemonSprite pokemonId={pokemon.id} stage={1} size="xl" animate />
            </motion.div>

            <Panel className="text-center animate-pulse-glow">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-pixel text-xl text-pokemon-yellow mb-2"
              >
                {t('capture.caught', { pokemon: pokemon.name })}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-pixel text-sm"
              >
                {t('capture.addedToPokedex')}
              </motion.p>
            </Panel>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button variant="primary" size="lg" onClick={handleContinue}>
                {t('capture.continue')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CaptureScreen;
