import { CreditCardIcon } from '@heroicons/react/24/solid';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <CreditCardIcon 
        className={`${sizes[size]} text-primary`}
        aria-hidden="true"
      />
      <span className={`font-bold ${
        size === 'sm' ? 'text-xl' :
        size === 'md' ? 'text-2xl' :
        'text-3xl'
      } bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent`}>
        CardStack
      </span>
    </div>
  );
}
