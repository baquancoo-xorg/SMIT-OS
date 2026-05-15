import { cn } from '@/ui/lib/cn';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'primary-sheen' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'success';
  size?: 'sm' | 'default' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'default', icon, iconPosition = 'left', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-variant={variant}
        data-size={size}
        className={cn('smit-btn', className)}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="smit-btn-icon">{icon}</span>}
        <span className="smit-btn-label">{children}</span>
        {icon && iconPosition === 'right' && <span className="smit-btn-icon">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
