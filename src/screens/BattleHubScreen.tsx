import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common';
import { useGameStore, selectDefeatedLegendaries, selectPokemon } from '../stores/gameStore';
import { getLegendariesWithStatus, getLegendarySpriteUrl } from '../data/legendaries';
import { PokemonSprite } from '../components/common/PokemonSprite';

export function BattleHubScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const defeatedLegendaries = useGameStore(selectDefeatedLegendaries);
  const pokemon = useGameStore(selectPokemon);

  // Check if player has at least 2 caught Pokemon for 1v1 battle
  const caughtPokemon = Object.entries(pokemon).filter(([, state]) => state.caught);
  const canBattle1v1 = caughtPokemon.length >= 2;

  // Get legendary bosses with their status
  const legendaries = getLegendariesWithStatus(defeatedLegendaries);

  return (
    <div className="screen flex flex-col items-center p-4 safe-area-padding bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-center justify-between mb-6"
      >
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
          Back
        </Button>
        <h1 className="font-pixel text-lg text-yellow-400 text-shadow-pokemon">
          {t('battle.hub.title')}
        </h1>
        <div className="w-16" /> {/* Spacer for centering */}
      </motion.div>

      {/* Main content */}
      <div className="flex-1 w-full max-w-md flex flex-col gap-6">
        {/* 1v1 Battle Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 rounded-xl p-4 border-2 border-blue-500/30"
        >
          <h2 className="font-pixel text-blue-400 text-sm mb-3">
            {t('battle.hub.pvp')}
          </h2>
          <div className="flex items-center gap-4 mb-4">
            {/* Show first 2 caught Pokemon or placeholders */}
            <div className="flex -space-x-4">
              {caughtPokemon.slice(0, 2).map(([id, state], index) => (
                <motion.div
                  key={id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={index === 1 ? 'transform scale-x-[-1]' : ''}
                >
                  <PokemonSprite pokemonId={id} stage={state.stage} size="md" />
                </motion.div>
              ))}
              {caughtPokemon.length < 2 && (
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-slate-500 text-2xl">?</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-slate-300 text-xs pixel-font">
                {canBattle1v1
                  ? 'Train your Pokemon in battle!'
                  : 'Catch 2 Pokemon to battle'}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/battle/select')}
            disabled={!canBattle1v1}
          >
            {canBattle1v1 ? t('battle.hub.pvp') : 'Need 2 Pokemon'}
          </Button>
        </motion.div>

        {/* Legendary Battle Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 rounded-xl p-4 border-2 border-purple-500/30"
        >
          <h2 className="font-pixel text-purple-400 text-sm mb-3">
            {t('battle.hub.legendary')}
          </h2>

          {/* Legendary boss grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {legendaries.map(({ boss, unlocked, defeated }, index) => (
              <motion.div
                key={boss.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`
                  relative p-2 rounded-lg border-2 transition-colors cursor-pointer
                  ${
                    defeated
                      ? 'bg-green-900/30 border-green-500/50'
                      : unlocked
                      ? 'bg-purple-900/30 border-purple-500/50 hover:border-purple-400'
                      : 'bg-slate-700/30 border-slate-600/50 cursor-not-allowed'
                  }
                `}
                onClick={() => {
                  if (unlocked && caughtPokemon.length > 0) {
                    navigate(`/battle/legendary/${boss.id}`);
                  }
                }}
              >
                {/* Boss sprite or silhouette */}
                <div className="w-16 h-16 mx-auto relative">
                  {unlocked ? (
                    <img
                      src={getLegendarySpriteUrl(boss.id)}
                      alt={boss.name}
                      className="w-full h-full object-contain pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                      <span className="text-3xl">?</span>
                    </div>
                  )}
                  {defeated && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                      <span className="text-xs">✓</span>
                    </div>
                  )}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                  )}
                </div>
                <p
                  className={`text-center text-xs pixel-font mt-1 ${
                    unlocked ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {unlocked ? boss.name : '???'}
                </p>
                {!unlocked && index > 0 && (
                  <p className="text-center text-[8px] text-slate-500 pixel-font">
                    {t('battle.hub.defeat', { boss: legendaries[index - 1].boss.name })}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {caughtPokemon.length === 0 && (
            <p className="text-center text-slate-400 text-xs pixel-font">
              Catch Pokemon to challenge legendaries!
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default BattleHubScreen;
