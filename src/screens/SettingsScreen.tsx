import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Panel } from '../components/common';
import { useGameStore, selectPokemon, selectTotalCorrect, selectTotalAnswered, getCaughtCount, getAccuracy } from '../stores/gameStore';
import { TOPIC_NAMES } from '../data/pokemon';
import type { Topic, Difficulty } from '../stores/types';
import GameAudio from '../utils/audio';
import { cn } from '../utils/cn';

const DIFFICULTIES: { value: Difficulty; label: string; range: string }[] = [
  { value: 'easy', label: 'Easy', range: '1-20' },
  { value: 'medium', label: 'Medium', range: '1-100' },
  { value: 'hard', label: 'Hard', range: '1-1000' },
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
    if (window.confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
      resetProgress();
      GameAudio.playClick();
    }
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!soundEnabled) {
      // Will be enabled after toggle
      setTimeout(() => GameAudio.playCorrect(), 100);
    }
  };

  return (
    <div className="screen flex flex-col p-4 safe-area-padding bg-gradient-to-b from-gba-cream to-gba-tan overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
          ←
        </Button>
        <h1 className="font-pixel text-sm text-gba-dark">Settings</h1>
      </div>

      <div className="flex flex-col gap-4">
        {/* Difficulty */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Panel>
            <h2 className="font-pixel text-xs text-gba-brown mb-3">Difficulty</h2>
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
                    <span>{d.label}</span>
                    <span className="text-[8px] opacity-75">({d.range})</span>
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
          transition={{ delay: 0.05 }}
        >
          <Panel>
            <h2 className="font-pixel text-xs text-gba-brown mb-3">Sound</h2>
            <Button
              variant={soundEnabled ? 'primary' : 'secondary'}
              onClick={handleToggleSound}
              className="w-full"
            >
              <span className="text-lg mr-2">{soundEnabled ? '🔊' : '🔇'}</span>
              Sound {soundEnabled ? 'ON' : 'OFF'}
            </Button>
          </Panel>
        </motion.div>

        {/* Topics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Panel>
            <h2 className="font-pixel text-xs text-gba-brown mb-3">Topics</h2>
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
                      'w-4 h-4 rounded border-2 flex items-center justify-center',
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
                    {TOPIC_NAMES[topic]}
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
          transition={{ delay: 0.15 }}
        >
          <Panel>
            <h2 className="font-pixel text-xs text-gba-brown mb-3">Progress</h2>
            <div className="space-y-2">
              <div className="flex justify-between font-pixel text-[10px]">
                <span className="text-gba-brown">Total Pokeballs</span>
                <span className="text-gba-dark">{totalPokeballs}</span>
              </div>
              <div className="flex justify-between font-pixel text-[10px]">
                <span className="text-gba-brown">Pokemon Caught</span>
                <span className="text-gba-dark">{caughtCount} / 8</span>
              </div>
              <div className="flex justify-between font-pixel text-[10px]">
                <span className="text-gba-brown">Accuracy</span>
                <span className="text-gba-dark">{accuracy}%</span>
              </div>
            </div>
          </Panel>
        </motion.div>

        {/* Reset */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Panel>
            <Button
              variant="danger"
              className="w-full"
              onClick={handleReset}
            >
              Reset All Progress
            </Button>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}

export default SettingsScreen;
