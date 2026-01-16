import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  calculateAccuracy,
  TARGET_ZONE_WIDTH,
  PERFECT_ZONE_WIDTH,
} from '../../utils/battleCalc';

interface QuickTimeBarProps {
  onResult: (accuracy: number, rating: 'perfect' | 'near' | 'miss') => void;
  duration?: number; // ms for full sweep (one direction)
  targetCenter?: number; // 0-100, default 50
}

export function QuickTimeBar({
  onResult,
  duration = 1500,
  targetCenter = 50,
}: QuickTimeBarProps) {
  const { t } = useTranslation();
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = right, -1 = left
  const [stopped, setStopped] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Animation loop
  useEffect(() => {
    if (stopped) return;

    const speed = 100 / duration; // percent per ms

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setPosition((prev) => {
        let newPos = prev + direction * speed * delta;

        // Bounce at edges
        if (newPos >= 100) {
          newPos = 100;
          setDirection(-1);
        } else if (newPos <= 0) {
          newPos = 0;
          setDirection(1);
        }

        return newPos;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stopped, direction, duration]);

  // Handle tap/click
  const handleTap = useCallback(() => {
    if (stopped) return;

    setStopped(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const result = calculateAccuracy(position, targetCenter);
    onResult(result.accuracy, result.rating);
  }, [stopped, position, targetCenter, onResult]);

  // Calculate zone positions
  const targetStart = targetCenter - (TARGET_ZONE_WIDTH * 100) / 2;
  const targetWidth = TARGET_ZONE_WIDTH * 100;
  const perfectStart = targetCenter - (PERFECT_ZONE_WIDTH * 100) / 2;
  const perfectWidth = PERFECT_ZONE_WIDTH * 100;

  return (
    <div className="w-full px-4">
      <p className="text-center text-white text-sm mb-2 pixel-font">
        {t('battle.fight.tapNow')}
      </p>

      {/* Quick-time bar container */}
      <div
        className="relative h-12 bg-slate-800 rounded-lg border-4 border-slate-600 overflow-hidden cursor-pointer"
        onClick={handleTap}
        onTouchStart={(e) => {
          e.preventDefault();
          handleTap();
        }}
      >
        {/* Miss zone (full bar background) */}
        <div className="absolute inset-0 bg-red-600/50" />

        {/* Target zone (near) */}
        <div
          className="absolute top-0 bottom-0 bg-yellow-500/70"
          style={{
            left: `${targetStart}%`,
            width: `${targetWidth}%`,
          }}
        />

        {/* Perfect zone */}
        <div
          className="absolute top-0 bottom-0 bg-green-500"
          style={{
            left: `${perfectStart}%`,
            width: `${perfectWidth}%`,
          }}
        />

        {/* Moving marker */}
        <motion.div
          className="absolute top-0 bottom-0 w-2 bg-white shadow-lg shadow-white/50"
          style={{
            left: `${position}%`,
            transform: 'translateX(-50%)',
          }}
          animate={stopped ? { scale: [1, 1.5, 1] } : {}}
          transition={{ duration: 0.3 }}
        />

        {/* Zone labels */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/50 text-xs pixel-font tracking-wider">
            {stopped ? '' : 'TAP!'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-green-400 pixel-font">100%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded" />
          <span className="text-yellow-400 pixel-font">50%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-red-400 pixel-font">20%</span>
        </div>
      </div>
    </div>
  );
}
