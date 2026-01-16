import { cn } from '../../utils/cn';
import { getCurrentEvolutionName } from '../../data/pokemon';

interface PokemonSpriteProps {
  pokemonId: string;
  stage?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  silhouette?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-28 h-28',
  xl: 'w-40 h-40',
};

export function PokemonSprite({
  pokemonId,
  stage = 1,
  size = 'md',
  animate = false,
  silhouette = false,
  className,
}: PokemonSpriteProps) {
  const evolutionName = getCurrentEvolutionName(pokemonId, stage);
  const spritePath = `${import.meta.env.BASE_URL}sprites/pokemon/${evolutionName}.png`;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        sizeClasses[size],
        animate && 'animate-bounce-gentle',
        className
      )}
    >
      <img
        src={spritePath}
        alt={evolutionName}
        className={cn(
          'w-full h-full object-contain',
          'pixelated',
          silhouette && 'brightness-0 opacity-50'
        )}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}

// Pokeball count display
export function PokeballCount({
  count,
  size = 'md',
  className,
}: {
  count: number;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        'bg-gba-tan rounded-full px-3 py-1',
        'border-2 border-gba-brown',
        className
      )}
    >
      {/* Mini pokeball icon */}
      <div
        className={cn(
          'relative rounded-full overflow-hidden',
          'border-2 border-gba-dark',
          size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-pokeball-red" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-pokeball-white" />
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -mt-px bg-gba-dark" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white border border-gba-dark" />
      </div>

      <span
        className={cn(
          'font-pixel text-gba-dark',
          size === 'sm' ? 'text-[10px]' : 'text-xs'
        )}
      >
        {count}
      </span>
    </div>
  );
}

// Streak display
export function StreakDisplay({
  streak,
  className,
}: {
  streak: number;
  className?: string;
}) {
  const hasBonus = streak > 0 && streak % 5 === 0;

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        'bg-gba-tan rounded-full px-3 py-1',
        'border-2 border-gba-brown',
        hasBonus && 'animate-pulse-glow border-pokemon-yellow',
        className
      )}
    >
      <span className="text-sm">🔥</span>
      <span className="font-pixel text-[10px] text-gba-dark">{streak}</span>
    </div>
  );
}

export default PokemonSprite;
