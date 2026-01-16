import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import GameAudio from '../../utils/audio';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'pokeball';
  size?: 'sm' | 'md' | 'lg';
  playSound?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', playSound = true, onClick, children, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (playSound) {
        GameAudio.playClick();
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'relative font-pixel uppercase tracking-wide',
          'border-4 border-gba-dark rounded-lg',
          'shadow-[inset_2px_2px_0_rgba(255,255,255,0.5),inset_-2px_-2px_0_rgba(0,0,0,0.2)]',
          'active:translate-y-0.5 active:shadow-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0',
          'transition-transform duration-75',
          'tap-target no-select',

          // Size variants
          {
            'px-3 py-2 text-[10px]': size === 'sm',
            'px-5 py-3 text-xs': size === 'md',
            'px-8 py-4 text-sm': size === 'lg',
          },

          // Color variants
          {
            'bg-pokemon-blue text-white hover:bg-blue-600': variant === 'primary',
            'bg-gba-tan text-gba-dark hover:bg-gba-cream': variant === 'secondary',
            'bg-pokemon-red text-white hover:bg-red-600': variant === 'danger',
            'bg-pokeball-red text-white hover:bg-red-500': variant === 'pokeball',
          },

          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Pokeball-styled play button
export function PokeballButton({
  onClick,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    GameAudio.playClick();
    onClick?.(e);
  };

  return (
    <button
      className={cn(
        'relative w-32 h-32 rounded-full',
        'border-4 border-gba-dark',
        'overflow-hidden',
        'active:scale-95 transition-transform',
        'tap-target no-select',
        'animate-pulse-glow',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {/* Top half - red */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-pokeball-red" />

      {/* Bottom half - white */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-pokeball-white" />

      {/* Center band */}
      <div className="absolute top-1/2 left-0 right-0 h-3 -mt-1.5 bg-gba-dark" />

      {/* Center button */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-pokeball-white border-4 border-gba-dark flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-gba-cream border-2 border-gba-dark" />
      </div>

      {/* Play text */}
      <span className="absolute bottom-6 left-0 right-0 text-center font-pixel text-xs text-gba-dark font-bold">
        PLAY
      </span>
    </button>
  );
}

export default Button;
