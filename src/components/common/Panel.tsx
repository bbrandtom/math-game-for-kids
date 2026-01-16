import { cn } from '../../utils/cn';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'success' | 'error';
}

export function Panel({
  className,
  variant = 'default',
  children,
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        // Base GBA-style panel
        'relative p-4 rounded-lg',
        'border-4 border-gba-dark',
        'shadow-[inset_2px_2px_0_rgba(255,255,255,0.6),inset_-2px_-2px_0_rgba(0,0,0,0.15)]',

        // Variants
        {
          'bg-gba-cream': variant === 'default',
          'bg-gba-dark text-gba-cream': variant === 'dark',
          'bg-success/20 border-success': variant === 'success',
          'bg-error/20 border-error': variant === 'error',
        },

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Dialog box with Pokemon-style corners
export function DialogBox({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative p-5 mx-4',
        'bg-gba-cream',
        'border-4 border-gba-dark rounded-lg',
        'shadow-[4px_4px_0_rgba(0,0,0,0.3)]',
        'font-pixel text-sm leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Stat display panel
export function StatPanel({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2',
        'bg-gba-tan rounded-lg',
        'border-2 border-gba-brown',
        className
      )}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <div className="flex flex-col">
        <span className="font-pixel text-[8px] text-gba-brown uppercase">{label}</span>
        <span className="font-pixel text-sm text-gba-dark">{value}</span>
      </div>
    </div>
  );
}

export default Panel;
