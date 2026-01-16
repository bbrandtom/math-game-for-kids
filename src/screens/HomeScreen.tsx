import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PokeballButton, Button, PokeballCount } from '../components/common';
import { useGameStore } from '../stores/gameStore';
import { PokemonSprite } from '../components/common/PokemonSprite';

export function HomeScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const pokeballs = useGameStore((state) => state.pokeballs);
  const pokemon = useGameStore((state) => state.pokemon);

  // Get a random caught Pokemon to display
  const caughtPokemon = Object.entries(pokemon)
    .filter(([, state]) => state.caught)
    .map(([id, state]) => ({ id, stage: state.stage }));

  const displayPokemon = caughtPokemon.length > 0
    ? caughtPokemon[Math.floor(Math.random() * caughtPokemon.length)]
    : null;

  return (
    <div className="screen flex flex-col items-center justify-between p-6 safe-area-padding bg-gradient-to-b from-gba-cream to-gba-tan">
      {/* Header with pokeball count */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-end"
      >
        <PokeballCount count={pokeballs} />
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Title */}
        <div className="text-center">
          <h1 className="font-pixel text-lg text-pokemon-blue text-shadow-pokemon leading-relaxed">
            {t('app.title')}
          </h1>
          <h2 className="font-pixel text-sm text-pokemon-red text-shadow-pokemon mt-1">
            {t('app.subtitle')}
          </h2>
        </div>

        {/* Pokemon mascot or silhouette */}
        <div className="relative">
          {displayPokemon ? (
            <PokemonSprite
              pokemonId={displayPokemon.id}
              stage={displayPokemon.stage}
              size="xl"
              animate
            />
          ) : (
            <PokemonSprite
              pokemonId="pikachu"
              stage={1}
              size="xl"
              animate
            />
          )}
        </div>

        {/* Play button */}
        <PokeballButton
          onClick={() => navigate('/play')}
          aria-label={t('home.play')}
        />
      </motion.div>

      {/* Bottom menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full flex flex-col gap-3 max-w-xs"
      >
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/battle')}
        >
          {t('home.battle')}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/pokedex')}
        >
          {t('home.pokedex')}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/settings')}
        >
          {t('home.settings')}
        </Button>
      </motion.div>
    </div>
  );
}

export default HomeScreen;
