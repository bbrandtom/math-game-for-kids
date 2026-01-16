import { motion } from 'framer-motion';
import type { Attack } from '../../stores/types';

interface AttackButtonProps {
  attack: Attack;
  currentLevel: number;
  onSelect: () => void;
  disabled?: boolean;
}

export function AttackButton({
  attack,
  currentLevel,
  onSelect,
  disabled = false,
}: AttackButtonProps) {
  const isLocked = currentLevel < attack.unlockLevel;
  const isDisabled = disabled || isLocked;

  return (
    <motion.button
      className={`
        w-full p-3 rounded-lg border-4 transition-colors
        ${
          isDisabled
            ? 'bg-slate-700 border-slate-600 cursor-not-allowed opacity-60'
            : 'bg-blue-600 border-blue-400 hover:bg-blue-500 active:bg-blue-700'
        }
      `}
      onClick={onSelect}
      disabled={isDisabled}
      whileTap={isDisabled ? {} : { scale: 0.95 }}
    >
      <div className="flex justify-between items-center">
        <span
          className={`pixel-font text-sm ${
            isDisabled ? 'text-slate-400' : 'text-white'
          }`}
        >
          {isLocked ? '???' : attack.name}
        </span>
        <div className="flex items-center gap-2">
          {isLocked ? (
            <span className="text-xs text-slate-400 pixel-font">
              Lv.{attack.unlockLevel}
            </span>
          ) : (
            <span className="text-yellow-300 pixel-font text-sm">
              {attack.damage}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

interface AttackListProps {
  attacks: Attack[];
  currentLevel: number;
  onSelectAttack: (attack: Attack) => void;
  disabled?: boolean;
}

export function AttackList({
  attacks,
  currentLevel,
  onSelectAttack,
  disabled = false,
}: AttackListProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {attacks.map((attack) => (
        <AttackButton
          key={attack.name}
          attack={attack}
          currentLevel={currentLevel}
          onSelect={() => onSelectAttack(attack)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
