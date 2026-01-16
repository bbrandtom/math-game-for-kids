import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface BattleHPBarProps {
  currentHP: number;
  maxHP: number;
  name: string;
  level?: number;
  showNumbers?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function BattleHPBar({
  currentHP,
  maxHP,
  name,
  level,
  showNumbers = true,
  size = 'medium',
}: BattleHPBarProps) {
  const percentage = useMemo(() => {
    return Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  }, [currentHP, maxHP]);

  // Color based on HP percentage
  const barColor = useMemo(() => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  }, [percentage]);

  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4',
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div className="w-full">
      {/* Name and level */}
      <div className="flex justify-between items-center mb-1">
        <span className={`text-white pixel-font ${textSizes[size]} truncate max-w-[70%]`}>
          {name}
        </span>
        {level !== undefined && (
          <span className={`text-yellow-400 pixel-font ${textSizes[size]}`}>
            Lv.{level}
          </span>
        )}
      </div>

      {/* HP bar container */}
      <div className="relative">
        <div
          className={`w-full ${sizeClasses[size]} bg-slate-700 rounded-full border-2 border-slate-600 overflow-hidden`}
        >
          {/* Animated HP fill */}
          <motion.div
            className={`h-full ${barColor} rounded-full`}
            initial={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* HP label */}
        <div className="absolute right-0 -top-0.5 bg-slate-800 px-1 rounded text-xs">
          <span className="text-slate-300 pixel-font">HP</span>
        </div>
      </div>

      {/* HP numbers */}
      {showNumbers && (
        <div className={`text-right mt-0.5 ${textSizes[size]}`}>
          <span className="text-white pixel-font">{Math.max(0, currentHP)}</span>
          <span className="text-slate-400 pixel-font">/{maxHP}</span>
        </div>
      )}
    </div>
  );
}
