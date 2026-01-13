import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Panel, PokeballCount, StreakDisplay } from '../components/common';
import { useGameStore, selectEnabledTopics, getEnabledTopicsList } from '../stores/gameStore';
import { generatePuzzle } from '../data/puzzles';
import { TOPIC_NAMES, getRandomEncounter } from '../data/pokemon';
import type { Puzzle } from '../data/puzzles/types';
import type { Topic } from '../stores/types';
import GameAudio from '../utils/audio';
import { cn } from '../utils/cn';

export function PlayScreen() {
  const navigate = useNavigate();

  // Store state
  const pokeballs = useGameStore((s) => s.pokeballs);
  const streak = useGameStore((s) => s.streak);
  const difficulty = useGameStore((s) => s.difficulty);
  const enabledTopicsObj = useGameStore(selectEnabledTopics);
  const enabledTopics = useMemo(() => getEnabledTopicsList(enabledTopicsObj), [enabledTopicsObj]);
  const pokemon = useGameStore((s) => s.pokemon);
  const addPokeballs = useGameStore((s) => s.addPokeballs);
  const recordAnswer = useGameStore((s) => s.recordAnswer);

  // Local state
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [disabledOptions, setDisabledOptions] = useState<Set<string | number>>(new Set());
  const [pendingEncounter, setPendingEncounter] = useState<ReturnType<typeof getRandomEncounter>>(null);

  // Generate new puzzle
  const generateNewPuzzle = useCallback(() => {
    if (enabledTopics.length === 0) {
      navigate('/settings');
      return;
    }

    const topic = enabledTopics[Math.floor(Math.random() * enabledTopics.length)];
    const newPuzzle = generatePuzzle(topic, difficulty);

    setCurrentTopic(topic);
    setPuzzle(newPuzzle);
    setIsFirstAttempt(true);
    setFeedback(null);
    setInputValue('');
    setDisabledOptions(new Set());
  }, [enabledTopics, difficulty, navigate]);

  // Initial puzzle
  useEffect(() => {
    generateNewPuzzle();
  }, [generateNewPuzzle]);

  // Handle correct answer
  const handleCorrect = useCallback(() => {
    GameAudio.playCorrect();

    const earnedPokeballs = isFirstAttempt ? 2 : 1;
    const streakBonus = (streak + 1) % 5 === 0 ? 1 : 0;
    const total = earnedPokeballs + streakBonus;

    addPokeballs(total);
    recordAnswer(currentTopic!, true);

    const message = streakBonus
      ? `Correct! +${total} Pokeballs (Streak Bonus!)`
      : `Correct! +${total} Pokeballs`;

    setFeedback({ type: 'success', message });

    // Check for encounter
    const encounter = getRandomEncounter(
      pokeballs + total,
      pokemon,
      useGameStore.getState().enabledTopics
    );

    if (encounter && Math.random() < 0.3) {
      setPendingEncounter(encounter);
      GameAudio.playEncounter();
    }

    // Next puzzle after delay
    setTimeout(() => {
      if (!pendingEncounter) {
        generateNewPuzzle();
      }
    }, 1500);
  }, [isFirstAttempt, streak, addPokeballs, recordAnswer, currentTopic, pokeballs, pokemon, generateNewPuzzle, pendingEncounter]);

  // Handle incorrect answer
  const handleIncorrect = useCallback(() => {
    GameAudio.playIncorrect();
    recordAnswer(currentTopic!, false);
    setIsFirstAttempt(false);
    setFeedback({ type: 'error', message: 'Try again!' });
  }, [recordAnswer, currentTopic]);

  // Check fill-blank answer
  const checkFillBlank = useCallback(() => {
    if (!puzzle || !inputValue) return;

    const userAnswer = parseInt(inputValue, 10);
    const correct = userAnswer === puzzle.correctAnswer;

    if (correct) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  }, [puzzle, inputValue, handleCorrect, handleIncorrect]);

  // Check multiple choice answer
  const checkMultipleChoice = useCallback((selected: string | number) => {
    if (!puzzle) return;

    const correct =
      selected === puzzle.correctAnswer ||
      String(selected) === String(puzzle.correctAnswer);

    if (correct) {
      handleCorrect();
    } else {
      setDisabledOptions((prev) => new Set([...prev, selected]));
      handleIncorrect();
    }
  }, [puzzle, handleCorrect, handleIncorrect]);

  // Go to encounter
  const goToEncounter = () => {
    if (pendingEncounter) {
      navigate('/capture', { state: { pokemon: pendingEncounter } });
    }
  };

  if (!puzzle) return null;

  return (
    <div className="screen flex flex-col p-4 safe-area-padding bg-gradient-to-b from-gba-cream to-gba-tan">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/')}
        >
          ←
        </Button>
        <PokeballCount count={pokeballs} />
        <StreakDisplay streak={streak} />
      </div>

      {/* Topic indicator */}
      <motion.div
        key={currentTopic}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <span className="font-pixel text-[10px] px-3 py-1 bg-pokemon-blue text-white rounded-full">
          {currentTopic && TOPIC_NAMES[currentTopic]}
        </span>
      </motion.div>

      {/* Puzzle area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={JSON.stringify(puzzle)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm"
          >
            <Panel className="p-6">
              {/* Question */}
              {puzzle.type !== 'fill-blank' && puzzle.type !== 'pattern-fill' && 'question' in puzzle && (
                <p className="font-pixel text-sm text-center mb-6 leading-relaxed">
                  {puzzle.question}
                </p>
              )}

              {/* Visual elements for specific puzzle types */}
              {puzzle.type === 'visual-counting' && 'objects' in puzzle && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-wrap justify-center gap-2 mb-2 text-2xl">
                    {puzzle.objects.map((obj, i) => (
                      <span key={i}>{obj}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkFillBlank()}
                      className={cn(
                        'w-16 h-10 text-center font-pixel text-lg',
                        'border-2 border-gba-dark rounded bg-white',
                        'focus:outline-none focus:border-pokemon-blue',
                        feedback?.type === 'success' && 'animate-sparkle border-success',
                        feedback?.type === 'error' && 'animate-shake border-error'
                      )}
                      autoFocus
                    />
                    <Button onClick={checkFillBlank} disabled={!inputValue}>
                      Check
                    </Button>
                  </div>
                </div>
              )}

              {puzzle.type === 'visual-groups' && 'groups' in puzzle && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-wrap justify-center gap-3 mb-2">
                    {Array.from({ length: puzzle.groups }).map((_, i) => (
                      <div key={i} className="flex gap-1 p-2 bg-gba-tan rounded border-2 border-gba-brown">
                        {Array.from({ length: puzzle.itemsPerGroup }).map((_, j) => (
                          <span key={j} className="text-lg">{puzzle.item}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkFillBlank()}
                      className={cn(
                        'w-16 h-10 text-center font-pixel text-lg',
                        'border-2 border-gba-dark rounded bg-white',
                        'focus:outline-none focus:border-pokemon-blue',
                        feedback?.type === 'success' && 'animate-sparkle border-success',
                        feedback?.type === 'error' && 'animate-shake border-error'
                      )}
                      autoFocus
                    />
                    <Button onClick={checkFillBlank} disabled={!inputValue}>
                      Check
                    </Button>
                  </div>
                </div>
              )}

              {/* Fill in blank */}
              {(puzzle.type === 'fill-blank' || puzzle.type === 'pattern-fill') && 'display' in puzzle && (
                <div className="text-center">
                  {'question' in puzzle && puzzle.question && (
                    <p className="font-pixel text-xs mb-4">{puzzle.question}</p>
                  )}
                  <div className="font-pixel text-xl mb-4 flex items-center justify-center gap-2 flex-wrap">
                    {puzzle.display.split('__').map((part, i, arr) => (
                      <span key={i} className="flex items-center gap-2">
                        {part}
                        {i < arr.length - 1 && (
                          <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && checkFillBlank()}
                            className={cn(
                              'w-16 h-10 text-center font-pixel text-lg',
                              'border-2 border-gba-dark rounded bg-white',
                              'focus:outline-none focus:border-pokemon-blue',
                              feedback?.type === 'success' && 'animate-sparkle border-success',
                              feedback?.type === 'error' && 'animate-shake border-error'
                            )}
                            autoFocus
                          />
                        )}
                      </span>
                    ))}
                  </div>
                  <Button onClick={checkFillBlank} disabled={!inputValue}>
                    Check Answer
                  </Button>
                </div>
              )}

              {/* Multiple choice */}
              {puzzle.type === 'multiple-choice' && 'options' in puzzle && (
                <div className="grid grid-cols-2 gap-3">
                  {puzzle.options.map((option) => (
                    <Button
                      key={String(option)}
                      variant="secondary"
                      onClick={() => checkMultipleChoice(option)}
                      disabled={disabledOptions.has(option) || feedback?.type === 'success'}
                      className={cn(
                        disabledOptions.has(option) && 'opacity-50 bg-error/20',
                        feedback?.type === 'success' &&
                          (option === puzzle.correctAnswer || String(option) === String(puzzle.correctAnswer)) &&
                          'bg-success/30 border-success'
                      )}
                    >
                      {String(option)}
                    </Button>
                  ))}
                </div>
              )}

              {/* Shape puzzles */}
              {(puzzle.type === 'shape-identify' || puzzle.type === 'shape-properties') && 'shapeClass' in puzzle && (
                <div className="flex flex-col items-center gap-4">
                  <div className={cn('w-20 h-20', puzzle.shapeClass)} />
                  {puzzle.type === 'shape-identify' && 'options' in puzzle && (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {puzzle.options.map((option) => (
                        <Button
                          key={option}
                          variant="secondary"
                          size="sm"
                          onClick={() => checkMultipleChoice(option)}
                          disabled={disabledOptions.has(option) || feedback?.type === 'success'}
                          className="capitalize"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                  {puzzle.type === 'shape-properties' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && checkFillBlank()}
                        className="w-16 h-10 text-center font-pixel border-2 border-gba-dark rounded"
                        autoFocus
                      />
                      <Button onClick={checkFillBlank} disabled={!inputValue}>
                        Check
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Place value */}
              {puzzle.type === 'place-value-identify' && 'number' in puzzle && (
                <div className="flex flex-col items-center gap-4">
                  <span className="font-pixel text-3xl tracking-widest">{puzzle.number}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkFillBlank()}
                      className="w-16 h-10 text-center font-pixel border-2 border-gba-dark rounded"
                      autoFocus
                    />
                    <Button onClick={checkFillBlank} disabled={!inputValue}>
                      Check
                    </Button>
                  </div>
                </div>
              )}

              {/* Fraction visual */}
              {puzzle.type === 'fraction-visual' && 'fraction' in puzzle && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-1">
                    {Array.from({ length: puzzle.fraction.denominator }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-8 h-12 border-2 border-gba-dark rounded',
                          i < puzzle.fraction.numerator ? 'bg-pokemon-blue' : 'bg-white'
                        )}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {['1/2', '1/3', '1/4', '2/3', '3/4'].slice(0, 4).map((option) => (
                      <Button
                        key={option}
                        variant="secondary"
                        size="sm"
                        onClick={() => checkMultipleChoice(option)}
                        disabled={disabledOptions.has(option) || feedback?.type === 'success'}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Word problem */}
              {puzzle.type === 'word-problem' && 'options' in puzzle && (
                <div className="grid grid-cols-2 gap-3">
                  {puzzle.options.map((option) => (
                    <Button
                      key={option}
                      variant="secondary"
                      onClick={() => checkMultipleChoice(parseInt(String(option), 10))}
                      disabled={disabledOptions.has(option) || feedback?.type === 'success'}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </Panel>
          </motion.div>
        </AnimatePresence>

        {/* Feedback message */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                'mt-4 px-4 py-2 rounded-full font-pixel text-xs',
                feedback.type === 'success' && 'bg-success text-white',
                feedback.type === 'error' && 'bg-error text-white'
              )}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wild Pokemon encounter alert */}
      <AnimatePresence>
        {pendingEncounter && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4"
          >
            <Panel className="text-center p-4" variant="dark">
              <p className="font-pixel text-xs mb-3">A wild Pokemon appeared!</p>
              <Button variant="pokeball" onClick={goToEncounter}>
                Go catch it!
              </Button>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PlayScreen;
