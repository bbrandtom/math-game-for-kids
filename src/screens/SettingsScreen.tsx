import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button, Panel } from '../components/common';
import { useGameStore, selectPokemon, selectTotalCorrect, selectTotalAnswered, getCaughtCount, getAccuracy } from '../stores/gameStore';
import type { Topic, Difficulty } from '../stores/types';
import GameAudio from '../utils/audio';
import { cn } from '../utils/cn';
import { languages } from '../i18n';

const DIFFICULTIES: { value: Difficulty; labelKey: string; range: string }[] = [
  { value: 'easy', labelKey: 'settings.easy', range: '1-20' },
  { value: 'medium', labelKey: 'settings.medium', range: '1-100' },
  { value: 'hard', labelKey: 'settings.hard', range: '1-1000' },
];

const TOPICS: Topic[] = [
  'addition',
  'subtraction',
  'skip-counting',
  'shapes',
  'grouping',
  'place-value',
  'fractions',
  'word-problems',
];

export function SettingsScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const enabledTopics = useGameStore((s) => s.enabledTopics);
  const toggleTopic = useGameStore((s) => s.toggleTopic);
  const totalPokeballs = useGameStore((s) => s.totalPokeballs);
  const pokemon = useGameStore(selectPokemon);
  const totalCorrect = useGameStore(selectTotalCorrect);
  const totalAnswered = useGameStore(selectTotalAnswered);
  const caughtCount = getCaughtCount(pokemon);
  const accuracy = getAccuracy(totalCorrect, totalAnswered);
  const resetProgress = useGameStore((s) => s.resetProgress);

  const handleReset = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      resetProgress();
      GameAudio.playClick();
    }
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!soundEnabled) {
      setTimeout(() => GameAudio.playCorrect(), 100);
    }
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    GameAudio.playClick();
  };

  return (
    <div className="screen flex flex-col p-4 safe-area-padding bg-gradient-to-b from-gba-cream to-gba-tan overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
          ←
        </Button>
        <h1 className="font-pixel text-sm text-gba-dark">{t('settings.title')}</h1>
      </div>

      <div className="flex flex-col gap-4">
        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Panel>
            <h2 className="font-pixel text-xs text-gba-brown mb-3">{t('settings.language')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded cursor-pointer',
                    'border-2 transition-all duration-200',
                    'hover:scale-[1.02] active:scale-[0.98]',
                    i18n.language === lang.code
                      ? 'bg-pokemon-blue/20 border-pokemon-blue shadow-md'
                      : 'bg-white border-gba-shadow/50 hover:border-gba-brown'
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={cn(
                    'font-pixel text-[10px]',
                    i18n.language === lang.code ? 'text-pokemon-blue' : 'text-gba-dark'
                  )}>
                    {lang.name}
                  </span>
                  {i18n.language === lang.code && (
                    <span className="ms-auto text-pokemon-blue">✓</span>
                  )}
                </button>
              ))}
            </div>
          </Panel>
        </motion.div>

        {/* Difficulty */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Panel>
            <h2 className="font-pixel text-xs text-gba-brown mb-3">{t('settings.difficulty')}</h2>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <Button
                  key={d.value}
                  variant={difficulty === d.value ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setDifficulty(d.value)}
                  className="flex-1"
                >
                  <div className="flex flex-col items-center">
                    <span>{t(d.labelKey)}</span>
                    <span className="text-[8px] opacity-75">{t('settings.range', { range: d.range })}</span>
                  </div>
                </Button>
              ))}
            </div>
          </Panel>
        </motion.div>

        {/* Sound */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Panel>
            <h2 className="font-pixel text-xs text-gba-brown mb-3">{t('settings.sound')}</h2>
            <Button
              variant={soundEnabled ? 'primary' : 'secondary'}
              onClick={handleToggleSound}
              className="w-full"
            >
              <span className="text-lg me-2">{soundEnabled ? '🔊' : '🔇'}</span>
              {soundEnabled ? t('settings.soundOn') : t('settings.soundOff')}
            </Button>
          </Panel>
        </motion.div>

        {/* Topics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Panel>
            <h2 className="font-pixel text-xs text-gba-brown mb-3">{t('settings.topics')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {TOPICS.map((topic) => (
                <label
                  key={topic}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded cursor-pointer',
                    'border-2 transition-colors',
                    enabledTopics[topic]
                      ? 'bg-pokemon-blue/20 border-pokemon-blue'
                      : 'bg-gba-shadow/20 border-gba-shadow'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={enabledTopics[topic]}
                    onChange={() => toggleTopic(topic)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                      enabledTopics[topic]
                        ? 'bg-pokemon-blue border-pokemon-blue'
                        : 'bg-white border-gba-shadow'
                    )}
                  >
                    {enabledTopics[topic] && (
                      <span className="text-white text-[10px]">✓</span>
                    )}
                  </div>
                  <span className="font-pixel text-[9px] text-gba-dark">
                    {t(`topics.${topic}`)}
                  </span>
                </label>
              ))}
            </div>
          </Panel>
        </motion.div>

        {/* Progress Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Panel>
            <h2 className="font-pixel text-xs text-gba-brown mb-3">{t('settings.progress')}</h2>
            <div className="space-y-2">
              <div className="flex justify-between font-pixel text-[10px]">
                <span className="text-gba-brown">{t('settings.totalPokeballs')}</span>
                <span className="text-gba-dark">{totalPokeballs}</span>
              </div>
              <div className="flex justify-between font-pixel text-[10px]">
                <span className="text-gba-brown">{t('settings.pokemonCaught')}</span>
                <span className="text-gba-dark">{caughtCount} / 8</span>
              </div>
              <div className="flex justify-between font-pixel text-[10px]">
                <span className="text-gba-brown">{t('settings.accuracy')}</span>
                <span className="text-gba-dark">{accuracy}%</span>
              </div>
            </div>
          </Panel>
        </motion.div>

        {/* Reset */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Panel>
            <Button
              variant="danger"
              className="w-full"
              onClick={handleReset}
            >
              {t('settings.resetProgress')}
            </Button>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}

export default SettingsScreen;
